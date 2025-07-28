"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Trash2, Eye, Calendar, FileText, Play, Loader2, MessageCircle, CheckCircle } from "lucide-react";
import { getUserFlashcardSetsWithAuth, deleteFlashcardSetWithAuth, FlashcardSet } from "@/lib/actions/flashcard-actions";
import { getUserQuizSetsWithAuth, deleteQuizSetWithAuth, QuizSet } from "@/lib/actions/quiz-actions";
import FlashcardStudyView from "./FlashcardStudyView";
import QuizTakeView from "./QuizTakeView";

interface MySetsProps {
  pdfId: string;
}

// Custom Delete Confirmation Modal Component
const DeleteConfirmModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  setTitle: string;
  setType: 'flashcard' | 'quiz';
  isDeleting: boolean;
}> = ({ isOpen, onClose, onConfirm, setTitle, setType, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-black/90 border border-white/10 rounded-lg p-6 w-96 backdrop-blur-xl"
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-red-400" />
          </div>

          <h3 className="text-lg font-semibold text-white mb-2">Delete {setType === 'flashcard' ? 'Flashcard Set' : 'Quiz Set'}</h3>
          <p className="text-gray-300 text-sm mb-2">
            Are you sure you want to delete <span className="font-medium text-white">"{setTitle}"</span>?
          </p>
          <p className="text-gray-400 text-xs mb-6">
            This action cannot be undone.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 transition text-white rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 transition text-white rounded-lg flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const MySets: React.FC<MySetsProps> = ({ pdfId }) => {
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [quizSets, setQuizSets] = useState<QuizSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'flashcards' | 'quizzes'>('all');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [selectedSet, setSelectedSet] = useState<FlashcardSet | QuizSet | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    setId: string;
    setTitle: string;
    setType: 'flashcard' | 'quiz';
  }>({
    isOpen: false,
    setId: '',
    setTitle: '',
    setType: 'flashcard'
  });

  // Study/Quiz mode states
  const [studyMode, setStudyMode] = useState<{
    isOpen: boolean;
    flashcards: any[];
    title: string;
  }>({
    isOpen: false,
    flashcards: [],
    title: ""
  });

  const [quizMode, setQuizMode] = useState<{
    isOpen: boolean;
    questions: any[];
    title: string;
    quizSetId?: string;
  }>({
    isOpen: false,
    questions: [],
    title: "",
    quizSetId: undefined
  });

  useEffect(() => {
    loadAllSets();
  }, [pdfId]);

  const loadAllSets = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load both flashcard and quiz sets in parallel
      const [flashcardResult, quizResult] = await Promise.all([
        getUserFlashcardSetsWithAuth(pdfId),
        getUserQuizSetsWithAuth(pdfId)
      ]);

      if (flashcardResult.success) {
        setFlashcardSets(flashcardResult.flashcard_sets || []);
      }

      if (quizResult.success) {
        setQuizSets(quizResult.quiz_sets || []);
      }

      if (!flashcardResult.success && !quizResult.success) {
        setError("Failed to load study sets");
      }
    } catch (err) {
      setError("Failed to load study sets");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (set: FlashcardSet | QuizSet, type: 'flashcard' | 'quiz') => {
    setDeleteModal({
      isOpen: true,
      setId: set.id,
      setTitle: set.title,
      setType: type
    });
  };

  const handleDeleteConfirm = async () => {
    const { setId, setType } = deleteModal;
    setIsDeleting(setId);

    try {
      let result;
      if (setType === 'flashcard') {
        result = await deleteFlashcardSetWithAuth(setId);
      } else {
        result = await deleteQuizSetWithAuth(setId);
      }

      if (result.success) {
        if (setType === 'flashcard') {
          setFlashcardSets(prev => prev.filter(set => set.id !== setId));
        } else {
          setQuizSets(prev => prev.filter(set => set.id !== setId));
        }
        setDeleteModal({ isOpen: false, setId: '', setTitle: '', setType: 'flashcard' });
      } else {
        setError(result.error || `Failed to delete ${setType} set`);
      }
    } catch (err) {
      setError(`Failed to delete ${setType} set`);
    } finally {
      setIsDeleting(null);
    }
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, setId: '', setTitle: '', setType: 'flashcard' });
  };

  const handleStudyFlashcards = (set: FlashcardSet) => {
    if (set.flashcards && set.flashcards.length > 0) {
      setStudyMode({
        isOpen: true,
        flashcards: set.flashcards,
        title: set.title
      });
    }
  };

  const handleTakeQuiz = (set: QuizSet) => {
    if (set.quiz_questions && set.quiz_questions.length > 0) {
      setQuizMode({
        isOpen: true,
        questions: set.quiz_questions,
        title: set.title,
        quizSetId: set.id
      });
    }
  };

  const closeStudyMode = () => {
    setStudyMode({
      isOpen: false,
      flashcards: [],
      title: ""
    });
  };

  const closeQuizMode = () => {
    setQuizMode({
      isOpen: false,
      questions: [],
      title: "",
      quizSetId: undefined
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Filter sets based on current filter
  const filteredFlashcardSets = filter === 'all' || filter === 'flashcards' ? flashcardSets : [];
  const filteredQuizSets = filter === 'all' || filter === 'quizzes' ? quizSets : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2 text-gray-400">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
          Loading study sets...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-400 text-sm">{error}</div>
        <button
          onClick={loadAllSets}
          className="mt-2 px-3 py-1 bg-purple-600 hover:bg-purple-700 transition text-white rounded text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  const totalSets = flashcardSets.length + quizSets.length;

  if (totalSets === 0) {
    return (
      <div className="text-center py-8">
        <BookOpen className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-300 mb-2">No Study Sets</h3>
        <p className="text-sm text-gray-500">
          Generate flashcards or quiz questions from page content to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">My Study Sets</h3>
      </div>

      {/* Filter Tabs */}
      <div className="flex border border-white/10 rounded-lg bg-black/20 overflow-hidden">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition ${
            filter === 'all'
              ? 'text-purple-400 bg-purple-900/20 border-b-2 border-purple-400'
              : 'text-gray-400 hover:text-gray-300 hover:bg-black/20'
          }`}
        >
          All ({totalSets})
        </button>
        <button
          onClick={() => setFilter('flashcards')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition ${
            filter === 'flashcards'
              ? 'text-purple-400 bg-purple-900/20 border-b-2 border-purple-400'
              : 'text-gray-400 hover:text-gray-300 hover:bg-black/20'
          }`}
        >
          📚 Flashcards ({flashcardSets.length})
        </button>
        <button
          onClick={() => setFilter('quizzes')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition ${
            filter === 'quizzes'
              ? 'text-purple-400 bg-purple-900/20 border-b-2 border-purple-400'
              : 'text-gray-400 hover:text-gray-300 hover:bg-black/20'
          }`}
        >
          ❓ Quizzes ({quizSets.length})
        </button>
      </div>

      {/* Combined Sets List */}
      <div className="space-y-3">
        {/* Flashcard Sets */}
        {filteredFlashcardSets.map((set) => (
          <motion.div
            key={`flashcard-${set.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/20 border border-white/10 rounded-lg p-4 backdrop-blur-xl hover:bg-black/30 transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="w-4 h-4 text-purple-400" />
                  <h4 className="font-medium text-white">{set.title}</h4>
                  <span className="text-xs bg-purple-600/50 text-purple-200 px-2 py-1 rounded">
                    Flashcards
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {set.flashcards?.length || 0} cards
                  </div>
                  {set.page_number && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Page {set.page_number}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(set.created_at)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStudyFlashcards(set)}
                  disabled={!set.flashcards || set.flashcards.length === 0}
                  className="p-1 rounded hover:bg-purple-900/20 transition disabled:opacity-50"
                  title="Study these flashcards"
                >
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </button>
                <button
                  onClick={() => handleDeleteClick(set, 'flashcard')}
                  disabled={isDeleting === set.id}
                  className="p-1 rounded hover:bg-red-900/20 transition disabled:opacity-50"
                  title="Delete set"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Quiz Sets */}
        {filteredQuizSets.map((set) => (
          <motion.div
            key={`quiz-${set.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/20 border border-white/10 rounded-lg p-4 backdrop-blur-xl hover:bg-black/30 transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <MessageCircle className="w-4 h-4 text-blue-400" />
                  <h4 className="font-medium text-white">{set.title}</h4>
                  <span className="text-xs bg-blue-600/50 text-blue-200 px-2 py-1 rounded">
                    Quiz
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {set.quiz_questions?.length || 0} questions
                  </div>
                  {set.page_number && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Page {set.page_number}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(set.created_at)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTakeQuiz(set)}
                  disabled={!set.quiz_questions || set.quiz_questions.length === 0}
                  className="p-1 rounded hover:bg-blue-900/20 transition disabled:opacity-50"
                  title="Take this quiz"
                >
                  <Play className="w-4 h-4 text-green-400" />
                </button>
                <button
                  onClick={() => handleDeleteClick(set, 'quiz')}
                  disabled={isDeleting === set.id}
                  className="p-1 rounded hover:bg-red-900/20 transition disabled:opacity-50"
                  title="Delete set"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Study Mode Modal */}
      {studyMode.isOpen && (
        <FlashcardStudyView
          flashcards={studyMode.flashcards}
          onClose={closeStudyMode}
          title={studyMode.title}
        />
      )}

      {/* Quiz Mode Modal */}
      {quizMode.isOpen && (
        <QuizTakeView
          questions={quizMode.questions}
          onClose={closeQuizMode}
          title={quizMode.title}
          quizSetId={quizMode.quizSetId}
        />
      )}

      {/* Custom Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        setTitle={deleteModal.setTitle}
        setType={deleteModal.setType}
        isDeleting={isDeleting === deleteModal.setId}
      />
    </div>
  );
};

export default MySets;