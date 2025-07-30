export interface WritingStyle {
  tone: 'formal' | 'casual' | 'technical' | 'creative';
  complexity: 'simple' | 'moderate' | 'complex';
  sentenceLength: 'short' | 'medium' | 'long';
}

// Helper function to analyze writing style
export function analyzeWritingStyle(content: string): WritingStyle {
  const words = content.split(' ').length;
  const sentences = content.split(/[.!?]+/).filter(s => s.trim()).length;
  const avgSentenceLength = words / sentences;

  // Determine tone based on vocabulary and structure
  const formalWords = ['furthermore', 'moreover', 'consequently', 'therefore', 'thus'];
  const casualWords = ['awesome', 'cool', 'great', 'nice', 'fun'];
  const technicalWords = ['algorithm', 'implementation', 'framework', 'optimization', 'architecture'];

  const formalCount = formalWords.filter(word => content.toLowerCase().includes(word)).length;
  const casualCount = casualWords.filter(word => content.toLowerCase().includes(word)).length;
  const technicalCount = technicalWords.filter(word => content.toLowerCase().includes(word)).length;

  let tone: 'formal' | 'casual' | 'technical' | 'creative' = 'casual';
  if (technicalCount > formalCount && technicalCount > casualCount) {
    tone = 'technical';
  } else if (formalCount > casualCount) {
    tone = 'formal';
  } else if (content.includes('!') || content.includes('😊') || content.includes('amazing')) {
    tone = 'creative';
  }

  // Determine complexity
  let complexity: 'simple' | 'moderate' | 'complex' = 'moderate';
  if (avgSentenceLength < 10) {
    complexity = 'simple';
  } else if (avgSentenceLength > 20) {
    complexity = 'complex';
  }

  // Determine sentence length preference
  let sentenceLength: 'short' | 'medium' | 'long' = 'medium';
  if (avgSentenceLength < 8) {
    sentenceLength = 'short';
  } else if (avgSentenceLength > 15) {
    sentenceLength = 'long';
  }

  return { tone, complexity, sentenceLength };
}