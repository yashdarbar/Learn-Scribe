"use client";
import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X, Clock, CheckCircle, XCircle, Trophy, RotateCcw } from "lucide-react";
import { QuizQuestion } from "@/lib/actions/quiz-actions";
import { saveQuizAttemptWithAuth } from "@/lib/actions/quiz-actions";
import toast from "react-hot-toast";

interface QuizTakeViewProps {
  questions: QuizQuestion[];
  onClose: () => void;
  title?: string;
  quizSetId?: string;
  pdfId?: string;
  pageNumber?: number;
  docTitle?: string;
  content?: string;
  onSaveQuiz?: (title: string) => Promise<{ success: boolean; error?: string }>;
  isAlreadySaved?: boolean; // NEW: Flag to indicate if quiz is already saved
}

export const QuizTakeView: React.FC<QuizTakeViewProps> = ({
  questions,
  onClose,
  title = "Quiz",
  quizSetId,
  pdfId,
  pageNumber,
  docTitle,
  content,
  onSaveQuiz,
  isAlreadySaved = false
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

      // Save quiz attempt if we have a real quiz set ID (not temporary or saved-quiz-id)
      if (quizSetId && quizSetId !== 'temp-quiz-id' && quizSetId !== 'saved-quiz-id') {
        try {
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
        } catch (error) {
          console.error('Error saving quiz attempt:', error);
          // Don't throw the error, just log it and continue
        }
      }

      // Auto-save the quiz if onSaveQuiz function is provided and quizSetId indicates it's not saved yet
      // Only save if the quiz hasn't been saved before (quizSetId === undefined or 'temp-quiz-id' means it's a temporary quiz)
      // Don't save if quizSetId is 'saved-quiz-id' (already saved)
      if ((quizSetId === undefined || quizSetId === 'temp-quiz-id') && onSaveQuiz && title && !isAlreadySaved) {
        console.log('Auto-saving quiz because quizSetId is undefined or temp-quiz-id');
        try {
          const saveResult = await onSaveQuiz(title);
          if (saveResult.success) {
            // ✅ NEW: Show success toast only if this is the first save
            toast.success("Saved to My sets");
            console.log('Quiz auto-saved successfully!');
          } else {
            console.error('Failed to auto-save quiz:', saveResult.error);
          }
        } catch (error) {
          console.error('Error auto-saving quiz:', error);
        }
      } else {
        console.log('Not auto-saving quiz. quizSetId:', quizSetId, 'onSaveQuiz:', !!onSaveQuiz, 'title:', !!title, 'isAlreadySaved:', isAlreadySaved);
        if (quizSetId === 'saved-quiz-id' || isAlreadySaved) {
          console.log('Quiz is already saved, skipping auto-save');
        }
      }

      // Always show results regardless of save success
      setShowResults(true);
    } catch (error) {
      console.error('Error in quiz submission:', error);
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

  // Helper function to check if all questions are answered
  const areAllQuestionsAnswered = () => {
    return questions.every((_, index) => answers[index.toString()]);
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
          <div className="bg-black/40 border border-white/10 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 flex-shrink-0">
            <div className="text-center">
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-600/20 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    {score}/{questions.length} Correct
                  </h3>
                </div>
              </div>
            </div>
          </div>

          {/* Question Review */}
          <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
            {questions.map((question, index) => {
              const userAnswer = answers[index.toString()];
              const isCorrect = userAnswer === question.correct_answer;

              return (
                <div
                  key={index}
                  // className={`bg-black/20 border rounded-lg p-3 sm:p-4 ${
                  //   isCorrect ? 'border-green-500/30' : 'border-red-500/30'
                  // }`}
                  className="bg-black border border-white/10 rounded-lg p-3 sm:p-4"
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

                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <span className="text-base font-medium text-purple-300">Q:</span>
                      <p className="text-white text-base sm:text-lg mt-2 leading-relaxed">{question.question}</p>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      {/* First row - Options A and B */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        {['A', 'B'].map((option) => {
                          const optionText = question[`option_${option.toLowerCase()}` as keyof QuizQuestion] as string;
                          const isSelected = userAnswer === option;
                          const isCorrectAnswer = question.correct_answer === option;

                          return (
                            <div
                              key={option}
                              className={`flex items-center gap-3 p-3 rounded-lg border text-left ${
                                isCorrectAnswer
                                  ? 'bg-green-900 border-green-500'
                                  : isSelected && !isCorrectAnswer
                                  ? 'bg-red-900 border-red-500'
                                  : 'bg-gray-900/30 border-gray-500/30'
                              }`}
                            >
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                                isCorrectAnswer
                                  ? 'bg-green-600 text-white'
                                  : isSelected && !isCorrectAnswer
                                  ? 'bg-red-600 text-white'
                                  : 'bg-gray-600 text-gray-300'
                              }`}>
                                {option}
                              </span>
                              <span className="text-gray-300 text-sm sm:text-base flex-1">{optionText}</span>
                              {isCorrectAnswer && <CheckCircle className="w-5 h-5 text-green-400 ml-auto flex-shrink-0" />}
                              {isSelected && !isCorrectAnswer && <XCircle className="w-5 h-5 text-red-400 ml-auto flex-shrink-0" />}
                            </div>
                          );
                        })}
                      </div>

                      {/* Second row - Options C and D */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        {['C', 'D'].map((option) => {
                          const optionText = question[`option_${option.toLowerCase()}` as keyof QuizQuestion] as string;
                          const isSelected = userAnswer === option;
                          const isCorrectAnswer = question.correct_answer === option;

                          return (
                            <div
                              key={option}
                              className={`flex items-center gap-3 p-3 rounded-lg border text-left ${
                                isCorrectAnswer
                                  ? 'bg-green-900 border-green-500'
                                  : isSelected && !isCorrectAnswer
                                  ? 'bg-red-900 border-red-500'
                                  : 'bg-gray-900/30 border-gray-500/30'
                              }`}
                            >
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                                isCorrectAnswer
                                  ? 'bg-green-600 text-white'
                                  : isSelected && !isCorrectAnswer
                                  ? 'bg-red-600 text-white'
                                  : 'bg-gray-600 text-gray-300'
                              }`}>
                                {option}
                              </span>
                              <span className="text-gray-300 text-sm sm:text-base flex-1">{optionText}</span>
                              {isCorrectAnswer && <CheckCircle className="w-5 h-5 text-green-400 ml-auto flex-shrink-0" />}
                              {isSelected && !isCorrectAnswer && <XCircle className="w-5 h-5 text-red-400 ml-auto flex-shrink-0" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {question.explanation && (
                      <div className="mt-3 sm:mt-4 p-3 bg-blue-900/20 border border-blue-500/20 rounded-lg text-sm text-blue-200">
                        <span className="font-medium">💡 Explanation:</span> {question.explanation}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons - Sticky at bottom */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-4 sm:mt-6 pt-4 border-t border-white/10 backdrop-blur-sm flex-shrink-0">
            <button
              onClick={handleRetake}
              className="flex-1 sm:flex-none sm:w-42 flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-purple-600 hover:bg-purple-700 transition text-white rounded-lg font-medium text-sm sm:text-base min-h-[44px]"
            >
              <RotateCcw className="w-4 h-4" />
              Retake Quiz
            </button>
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none sm:w-42 px-4 sm:px-6 py-3 bg-gray-600 hover:bg-gray-700 transition text-white rounded-lg font-medium text-sm sm:text-base min-h-[44px]"
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
            className="bg-purple-500 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Answer Progress Indicator */}
        <div className="flex justify-between items-center mb-4 text-xs text-gray-400">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>
            {Object.keys(answers).length} of {questions.length} answered
          </span>
        </div>

        {/* Question */}
        <div
          key={currentIndex}
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
        </div>

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
              disabled={isSubmitting || !answers[currentIndex.toString()]}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-white rounded-lg font-medium text-sm sm:text-base"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : !answers[currentIndex.toString()] ? (
                <>
                  Select an answer
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