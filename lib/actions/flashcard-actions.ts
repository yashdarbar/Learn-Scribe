"use server";

import { createClient } from "@/utils/supabase/server";
import { getGeminiClient } from "@/lib/gemini/client";

// Types for flashcard data
export interface Flashcard {
  question: string;
  answer: string;
  difficulty_level?: 'easy' | 'medium' | 'hard';
  card_type?: 'qa' | 'true_false' | 'multiple_choice' | 'fill_blank';
}

export interface FlashcardSet {
  id: string;
  title: string;
  description?: string;
  page_number?: number;
  source_content?: string;
  created_at: string;
  flashcards: Flashcard[];
}

// Generate flashcards using Gemini API
export async function generateFlashcardsWithAuth(content: string, pdfId: string, pageNumber: number) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Authentication required"
      };
    }

    const geminiClient = getGeminiClient();
    const model = geminiClient.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Generate exactly 5 flashcards from the following content.
Return ONLY a properly formatted markdown file with no additional text or code blocks.

Format:
# [Flashcard Title]

## Question 1
**Q:** [Question text]

**A:** [Detailed answer with 2-3 lines of descriptive content]

## Question 2
**Q:** [Question text]

**A:** [Detailed answer with 2-3 lines of descriptive content]

[Continue for all 5 questions...]

Content: ${content}

