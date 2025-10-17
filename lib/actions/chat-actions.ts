"use server";

import { getGeminiClient } from "../gemini/client";
import { explainSelectedTextPrompt, summarizeSelectedTextPrompt, askQuestionPrompt } from "../gemini/prompts";
import { createClient } from "@/utils/supabase/server";

export async function sendMessageToAI({
  pdfId,
  userId,
  message,
  selectedText,
  docTitle,
  type = "chat",
}: {
  pdfId: string;
  userId: string;
  message: string;
  selectedText?: string;
  docTitle?: string;
  type?: "chat" | "explain" | "summarize";
}) {
  try {
    // Get Gemini client and create appropriate prompt
    const gemini = getGeminiClient();
    let prompt = "";

    if (type === "explain" && selectedText) {
      prompt = explainSelectedTextPrompt(selectedText, docTitle);
    } else if (type === "summarize" && selectedText) {
      prompt = summarizeSelectedTextPrompt(selectedText, docTitle);
    } else {
      prompt = askQuestionPrompt(message, selectedText, docTitle);
    }

    // Generate AI response
    // const model = gemini.getGenerativeModel({
    //   model: type === "chat" ? "gemini-1.5-flash" : "gemini-1.5-pro"
    // });
    const model = gemini.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Save chat message using SSR client
    await saveChatMessage({ pdfId, userId, message, response });

    return { success: true, response };
  } catch (error) {
    console.error('❌ Send message to AI error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export async function saveChatMessage({
  pdfId,
  userId,
  message,
  response,
}: {
  pdfId: string;
  userId: string;
  message: string;
  response: string;
}) {
  try {
    // ✅ Use SSR createClient
    const supabase = await createClient();

    const { error } = await supabase
      .from("pdf_chat_messages")
      .insert([{
        pdf_id: pdfId,
        user_id: userId,
        message,
        response,
        created_at: new Date().toISOString(), // Explicit timestamp
      }]);

    if (error) {
      console.error('❌ Save chat message error:', error);
      throw error;
    }

    console.log('✅ Chat message saved successfully');
  } catch (error) {
    console.error('❌ Save chat message failed:', error);
    throw error;
  }
}

export async function getChatHistory(pdfId: string, userId: string) {
  try {
    // ✅ Use SSR createClient
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("pdf_chat_messages")
      .select("*")
      .eq("pdf_id", pdfId)
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error('❌ Get chat history error:', error);
      throw error;
    }

    console.log('✅ Chat history retrieved:', data?.length || 0, 'messages');
    return data || [];
  } catch (error) {
    console.error('❌ Get chat history failed:', error);
    throw error;
  }
}

// ✅ Additional helper function for getting authenticated user
export async function getAuthenticatedUser() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      throw new Error('User not authenticated');
    }

    return user;
  } catch (error) {
    console.error('❌ Get authenticated user error:', error);
    throw error;
  }
}

// ✅ Enhanced function with authentication check
export async function sendMessageToAIWithAuth({
  pdfId,
  message,
  selectedText,
  docTitle,
  type = "chat",
}: {
  pdfId: string;
  message: string;
  selectedText?: string;
  docTitle?: string;
  type?: "chat" | "explain" | "summarize";
}) {
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser();

    // Call the main function with user ID
    return await sendMessageToAI({
      pdfId,
      userId: user.id,
      message,
      selectedText,
      docTitle,
      type,
    });
  } catch (error) {
    console.error('❌ Send message with auth error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Authentication failed'
    };
  }
}

// ✅ Enhanced function to get chat history with auth
export async function getChatHistoryWithAuth(pdfId: string) {
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser();

    // Get chat history for this user
    return await getChatHistory(pdfId, user.id);
  } catch (error) {
    console.error('❌ Get chat history with auth error:', error);
    throw error;
  }
}

// ✅ ADD: Clear chat history server action
export async function clearChatHistoryWithAuth(pdfId: string) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Authentication required"
      };
    }

    // Delete all chat messages for this PDF
    const { error: deleteError } = await supabase
      .from('pdf_chat_messages')
      .delete()
      .eq('pdf_id', pdfId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error clearing chat history:', deleteError);
      return {
        success: false,
        error: "Failed to clear chat history"
      };
    }

    return {
      success: true,
      message: "Chat history cleared successfully"
    };
  } catch (error) {
    console.error('Error in clearChatHistoryWithAuth:', error);
    return {
      success: false,
      error: "Failed to clear chat history"
    };
  }
}


// import { getGeminiClient } from "../gemini/client";
// import { explainSelectedTextPrompt, summarizeSelectedTextPrompt, askQuestionPrompt } from "../gemini/prompts";
// // import { createClient } from "@supabase/supabase-js";
// import { createClient } from "@/utils/supabase/server";

// // const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// // const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// // const supabase = createClient(supabaseUrl, supabaseAnonKey);

// export async function sendMessageToAI({
//   pdfId,
//   userId,
//   message,
//   selectedText,
//   docTitle,
//   type = "chat",
// }: {
//   pdfId: string;
//   userId: string;
//   message: string;
//   selectedText?: string;
//   docTitle?: string;
//   type?: "chat" | "explain" | "summarize";
// }) {
//   const gemini = getGeminiClient();
//   let prompt = "";
//   if (type === "explain" && selectedText) {
//     prompt = explainSelectedTextPrompt(selectedText, docTitle);
//   } else if (type === "summarize" && selectedText) {
//     prompt = summarizeSelectedTextPrompt(selectedText, docTitle);
//   } else {
//     prompt = askQuestionPrompt(message, selectedText, docTitle);
//   }
//   try {
//     const model = gemini.getGenerativeModel({ model: type === "chat" ? "gemini-1.5-flash" : "gemini-1.5-pro" });
//     const result = await model.generateContent(prompt);
//     const response = result.response.text();
//     await saveChatMessage({ pdfId, userId, message, response });
//     return { success: true, response };
//   } catch (error) {
//     return { success: false, error: error instanceof Error ? error.message : String(error) };
//   }
// }

// export async function saveChatMessage({
//   pdfId,
//   userId,
//   message,
//   response,
// }: {
//   pdfId: string;
//   userId: string;
//   message: string;
//   response: string;
// }) {
//   const { error } = await supabase.from("pdf_chat_messages").insert([
//     { pdf_id: pdfId, user_id: userId, message, response },
//   ]);
//   if (error) throw error;
// }

// export async function getChatHistory(pdfId: string, userId: string) {
//   const { data, error } = await supabase
//     .from("pdf_chat_messages")
//     .select("*")
//     .eq("pdf_id", pdfId)
//     .eq("user_id", userId)
//     .order("created_at", { ascending: true });
//   if (error) throw error;
//   return data;
// }