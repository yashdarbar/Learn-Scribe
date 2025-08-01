"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCcw, X, Eye, EyeOff, Save, Loader2 } from "lucide-react";
import { Flashcard, saveFlashcardSetWithAuth } from "@/lib/actions/flashcard-actions";
import toast from "react-hot-toast";

interface FlashcardStudyViewProps {
  flashcards: Flashcard[];
  onClose: () => void;
  title?: string;
  pdfId?: string;
  pageNumber?: number;
  content?: string;
  isSaved?: boolean;
  onSaved?: () => void;
}

export const FlashcardStudyView: React.FC<FlashcardStudyViewProps> = ({
  flashcards,
  onClose,
  title = "Flashcard Study",
  pdfId,
  pageNumber,
  content,
  isSaved = false,
  onSaved
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showProgress, setShowProgress] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveTitle, setSaveTitle] = useState(title);
  const [localIsSaved, setLocalIsSaved] = useState(isSaved);

  // Update localIsSaved when isSaved prop changes
  useEffect(() => {
    console.log("FlashcardStudyView: isSaved prop changed to:", isSaved);
    setLocalIsSaved(isSaved);
  }, [isSaved]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    }
  };

  const handleFlip = () => {
    setShowAnswer(!showAnswer);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
  };

  const handleSaveSet = async () => {
    if (localIsSaved) {
      console.log("Flashcards are already saved");
      return;
    }

    if (!pdfId || !pageNumber) {
      console.error("Missing pdfId or pageNumber for saving");
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveFlashcardSetWithAuth(
        flashcards,
        saveTitle,
        pdfId,
        pageNumber,
        content || ""
      );

      if (result.success) {
        // ✅ NEW: Show success toast
        toast.success("Saved to My sets");

        console.log("Flashcard set saved successfully!");
        setLocalIsSaved(true);
        // Don't close the study view, just mark as saved
        // The button will show "Saved" now
        onSaved?.();
      } else {
        console.error("Failed to save flashcard set:", result.error);
      }
    } catch (err) {
      console.error("Failed to save flashcard set:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const progress = ((currentIndex + 1) / flashcards.length) * 100;
  const isLastCard = currentIndex === flashcards.length - 1;

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-4xl mx-auto">
        {/* ✅ UPDATED: Responsive Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="text-white">
            <h2 className="text-lg sm:text-xl font-semibold">{title}</h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1 sm:mt-2">
              <span className="text-xs sm:text-sm text-gray-400">
                Card {currentIndex + 1} of {flashcards.length}
              </span>
              {showProgress && (
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="w-20 sm:w-32 h-1.5 sm:h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">{Math.round(progress)}%</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setShowProgress(!showProgress)}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 transition text-gray-400 hover:text-white"
              title={showProgress ? "Hide progress" : "Show progress"}
            >
              {showProgress ? <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" /> : <Eye className="w-3 h-3 sm:w-4 sm:h-4" />}
            </button>
            <button
              onClick={handleReset}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 transition text-gray-400 hover:text-white"
              title="Reset to first card"
            >
              <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 transition text-gray-400 hover:text-white"
              title="Close study mode"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* ✅ UPDATED: Responsive Flashcard */}
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          <div
            className="bg-black/40 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-8 min-h-[300px] sm:min-h-[400px] cursor-pointer group"
            onClick={handleFlip}
          >
            <div className="text-center h-full flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {!showAnswer ? (
                  <motion.div
                    key="question"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 sm:space-y-6"
                  >
                    <div className="text-xs sm:text-sm text-purple-400 font-medium">QUESTION</div>
                    <p className="text-lg sm:text-2xl text-white leading-relaxed px-2 sm:px-0">
                      {flashcards[currentIndex].question}
                    </p>
                    <div className="text-xs sm:text-sm text-gray-400 mt-4 sm:mt-8">
                      Click to reveal answer
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="answer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 sm:space-y-6"
                  >
                    <div className="text-xs sm:text-sm text-green-400 font-medium">ANSWER</div>
                    <p className="text-base sm:text-xl text-white leading-relaxed px-2 sm:px-0">
                      {flashcards[currentIndex].answer}
                    </p>
                    <div className="flex items-center justify-center gap-2 sm:gap-4 mt-4 sm:mt-8">
                      <span className="text-xs bg-purple-600/50 text-purple-200 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                        {flashcards[currentIndex].difficulty_level || 'medium'}
                      </span>
                      {/* <span className="text-xs bg-blue-600/50 text-blue-200 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                        {flashcards[currentIndex].card_type || 'qa'}
                      </span> */}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* ✅ UPDATED: Responsive Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 mt-6 sm:mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-white rounded-lg font-medium text-xs sm:text-sm"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </button>

          <button
            onClick={handleFlip}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-purple-600 hover:bg-purple-700 transition text-white rounded-lg font-medium text-xs sm:text-sm"
          >
            {showAnswer ? "Show Question" : "Show Answer"}
          </button>

          {isLastCard ? (
            <button
              onClick={handleSaveSet}
              disabled={isSaving || localIsSaved}
              className={`w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 transition text-white rounded-lg font-medium text-xs sm:text-sm ${
                localIsSaved
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  <span className="hidden sm:inline">Saving...</span>
                  <span className="sm:hidden">Save...</span>
                </>
              ) : localIsSaved ? (
                <>
                  <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Saved</span>
                  <span className="sm:hidden">Saved</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Save Set</span>
                  <span className="sm:hidden">Save</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-600 hover:bg-gray-700 transition text-white rounded-lg font-medium text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">Next</span>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>

        {/* ✅ UPDATED: Responsive Keyboard shortcuts hint */}
        <div className="text-center mt-4 sm:mt-6">
          <p className="text-xs text-gray-500">
            Use ← → arrow keys to navigate, Space to flip card
          </p>
        </div>
      </div>
    </div>
  );
};

export default FlashcardStudyView;