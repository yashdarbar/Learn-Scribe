"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Clock, CheckCircle, XCircle, Trophy, RotateCcw } from "lucide-react";
import { QuizQuestion } from "@/lib/actions/quiz-actions";
import { saveQuizAttemptWithAuth } from "@/lib/actions/quiz-actions";

interface QuizTakeViewProps {
  questions: QuizQuestion[];
  onClose: () => void;
  title?: string;
  quizSetId?: string;
}

export const QuizTakeView: React.FC<QuizTakeViewProps> = ({
  questions,
  onClose,
  title = "Quiz",
  quizSetId
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [timeStarted, setTimeStarted] = useState<Date | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timer function
  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Start timer function
  const startTimer = () => {
    if (!timerRef.current && timeStarted) {
      timerRef.current = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - timeStarted.getTime()) / 1000));
      }, 1000);
    }
  };

  // Start timer when component mounts
  useEffect(() => {
    setTimeStarted(new Date());
    return () => {
      clearTimer();
    };
  }, []);

  // Update timer every second
  useEffect(() => {
    if (timeStarted && !showResults) {
      startTimer();
    }

    return () => {
      clearTimer();
    };
  }, [timeStarted, showResults]);

  // Stop timer when results are shown
  useEffect(() => {
    if (showResults) {
      clearTimer();
    }
  }, [showResults]);

  const handleAnswerSelect = (answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentIndex.toString()]: answer
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    // Stop timer immediately on submit
    clearTimer();
    setIsSubmitting(true);

    try {
      // Calculate score
      let score = 0;
      questions.forEach((question, index) => {
        const userAnswer = answers[index.toString()];
        if (userAnswer === question.correct_answer) {
          score++;
        }
      });

      // Only save attempt if we have a real quiz set ID (not temporary quiz)
      if (quizSetId && quizSetId !== 'temp-quiz-id') {
        const result = await saveQuizAttemptWithAuth(
          quizSetId,
          score,
          questions.length,
          timeElapsed,
          answers
        );

        if (!result.success) {
          console.error('Failed to save quiz attempt:', result.error);
        }
      }

      // Always show results regardless of save success
      setShowResults(true);
    } catch (error) {
      console.error('Error saving quiz attempt:', error);
      // Still show results even if save fails
      setShowResults(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetake = () => {
    setCurrentIndex(0);
    setAnswers({});
    setShowResults(false);
    setTimeStarted(new Date());
    setTimeElapsed(0);
    // Restart timer for retake
    setTimeout(() => {
      startTimer();
    }, 100);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((question, index) => {
      const userAnswer = answers[index.toString()];
      if (userAnswer === question.correct_answer) {
        score++;
      }
    });
    return { score, percentage: Math.round((score / questions.length) * 100) };
  };

  const { score, percentage } = calculateScore();

  if (showResults) {
    return (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex flex-col p-2 sm:p-4">
        <div className="w-full max-w-4xl mx-auto flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6 flex-shrink-0">
            <div className="text-white">
              <h2 className="text-lg sm:text-xl font-semibold">Quiz Results</h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                <span className="text-sm text-gray-400">
                  {title}
                </span>
                <span className="text-sm text-gray-400">
                  Time: {formatTime(timeElapsed)}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white p-2">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Results Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/40 border border-white/10 rounded-xl p-4 sm:p-8 mb-4 sm:mb-6 flex-shrink-0"
          >
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                {score}/{questions.length} Correct
              </h3>
              <p className="text-2xl sm:text-3xl font-bold text-purple-400 mb-4">
                {percentage}%
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-sm text-gray-400">
                <span>Time: {formatTime(timeElapsed)}</span>
                <span className="hidden sm:inline">•</span>
                <span>{questions.length} Questions</span>
              </div>
            </div>
          </motion.div>

          {/* Question Review */}
          <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
            {questions.map((question, index) => {
              const userAnswer = answers[index.toString()];
              const isCorrect = userAnswer === question.correct_answer;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-black/20 border rounded-lg p-3 sm:p-4 ${
                    isCorrect ? 'border-green-500/30' : 'border-red-500/30'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <span className="text-xs bg-purple-600/50 text-purple-200 px-2 py-1 rounded">
                      Question {index + 1}
                    </span>
                    {isCorrect ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <span className="text-sm font-medium text-purple-300">Q:</span>
                      <p className="text-white text-sm mt-1 leading-relaxed">{question.question}</p>
                    </div>

                    <div className="space-y-1 sm:space-y-2">
                      {['A', 'B', 'C', 'D'].map((option) => {
                        const optionText = question[`option_${option.toLowerCase()}` as keyof QuizQuestion] as string;
                        const isSelected = userAnswer === option;
                        const isCorrectAnswer = question.correct_answer === option;

                        return (
                          <div
                            key={option}
                            className={`flex items-center gap-2 p-2 rounded text-sm ${
                              isCorrectAnswer
                                ? 'bg-green-900/30 border border-green-500/30'
                                : isSelected && !isCorrectAnswer
                                ? 'bg-red-900/30 border border-red-500/30'
                                : 'bg-gray-900/30 border border-gray-500/30'
                            }`}
                          >
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                              isCorrectAnswer
                                ? 'bg-green-600 text-white'
                                : isSelected && !isCorrectAnswer
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-600 text-gray-300'
                            }`}>
                              {option}
                            </span>
                            <span className="text-gray-300 text-sm flex-1">{optionText}</span>
                            {isCorrectAnswer && <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />}
                            {isSelected && !isCorrectAnswer && <XCircle className="w-4 h-4 text-red-400 ml-auto" />}
                          </div>
                        );
                      })}
                    </div>

                    {question.explanation && (
                      <div className="mt-2 sm:mt-3 p-2 bg-blue-900/20 border border-blue-500/20 rounded text-xs text-blue-200">
                        <span className="font-medium">Explanation:</span> {question.explanation}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Action Buttons - Sticky at bottom */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-6 pt-4 border-t border-white/10 bg-black/95 backdrop-blur-sm flex-shrink-0">
            <button
              onClick={handleRetake}
              className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-purple-600 hover:bg-purple-700 transition text-white rounded-lg font-medium text-sm sm:text-base min-h-[44px]"
            >
              <RotateCcw className="w-4 h-4" />
              Retake Quiz
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 sm:px-6 py-3 bg-gray-600 hover:bg-gray-700 transition text-white rounded-lg font-medium text-sm sm:text-base min-h-[44px]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-4xl mx-auto max-h-screen overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="text-white">
            <h2 className="text-lg sm:text-xl font-semibold">{title}</h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
              <span className="text-sm text-gray-400">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">{formatTime(timeElapsed)}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2 mb-4 sm:mb-6">
          <div
            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question */}
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-black/40 border border-white/10 rounded-2xl p-4 sm:p-8 mb-4 sm:mb-6"
        >
          <div className="space-y-4 sm:space-y-6">
            <div>
              <div className="text-sm text-purple-400 font-medium mb-2">QUESTION {currentIndex + 1}</div>
              <p className="text-lg sm:text-xl text-white leading-relaxed">
                {questions[currentIndex].question}
              </p>
            </div>

            {/* Answer Options */}
            <div className="space-y-2 sm:space-y-3">
              {['A', 'B', 'C', 'D'].map((option) => {
                const optionText = questions[currentIndex][`option_${option.toLowerCase()}` as keyof QuizQuestion] as string;
                const isSelected = answers[currentIndex.toString()] === option;

                return (
                  <button
                    key={option}
                    onClick={() => handleAnswerSelect(option)}
                    className={`w-full flex items-center gap-3 p-3 sm:p-4 rounded-lg border transition-all text-left ${
                      isSelected
                        ? 'bg-purple-600/20 border-purple-500/50 text-white'
                        : 'bg-black/20 border-white/10 text-gray-300 hover:bg-black/30 hover:border-white/20'
                    }`}
                  >
                    <span className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                      isSelected
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-600 text-gray-300'
                    }`}>
                      {option}
                    </span>
                    <span className="flex-1 text-sm sm:text-base">{optionText}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-white rounded-lg font-medium text-sm sm:text-base"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          {currentIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 transition text-white rounded-lg font-medium text-sm sm:text-base"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  Submit Quiz
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!answers[currentIndex.toString()]}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition text-white rounded-lg font-medium text-sm sm:text-base"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizTakeView;