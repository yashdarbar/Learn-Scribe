"use server";
import { createClient } from "@/utils/supabase/server";
import { getGeminiClient } from "@/lib/gemini/client";

// Main interfaces
export interface QuizQuestion {
  id?: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  difficulty_level: 'easy' | 'medium' | 'hard';
  explanation?: string;
  card_order?: number;
}

export interface QuizSet {
  id: string;
  title: string;
  description?: string;
  page_number?: number;
  source_content?: string;
  quiz_questions?: QuizQuestion[];
  created_at: string;
  updated_at: string;
}

export interface QuizAttempt {
  id: string;
  score: number;
  total_questions: number;
  percentage: number;
  time_taken?: number;
  answers: Record<string, string>;
  completed_at: string;
}

// Generate quiz questions using Gemini AI
export async function generateQuizWithAuth(content: string, pdfId: string, pageNumber: number) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required" };
    }

    const geminiClient = getGeminiClient();
    const model = geminiClient.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Generate exactly 5 multiple choice quiz questions from the following content.
Return ONLY a valid JSON object with no markdown formatting, code blocks, or additional text.

Format: {
  "quiz_title": "A concise, descriptive title for this quiz based on the content",
  "quiz_questions": [
    {
      "question": "What is the main topic discussed?",
      "option_a": "Option A text",
      "option_b": "Option B text",
      "option_c": "Option C text",
      "option_d": "Option D text",
      "correct_answer": "A",
      "difficulty_level": "medium",
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}

Content: ${content}

Requirements:
- Generate a descriptive quiz title (3-8 words) based on the main topic
- Exactly 5 multiple choice questions
- Each question must have 4 distinct options (A, B, C, D)
- One correct answer per question (A, B, C, or D)
- Mix of difficulty levels (easy, medium, hard)
- Clear, specific questions based on the content
- Brief explanations for correct answers
- Return only the JSON object, no other text or formatting`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response with robust error handling
    let quizData: { quiz_title: string; quiz_questions: QuizQuestion[] };
    try {
      let cleanedText = text.trim();

      // Remove various markdown code block formats
      const codeBlockRegex = /^```(?:json)?\s*([\s\S]*?)\s*```$/;
      const match = cleanedText.match(codeBlockRegex);

      if (match) {
        cleanedText = match[1].trim();
      }

      // Remove any remaining backticks
      cleanedText = cleanedText.replace(/^`+|`+$/g, '').trim();

      // Parse the cleaned JSON
      quizData = JSON.parse(cleanedText);

      // Validate the structure
      if (!quizData.quiz_questions || !Array.isArray(quizData.quiz_questions)) {
        throw new Error("Invalid quiz questions format");
      }

      // Validate each question
      for (const question of quizData.quiz_questions) {
        if (!question.question || !question.option_a || !question.option_b ||
            !question.option_c || !question.option_d || !question.correct_answer ||
            !question.difficulty_level) {
          throw new Error("Invalid question format");
        }

        // Validate correct answer
        if (!['A', 'B', 'C', 'D'].includes(question.correct_answer)) {
          throw new Error("Invalid correct answer");
        }

        // Validate difficulty level
        if (!['easy', 'medium', 'hard'].includes(question.difficulty_level)) {
          throw new Error("Invalid difficulty level");
        }
      }

      return {
        success: true,
        quiz_questions: quizData.quiz_questions,
        quiz_title: quizData.quiz_title || `Quiz - Page ${pageNumber}`
      };

    } catch (parseError) {
      console.error("❌ Quiz generation parse error:", parseError);
      console.error("Raw response:", text);
      return {
        success: false,
        error: "Failed to parse quiz questions. Please try again."
      };
    }

  } catch (error) {
    console.error("❌ Quiz generation error:", error);
    return {
      success: false,
      error: "Failed to generate quiz questions. Please try again."
    };
  }
}

// Save quiz set to database
export async function saveQuizSetWithAuth(questions: QuizQuestion[], title: string, pdfId: string, pageNumber: number, sourceContent: string) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required" };
    }

    // Insert quiz set
    const { data: quizSet, error: setError } = await supabase
      .from('quiz_sets')
      .insert({
        user_id: user.id,
        pdf_id: pdfId,
        title: title,
        page_number: pageNumber,
        source_content: sourceContent,
        is_saved: true
      })
      .select()
      .single();

    if (setError) {
      console.error('Error saving quiz set:', setError);
      return { success: false, error: "Failed to save quiz set" };
    }

    // Insert quiz questions
    const questionsToInsert = questions.map((question, index) => ({
      quiz_set_id: quizSet.id,
      question: question.question,
      option_a: question.option_a,
      option_b: question.option_b,
      option_c: question.option_c,
      option_d: question.option_d,
      correct_answer: question.correct_answer,
      difficulty_level: question.difficulty_level,
      explanation: question.explanation,
      card_order: index + 1,
      card_type: 'multiple_choice'
    }));

    const { error: questionsError } = await supabase
      .from('quiz_questions')
      .insert(questionsToInsert);

    if (questionsError) {
      console.error('Error saving quiz questions:', questionsError);
      return { success: false, error: "Failed to save quiz questions" };
    }

    return { success: true, quiz_set_id: quizSet.id };

  } catch (error) {
    console.error('Error in saveQuizSetWithAuth:', error);
    return {
      success: false,
      error: "Failed to save quiz set"
    };
  }
}

// Get user's quiz sets for a PDF
export async function getUserQuizSetsWithAuth(pdfId: string) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required" };
    }

    // Get quiz sets with questions
    const { data: quizSets, error: setsError } = await supabase
      .from('quiz_sets')
      .select(`
        *,
        quiz_questions (*)
      `)
      .eq('user_id', user.id)
      .eq('pdf_id', pdfId)
      .eq('is_saved', true)
      .order('created_at', { ascending: false });

    if (setsError) {
      console.error('Error fetching quiz sets:', setsError);
      return { success: false, error: "Failed to fetch quiz sets" };
    }

    return {
      success: true,
      quiz_sets: quizSets || []
    };

  } catch (error) {
    console.error('Error in getUserQuizSetsWithAuth:', error);
    return {
      success: false,
      error: "Failed to fetch quiz sets"
    };
  }
}

// Delete quiz set
export async function deleteQuizSetWithAuth(quizSetId: string) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required" };
    }

    // Delete quiz questions first (due to foreign key constraint)
    const { error: questionsError } = await supabase
      .from('quiz_questions')
      .delete()
      .eq('quiz_set_id', quizSetId);

    if (questionsError) {
      console.error('Error deleting quiz questions:', questionsError);
      return { success: false, error: "Failed to delete quiz questions" };
    }

    // Delete quiz set
    const { error: setError } = await supabase
      .from('quiz_sets')
      .delete()
      .eq('id', quizSetId)
      .eq('user_id', user.id);

    if (setError) {
      console.error('Error deleting quiz set:', setError);
      return { success: false, error: "Failed to delete quiz set" };
    }

    return { success: true };

  } catch (error) {
    console.error('Error in deleteQuizSetWithAuth:', error);
    return {
      success: false,
      error: "Failed to delete quiz set"
    };
  }
}

// Save quiz attempt
export async function saveQuizAttemptWithAuth(quizSetId: string, score: number, totalQuestions: number, timeTaken: number, answers: Record<string, string>) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required" };
    }

    const percentage = (score / totalQuestions) * 100;

    const { data: attempt, error: attemptError } = await supabase
      .from('quiz_attempts')
      .insert({
        user_id: user.id,
        quiz_set_id: quizSetId,
        score: score,
        total_questions: totalQuestions,
        time_taken: timeTaken,
        answers: answers
      })
      .select()
      .single();

    if (attemptError) {
      console.error('Error saving quiz attempt:', attemptError);
      return { success: false, error: "Failed to save quiz attempt" };
    }

    return {
      success: true,
      attempt_id: attempt.id,
      percentage: percentage
    };

  } catch (error) {
    console.error('Error in saveQuizAttemptWithAuth:', error);
    return {
      success: false,
      error: "Failed to save quiz attempt"
    };
  }
}