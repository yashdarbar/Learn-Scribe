"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCcw, X, Eye, EyeOff } from "lucide-react";
import { Flashcard } from "@/lib/actions/flashcard-actions";

interface FlashcardStudyViewProps {
  flashcards: Flashcard[];
  onClose: () => void;
  title?: string;
}

export const FlashcardStudyView: React.FC<FlashcardStudyViewProps> = ({
  flashcards,
  onClose,
  title = "Flashcard Study"
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showProgress, setShowProgress] = useState(true);

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

  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-white">
            <h2 className="text-xl font-semibold">{title}</h2>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-sm text-gray-400">
                Card {currentIndex + 1} of {flashcards.length}
              </span>
              {showProgress && (
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowProgress(!showProgress)}
              className="p-2 rounded-lg hover:bg-white/10 transition text-gray-400 hover:text-white"
              title={showProgress ? "Hide progress" : "Show progress"}
            >
              {showProgress ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              onClick={handleReset}
              className="p-2 rounded-lg hover:bg-white/10 transition text-gray-400 hover:text-white"
              title="Reset to first card"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition text-gray-400 hover:text-white"
              title="Close study mode"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Flashcard */}
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          <div
            className="bg-black/40 border border-white/10 rounded-2xl p-8 min-h-[400px] cursor-pointer group"
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
                    className="space-y-6"
                  >
                    <div className="text-sm text-purple-400 font-medium">QUESTION</div>
                    <p className="text-2xl text-white leading-relaxed">
                      {flashcards[currentIndex].question}
                    </p>
                    <div className="text-sm text-gray-400 mt-8">
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
                    className="space-y-6"
                  >
                    <div className="text-sm text-green-400 font-medium">ANSWER</div>
                    <p className="text-xl text-white leading-relaxed">
                      {flashcards[currentIndex].answer}
                    </p>
                    <div className="flex items-center justify-center gap-4 mt-8">
                      <span className="text-xs bg-purple-600/50 text-purple-200 px-2 py-1 rounded">
                        {flashcards[currentIndex].difficulty_level || 'medium'}
                      </span>
                      <span className="text-xs bg-blue-600/50 text-blue-200 px-2 py-1 rounded">
                        {flashcards[currentIndex].card_type || 'qa'}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-white rounded-lg font-medium"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          <button
            onClick={handleFlip}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 transition text-white rounded-lg font-medium"
          >
            {showAnswer ? "Show Question" : "Show Answer"}
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === flashcards.length - 1}
            className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-white rounded-lg font-medium"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            Use ← → arrow keys to navigate, Space to flip card
          </p>
        </div>
      </div>
    </div>
  );
};

export default FlashcardStudyView;