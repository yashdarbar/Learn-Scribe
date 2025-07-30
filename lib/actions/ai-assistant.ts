'use server'

import { getGeminiClient } from '@/lib/gemini/client';
import { WritingStyle } from '@/lib/utils/writing-analysis';

export interface AIWritingContext {
  blockType?: string;
  allBlocks?: string[];
  cursorPosition?: number;
  writingStyle?: WritingStyle;
}

export async function getAIAssistance(
  currentContent: string,
  assistanceType: 'continue' | 'summarize' | 'improve' | 'custom',
  customPrompt?: string,
  context?: AIWritingContext
): Promise<{
  success: boolean;
  content?: string;
  error?: string;
}> {
  try {
    if (!currentContent.trim()) {
      return {
        success: false,
        error: 'No content provided'
      };
    }

    let prompt = '';
    const writingStyle = context?.writingStyle || { tone: 'casual', complexity: 'moderate', sentenceLength: 'medium' };

    switch (assistanceType) {
      case 'continue':
        prompt = `You are a writing assistant. Continue the following text with ONLY new content. Do not repeat the original text.

Original text: "${currentContent}"

Instructions:
- Write ONLY the continuation (1-3 sentences)
- Do NOT repeat any part of the original text
- Start directly with new content
- Ensure it flows naturally from where the original text ended
- Match the existing tone and style (${writingStyle.tone}, ${writingStyle.complexity} complexity)
- Use ${writingStyle.sentenceLength} sentence length

New content only:`;
        break;

      case 'summarize':
        prompt = `Summarize the following content in 1-2 clear, concise sentences while preserving the key points and maintaining the original tone:

"${currentContent}"

Summary:`;
        break;

      case 'improve':
        prompt = `Improve the following text while maintaining its core meaning and the author's voice.

Focus on:
- Grammar and clarity
- Sentence flow and structure
- Word choice and variety
- Maintaining original intent
- Preserving the ${writingStyle.tone} tone

Original text: "${currentContent}"

Improved version:`;
        break;

      case 'custom':
        if (!customPrompt?.trim()) {
          return {
            success: false,
            error: 'Custom prompt is required'
          };
        }
        prompt = `Task: ${customPrompt}

Content to work with: "${currentContent}"

Additional context:
- This is part of a blog post
- Writing style: ${writingStyle.tone}, ${writingStyle.complexity} complexity
- Current block type: ${context?.blockType || 'paragraph'}

Please provide a response that fits naturally with the existing content:`;
        break;
    }

    const geminiClient = getGeminiClient();
    const model = geminiClient.getGenerativeModel({ model: "gemini-1.5-flash" });

    const response = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{
          text: prompt
        }]
      }]
    });

    const content = response.response.text().trim();

    return {
      success: true,
      content: content
    };
  } catch (error) {
    console.error('AI Assistant error:', error);
    return {
      success: false,
      error: 'AI assistant temporarily unavailable'
    };
  }
}