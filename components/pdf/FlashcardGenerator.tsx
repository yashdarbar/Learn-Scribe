"use client";
import React, { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2, Save, Sparkles, BookOpen, X, Play } from "lucide-react";
import { generateFlashcardsWithAuth, saveFlashcardSetWithAuth, Flashcard } from "@/lib/actions/flashcard-actions";
import FlashcardStudyView from "./FlashcardStudyView";

interface FlashcardGeneratorProps {
  pdfId: string;
  pageNumber: number;
  docTitle?: string;
}

// Flashcard Preview Component
const FlashcardPreview: React.FC<{
  flashcards: Flashcard[];
  onSave: (title: string) => void;
  onClose: () => void;
  isSaving: boolean;
  onStudy: () => void;
}> = ({ flashcards, onSave, onClose, isSaving, onStudy }) => {
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
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Generated Flashcards</h3>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-white/10 transition"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {flashcards.map((card, index) => (
          <div
            key={index}
            className="bg-black/20 border border-white/10 rounded-lg p-4"
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
      </div>

      <div className="flex gap-2">
        <button
          onClick={onStudy}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 transition text-white rounded-lg font-medium"
        >
          <Play className="w-4 h-4" />
          Study Now
        </button>
        <button
          onClick={handleSave}
          disabled={!title.trim() || isSaving}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition text-white rounded-lg font-medium"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Set
            </>
          )}
        </button>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-gray-300">Set Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a title for this flashcard set..."
          className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
      </div>
    </motion.div>
  );
};

export const FlashcardGenerator: React.FC<FlashcardGeneratorProps> = ({
  pdfId,
  pageNumber,
  docTitle
}) => {
  const [content, setContent] = useState("");
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [studyMode, setStudyMode] = useState<{ isOpen: boolean; flashcards: Flashcard[]; title: string }>({
    isOpen: false,
    flashcards: [],
    title: ""
  });

  // Auto-resize functionality for textarea
  const handleTextareaResize = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(Math.max(textarea.scrollHeight, 120), 300);
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
      setError("Please enter some content to generate flashcards from.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateFlashcardsWithAuth(content, pdfId, pageNumber);

      if (result.success && result.flashcards) {
        setFlashcards(result.flashcards);
        setShowPreview(true);
      } else {
        setError(result.error || "Failed to generate flashcards");
      }
    } catch (err) {
      setError("Failed to generate flashcards. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (title: string) => {
    setIsSaving(true);
    setError(null);

    try {
      const result = await saveFlashcardSetWithAuth(
        flashcards,
        title,
        pdfId,
        pageNumber,
        content
      );

      if (result.success) {
        // Clear form and show success
        setContent("");
        setFlashcards([]);
        setShowPreview(false);
        // Reset textarea height
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
        // You could add a success toast here
        console.log("Flashcard set saved successfully!");
      } else {
        setError(result.error || "Failed to save flashcard set");
      }
    } catch (err) {
      setError("Failed to save flashcard set. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setFlashcards([]);
  };

  const handleStudy = () => {
    if (flashcards.length > 0) {
      setStudyMode({
        isOpen: true,
        flashcards: flashcards,
        title: `Generated Set - ${docTitle || 'PDF'}`
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

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header - Fixed */}
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">Generate Flashcards</h3>
      </div>

      {!showPreview ? (
        <>
          {/* Content Area - Flex grow */}
          <div className="flex-1 flex flex-col space-y-4">
            {/* Content Input - Takes available space */}
            <div className="flex-1">
              <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
                Page Content
              </label>
              <textarea
                ref={textareaRef}
                id="content"
                rows={8}
                maxLength={5000}
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm resize-none transition"
                placeholder="Paste the page content here to generate flashcards..."
                value={content}
                onChange={handleContentChange}
                disabled={isGenerating}
              />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {content.length}/5000
              </div>
            </div>

            {/* Error Display - Fixed */}
            {error && (
              <div className="text-red-400 text-sm bg-red-900/20 border border-red-500/20 rounded-lg p-3 flex-shrink-0">
                ❌ {error}
              </div>
            )}
          </div>

          {/* Generate Button - Always at bottom */}
          <div className="flex-shrink-0 space-y-3">
            <button
              onClick={handleGenerate}
              disabled={!content.trim() || isGenerating}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-white rounded-lg flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Flashcards...
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4" />
                  Generate Flashcards
                </>
              )}
            </button>
          </div>
        </>
      ) : (
        <FlashcardPreview
          flashcards={flashcards}
          onSave={handleSave}
          onClose={handleClosePreview}
          isSaving={isSaving}
          onStudy={handleStudy}
        />
      )}

      {/* Study Mode Modal */}
      {studyMode.isOpen && (
        <FlashcardStudyView
          flashcards={studyMode.flashcards}
          onClose={closeStudyMode}
          title={studyMode.title}
        />
      )}
    </div>
  );
};

export default FlashcardGenerator;