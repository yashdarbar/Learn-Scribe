"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Trash2, Eye, Calendar, FileText, Play, Loader2 } from "lucide-react";
import { getUserFlashcardSetsWithAuth, deleteFlashcardSetWithAuth, FlashcardSet } from "@/lib/actions/flashcard-actions";
import FlashcardStudyView from "./FlashcardStudyView";

interface FlashcardSetsProps {
  pdfId: string;
}

// Custom Delete Confirmation Modal Component
const DeleteConfirmModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  setTitle: string;
  isDeleting: boolean;
}> = ({ isOpen, onClose, onConfirm, setTitle, isDeleting }) => {
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

          <h3 className="text-lg font-semibold text-white mb-2">Delete Flashcard Set</h3>
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

export const FlashcardSets: React.FC<FlashcardSetsProps> = ({ pdfId }) => {
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSet, setSelectedSet] = useState<FlashcardSet | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [studyMode, setStudyMode] = useState<{ isOpen: boolean; flashcards: any[]; title: string }>({
    isOpen: false,
    flashcards: [],
    title: ""
  });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    setId: string;
    setTitle: string;
  }>({
    isOpen: false,
    setId: '',
    setTitle: ''
  });

  useEffect(() => {
    loadFlashcardSets();
  }, [pdfId]);

  const loadFlashcardSets = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getUserFlashcardSetsWithAuth(pdfId);

      if (result.success) {
        setSets(result.flashcard_sets || []);
      } else {
        setError(result.error || "Failed to load flashcard sets");
      }
    } catch (err) {
      setError("Failed to load flashcard sets");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (set: FlashcardSet) => {
    setDeleteModal({
      isOpen: true,
      setId: set.id,
      setTitle: set.title
    });
  };

  const handleDeleteConfirm = async () => {
    const { setId } = deleteModal;
    setIsDeleting(setId);

    try {
      const result = await deleteFlashcardSetWithAuth(setId);

      if (result.success) {
        setSets(prev => prev.filter(set => set.id !== setId));
        if (selectedSet?.id === setId) {
          setSelectedSet(null);
        }
        setDeleteModal({ isOpen: false, setId: '', setTitle: '' });
      } else {
        setError(result.error || "Failed to delete flashcard set");
      }
    } catch (err) {
      setError("Failed to delete flashcard set");
    } finally {
      setIsDeleting(null);
    }
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, setId: '', setTitle: '' });
  };

  const handleStudy = (set: FlashcardSet) => {
    if (set.flashcards && set.flashcards.length > 0) {
      setStudyMode({
        isOpen: true,
        flashcards: set.flashcards,
        title: set.title
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2 text-gray-400">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
          Loading flashcard sets...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-400 text-sm">{error}</div>
        <button
          onClick={loadFlashcardSets}
          className="mt-2 px-3 py-1 bg-purple-600 hover:bg-purple-700 transition text-white rounded text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (sets.length === 0) {
    return (
      <div className="text-center py-8">
        <BookOpen className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-300 mb-2">No Flashcard Sets</h3>
        <p className="text-sm text-gray-500">
          Generate flashcards from page content to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">Saved Flashcard Sets</h3>
      </div>

      {/* Sets List */}
      <div className="space-y-3">
        {sets.map((set) => (
          <motion.div
            key={set.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/20 border border-white/10 rounded-lg p-4 backdrop-blur-xl hover:bg-black/30 transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-white mb-1">{set.title}</h4>
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
                  onClick={() => handleStudy(set)}
                  disabled={!set.flashcards || set.flashcards.length === 0}
                  className="p-1 rounded hover:bg-purple-900/20 transition disabled:opacity-50"
                  title="Study this set"
                >
                  <Play className="w-4 h-4 text-green-400" />
                </button>
                <button
                  onClick={() => setSelectedSet(selectedSet?.id === set.id ? null : set)}
                  className="p-1 rounded hover:bg-purple-900/20 transition"
                  title="View cards"
                >
                  <Eye className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={() => handleDeleteClick(set)}
                  disabled={isDeleting === set.id}
                  className="p-1 rounded hover:bg-red-900/20 transition disabled:opacity-50"
                  title="Delete set"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>

            {/* Expanded Cards View */}
            {selectedSet?.id === set.id && set.flashcards && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-white/10 space-y-3"
              >
                {set.flashcards.map((card, index) => (
                  <div
                    key={index}
                    className="bg-black/10 border border-white/5 rounded p-3"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-purple-600/50 text-purple-200 px-2 py-1 rounded">
                        Card {index + 1}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        card.difficulty_level === 'easy' ? 'bg-green-600/50 text-green-200' :
                        card.difficulty_level === 'medium' ? 'bg-yellow-600/50 text-yellow-200' :
                        'bg-red-600/50 text-red-200'
                      }`}>
                        {card.difficulty_level}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-purple-300">Q:</span>
                        <p className="text-white text-sm mt-1">{card.question}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-green-300">A:</span>
                        <p className="text-gray-300 text-sm mt-1">{card.answer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
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

      {/* Custom Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        setTitle={deleteModal.setTitle}
        isDeleting={isDeleting === deleteModal.setId}
      />
    </div>
  );
};

export default FlashcardSets;