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
    const model = geminiClient.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Generate exactly 5 flashcards from the following content.
Return ONLY a valid JSON object with no markdown formatting, code blocks, or additional text.

Format: {
  "flashcard_title": "A concise, descriptive title for this flashcard set based on the content",
  "flashcards": [
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."}
  ]
}

Content: ${content}

Requirements:
- Generate a descriptive flashcard title (3-8 words) based on the main topic
- Exactly 5 flashcards
- Mix of factual, conceptual, and application questions
- Clear, concise questions and answers
- Return only the JSON object, no other text or formatting`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response with robust error handling
    let flashcardData: { flashcard_title: string; flashcards: Flashcard[] };
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
      flashcardData = JSON.parse(cleanedText);

      // Validate the structure
      if (!flashcardData.flashcards || !Array.isArray(flashcardData.flashcards)) {
        throw new Error("Invalid flashcards format");
      }

      // Validate the response
      if (flashcardData.flashcards.length !== 5) {
        throw new Error(`Expected exactly 5 flashcards, received ${flashcardData.flashcards.length}`);
      }

      // Validate each flashcard structure
      flashcardData.flashcards.forEach((card, index) => {
        if (!card.question || !card.answer) {
          throw new Error(`Flashcard ${index + 1} missing question or answer`);
        }
      });

      // Add default values for missing properties
      const flashcards = flashcardData.flashcards.map((card, index) => ({
        question: card.question,
        answer: card.answer,
        difficulty_level: card.difficulty_level || 'medium',
        card_type: card.card_type || 'qa',
        card_order: index + 1
      }));

      return {
        success: true,
        flashcards: flashcards,
        flashcard_title: flashcardData.flashcard_title || `Flashcards - Page ${pageNumber}`
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