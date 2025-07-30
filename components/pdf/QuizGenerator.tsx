"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Save, Sparkles, BookOpen, X, Play, CheckCircle, XCircle } from "lucide-react";
import { generateQuizWithAuth, saveQuizSetWithAuth, QuizQuestion } from "@/lib/actions/quiz-actions";
import QuizTakeView from "./QuizTakeView";

interface QuizGeneratorProps {
  pdfId: string;
  pageNumber: number;
  docTitle?: string;
  selectedText?: string;
  chatAction?: 'add' | 'explain' | 'summarize';
  onClearSelectedText?: () => void;
}

// ✅ UPDATED: Responsive Quiz Preview Component
const QuizPreview: React.FC<{
  questions: QuizQuestion[];
  onSave: (title: string) => void;
  onClose: () => void;
  isSaving: boolean;
  onTakeQuiz: () => void;
}> = ({ questions, onSave, onClose, isSaving, onTakeQuiz }) => {
  const [title, setTitle] = useState("");

  const handleSave = () => {
    if (title.trim()) {
      onSave(title.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3 sm:space-y-4 mt-3 sm:mt-4"
    >
      {/* ✅ UPDATED: Responsive Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-semibold text-white">Generated Quiz Questions</h3>
        <button
          onClick={onClose}
          className="p-1 sm:p-1.5 rounded hover:bg-white/10 transition"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
        </button>
      </div>

      {/* ✅ UPDATED: Responsive Questions List */}
      <div className="space-y-2 sm:space-y-3 max-h-32 sm:max-h-48 overflow-y-auto custom-scrollbar">
        {questions.map((question, index) => (
          <div
            key={index}
            className="bg-black/20 border border-white/10 rounded-lg p-2 sm:p-3"
          >
            <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
              <span className="text-xs bg-purple-600/50 text-purple-200 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                Question {index + 1}
              </span>
              <span className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded ${
                question.difficulty_level === 'easy' ? 'bg-green-600/50 text-green-200' :
                question.difficulty_level === 'medium' ? 'bg-yellow-600/50 text-yellow-200' :
                'bg-red-600/50 text-red-200'
              }`}>
                {question.difficulty_level}
              </span>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <div>
                <span className="text-xs font-medium text-purple-300">Q:</span>
                <p className="text-white text-xs mt-0.5 sm:mt-1 line-clamp-2">{question.question}</p>
              </div>

              <div className="space-y-0.5 sm:space-y-1">
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex items-center justify-center text-xs font-medium bg-gray-600 text-gray-300">
                    A
                  </span>
                  <span className="text-gray-300 text-xs line-clamp-1">{question.option_a}</span>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex items-center justify-center text-xs font-medium bg-gray-600 text-gray-300">
                    B
                  </span>
                  <span className="text-gray-300 text-xs line-clamp-1">{question.option_b}</span>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex items-center justify-center text-xs font-medium bg-gray-600 text-gray-300">
                    C
                  </span>
                  <span className="text-gray-300 text-xs line-clamp-1">{question.option_c}</span>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex items-center justify-center text-xs font-medium bg-gray-600 text-gray-300">
                    D
                  </span>
                  <span className="text-gray-300 text-xs line-clamp-1">{question.option_d}</span>
                </div>
              </div>

              <div className="mt-1 sm:mt-2 p-1.5 sm:p-2 bg-blue-900/20 border border-blue-500/20 rounded text-xs text-blue-200">
                <span className="font-medium">💡 Hint:</span> Take the quiz to see explanations and correct answers!
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ UPDATED: Responsive Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={onTakeQuiz}
          className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-green-600 hover:bg-green-700 transition text-white rounded-lg font-medium text-xs sm:text-sm"
        >
          <Play className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Take Quiz Now</span>
          <span className="sm:hidden">Take Quiz</span>
        </button>
        <button
          onClick={handleSave}
          disabled={!title.trim() || isSaving}
          className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition text-white rounded-lg font-medium text-xs sm:text-sm"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
              <span className="hidden sm:inline">Saving...</span>
              <span className="sm:hidden">Save...</span>
            </>
          ) : (
            <>
              <Save className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Save Quiz</span>
              <span className="sm:hidden">Save</span>
            </>
          )}
        </button>
      </div>

      {/* ✅ UPDATED: Responsive Input */}
      <div className="space-y-1">
        <label className="text-xs text-gray-300">Quiz Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a title for this quiz..."
          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-black/40 border border-white/10 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 text-xs sm:text-sm"
        />
      </div>
    </motion.div>
  );
};

export const QuizGenerator: React.FC<QuizGeneratorProps> = ({
  pdfId,
  pageNumber,
  docTitle,
  selectedText,
  chatAction,
  onClearSelectedText
}) => {
  const [content, setContent] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [quizMode, setQuizMode] = useState<{ isOpen: boolean; questions: QuizQuestion[]; title: string; quizSetId?: string }>({
    isOpen: false,
    questions: [],
    title: "",
    quizSetId: undefined
  });

  // ✅ NEW: Handle selectedText prop for context-aware text selection
  useEffect(() => {
    if (selectedText && selectedText.trim()) {
      setContent(selectedText.trim());
      // Focus the textarea after setting content
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(selectedText.length, selectedText.length);
      }
      // Call the callback to clear the selected text
      if (onClearSelectedText) {
        onClearSelectedText();
      }
    }
  }, [selectedText, onClearSelectedText]);

  // ✅ UPDATED: Responsive auto-resize functionality
  const handleTextareaResize = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(Math.max(textarea.scrollHeight, 80), window.innerWidth < 768 ? 200 : 300);
      textarea.style.height = newHeight + 'px';
    }
  }, []);

  // Handle content change with auto-resize
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    handleTextareaResize();
  };

  const handleGenerate = async () => {
    if (!content.trim()) {
      setError("Please enter some content to generate quiz questions from.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateQuizWithAuth(content, pdfId, pageNumber);

      if (result.success && result.quiz_questions) {
        setQuestions(result.quiz_questions);
        setShowPreview(true);
      } else {
        setError(result.error || "Failed to generate quiz questions");
      }
    } catch (err) {
      setError("Failed to generate quiz questions. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (title: string) => {
    setIsSaving(true);
    setError(null);

    try {
      const result = await saveQuizSetWithAuth(
        questions,
        title,
        pdfId,
        pageNumber,
        content
      );

      if (result.success) {
        // Clear form and show success
        setContent("");
        setQuestions([]);
        setShowPreview(false);
        // Reset textarea height
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
        // You could add a success toast here
        console.log("Quiz set saved successfully!");
      } else {
        setError(result.error || "Failed to save quiz set");
      }
    } catch (err) {
      setError("Failed to save quiz set. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setQuestions([]);
  };

  const handleTakeQuiz = () => {
    if (questions.length > 0) {
      setQuizMode({
        isOpen: true,
        questions: questions,
        title: `Generated Quiz - ${docTitle || 'PDF'}`,
        quizSetId: undefined // No quiz set ID for temporary quizzes
      });
    }
  };

  const closeQuizMode = () => {
    setQuizMode({
      isOpen: false,
      questions: [],
      title: "",
      quizSetId: undefined
    });
  };

  return (
    <div className="flex flex-col h-full space-y-3 sm:space-y-4">
      {/* ✅ UPDATED: Responsive Header */}
      <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
        <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
        <h3 className="text-base sm:text-lg font-semibold text-white">Generate Quiz</h3>
      </div>

      {!showPreview ? (
        <>
          {/* ✅ UPDATED: Responsive Content Area */}
          <div className="flex-1 flex flex-col space-y-3 sm:space-y-4">
            {/* ✅ UPDATED: Responsive Content Input with Clear Button */}
            <div className="flex-1 flex flex-col space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm text-gray-300">
                Paste page content to generate quiz questions from:
              </label>
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={handleContentChange}
                  disabled={isGenerating}
                  placeholder="Paste the page content here... The AI will generate 5 multiple choice questions covering key concepts, facts, and applications from this content."
                  className="w-full min-h-[80px] sm:min-h-[120px] max-h-[200px] sm:max-h-[300px] resize-none rounded-lg bg-black/40 border border-white/10 px-2 sm:px-3 py-2 sm:py-3 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 text-xs sm:text-sm transition-all duration-200"
                  maxLength={5000}
                  style={{
                    height: '80px', // Fixed minimum height
                    maxHeight: window.innerWidth < 768 ? '200px' : '300px' // Responsive max height
                  }}
                />
                {content.trim() && (
                  <button
                    onClick={() => setContent("")}
                    className="absolute top-2 right-3 p-1 rounded bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white transition"
                    title="Clear content"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="text-xs text-gray-500 text-right">
                {content.length}/5000 characters
              </div>
            </div>

            {/* ✅ UPDATED: Responsive Error Display */}
            {error && (
              <div className="text-xs sm:text-sm text-red-400 bg-red-900/10 border border-red-500/20 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
                ❌ {error}
              </div>
            )}
          </div>

          {/* ✅ UPDATED: Responsive Generate Button */}
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/10">
            <button
              onClick={handleGenerate}
              disabled={!content.trim() || isGenerating}
              className="w-full flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition text-white rounded-lg font-medium text-xs sm:text-sm"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                  <span className="hidden sm:inline">Generating 5 Quiz Questions...</span>
                  <span className="sm:hidden">Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Generate 5 Quiz Questions</span>
                  <span className="sm:hidden">Generate Quiz</span>
                </>
              )}
            </button>
          </div>
        </>
      ) : (
        <QuizPreview
          questions={questions}
          onSave={handleSave}
          onClose={handleClosePreview}
          isSaving={isSaving}
          onTakeQuiz={handleTakeQuiz}
        />
      )}

      {/* ✅ UPDATED: Responsive Quiz Mode Modal */}
      {quizMode.isOpen && (
        <QuizTakeView
          questions={quizMode.questions}
          onClose={closeQuizMode}
          title={quizMode.title}
          quizSetId={quizMode.quizSetId}
        />
      )}
    </div>
  );
};

export default QuizGenerator;