Requirements:
- Generate a descriptive flashcard title (3-8 words) based on the main topic
- Exactly 5 flashcards
- Mix of factual, conceptual, and application questions
- Clear, concise questions
- Detailed, descriptive answers with at least 2-3 lines of content
- Each answer should provide comprehensive explanations, examples, or context
- Return only the markdown formatted content, no other text or formatting`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the markdown response with robust error handling
    let flashcardData: { flashcard_title: string; flashcards: Flashcard[] };
    try {
      let cleanedText = text.trim();

      // Remove various markdown code block formats
      const codeBlockRegex = /^```(?:markdown)?\s*([\s\S]*?)\s*```$/;
      const match = cleanedText.match(codeBlockRegex);

      if (match) {
        cleanedText = match[1].trim();
      }

      // Remove any remaining backticks
      cleanedText = cleanedText.replace(/^`+|`+$/g, '').trim();

      // Parse markdown to extract title and flashcards
      const lines = cleanedText.split('\n');
      let flashcardTitle = `Flashcards - Page ${pageNumber}`;
      const flashcards: Flashcard[] = [];
      let currentQuestion = '';
      let currentAnswer = '';
      let inAnswer = false;
      let questionCount = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Extract title from first # heading
        if (line.startsWith('# ') && !line.startsWith('## ')) {
          flashcardTitle = line.substring(2).trim();
          continue;
        }

        // Start of a new question (## Question X)
        if (line.startsWith('## Question ') || line.startsWith('## ')) {
          // Save previous question if exists
          if (currentQuestion && currentAnswer) {
            flashcards.push({
              question: currentQuestion.trim(),
              answer: currentAnswer.trim(),
              difficulty_level: 'medium',
              card_type: 'qa'
            });
            questionCount++;
          }

          currentQuestion = '';
          currentAnswer = '';
          inAnswer = false;
          continue;
        }

        // Question line
        if (line.startsWith('**Q:**')) {
          currentQuestion = line.substring(6).trim(); // Remove "**Q:**" (6 characters)
          continue;
        }

        // Answer line
        if (line.startsWith('**A:**')) {
          currentAnswer = line.substring(6).trim(); // Remove "**A:**" (6 characters)
          inAnswer = true;
          continue;
        }

        // Continue answer content
        if (inAnswer && line) {
          currentAnswer += '\n' + line;
        }
      }

      // Add the last question
      if (currentQuestion && currentAnswer) {
        flashcards.push({
          question: currentQuestion.trim(),
          answer: currentAnswer.trim(),
          difficulty_level: 'medium',
          card_type: 'qa'
        });
        questionCount++;
      }

      // Validate the response
      if (flashcards.length !== 5) {
        throw new Error(`Expected exactly 5 flashcards, received ${flashcards.length}`);
      }

      // Validate each flashcard structure
      flashcards.forEach((card, index) => {
        if (!card.question || !card.answer) {
          throw new Error(`Flashcard ${index + 1} missing question or answer`);
        }
        if (card.answer.length < 50) {
          throw new Error(`Flashcard ${index + 1} answer is too short. Expected at least 50 characters, got ${card.answer.length}`);
        }
      });

      return {
        success: true,
        flashcards: flashcards,
        flashcard_title: flashcardTitle
      };

    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      console.error('Raw response:', text);
      return {
        success: false,
        error: "Failed to parse flashcard data. Please try again."
      };
    }

  } catch (error) {
    console.error('Flashcard generation error:', error);
    return {
      success: false,
      error: "Failed to generate flashcards. Please try again."
    };
  }
}

// Save flashcard set to database
export async function saveFlashcardSetWithAuth(
  flashcards: Flashcard[],
  title: string,
  pdfId: string,
  pageNumber: number,
  sourceContent: string
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Authentication required"
      };
    }

    // Insert flashcard set
    const { data: setData, error: setError } = await supabase
      .from('flashcard_sets')
      .insert({
        user_id: user.id,
        pdf_id: pdfId,
        title,
        page_number: pageNumber,
        source_content: sourceContent,
        is_saved: true
      })
      .select()
      .single();

    if (setError) {
      console.error('Error saving flashcard set:', setError);
      return {
        success: false,
        error: "Failed to save flashcard set"
      };
    }

    // Insert individual flashcards
    const flashcardData = flashcards.map((card, index) => ({
      flashcard_set_id: setData.id,
      question: card.question,
      answer: card.answer,
      card_order: index + 1,
      difficulty_level: card.difficulty_level || 'medium',
      card_type: card.card_type || 'qa'
    }));

    const { error: cardsError } = await supabase
      .from('flashcards')
      .insert(flashcardData);

    if (cardsError) {
      console.error('Error saving flashcards:', cardsError);
      return {
        success: false,
        error: "Failed to save flashcards"
      };
    }

    return {
      success: true,
      flashcard_set_id: setData.id,
      message: "Flashcard set saved successfully"
    };

  } catch (error) {
    console.error('Error saving flashcard set:', error);
    return {
      success: false,
      error: "Failed to save flashcard set"
    };
  }
}

// Get user's flashcard sets
export async function getUserFlashcardSetsWithAuth(pdfId?: string) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Authentication required"
      };
    }

    let query = supabase
      .from('flashcard_sets')
      .select(`
        id,
        title,
        description,
        page_number,
        source_content,
        created_at,
        updated_at,
        is_saved,
        flashcards (
          id,
          question,
          answer,
          card_order,
          difficulty_level,
          card_type
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (pdfId) {
      query = query.eq('pdf_id', pdfId);
    }

    const { data: sets, error } = await query;

    if (error) {
      console.error('Error fetching flashcard sets:', error);
      return {
        success: false,
        error: "Failed to fetch flashcard sets"
      };
    }

    return {
      success: true,
      flashcard_sets: sets || []
    };

  } catch (error) {
    console.error('Error fetching flashcard sets:', error);
    return {
      success: false,
      error: "Failed to fetch flashcard sets"
    };
  }
}

// Delete flashcard set
export async function deleteFlashcardSetWithAuth(setId: string) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Authentication required"
      };
    }

    const { error } = await supabase
      .from('flashcard_sets')
      .delete()
      .eq('id', setId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting flashcard set:', error);
      return {
        success: false,
        error: "Failed to delete flashcard set"
      };
    }

    return {
      success: true,
      message: "Flashcard set deleted successfully"
    };

  } catch (error) {
    console.error('Error deleting flashcard set:', error);
    return {
      success: false,
      error: "Failed to delete flashcard set"
    };
  }
}