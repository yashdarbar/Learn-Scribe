// Prompt templates for Gemini PDF chat

export function explainSelectedTextPrompt(selectedText: string, docTitle?: string) {
  return `Explain the following text from the PDF${docTitle ? ` titled '${docTitle}'` : ''}:
"""
${selectedText}
"""`;
}

export function summarizeSelectedTextPrompt(selectedText: string, docTitle?: string) {
  return `Summarize the following text from the PDF${docTitle ? ` titled '${docTitle}'` : ''}:
"""
${selectedText}
"""`;
}

export function askQuestionPrompt(question: string, selectedText?: string, docTitle?: string) {
  let context = selectedText ? `Context from PDF${docTitle ? ` '${docTitle}'` : ''}:
"""
${selectedText}
"""
` : '';
  return `${context}User question: ${question}`;
}