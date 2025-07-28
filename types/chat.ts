export interface PDFChatMessage {
  id: string;
  pdf_id: string;
  user_id: string;
  message: string; // User message, can include selected text context
  response: string | null; // AI response
  selected_text?: string; // Optional: selected text context
  created_at: string;
}