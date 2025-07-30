"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Check, Loader2, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAIAssistance, AIWritingContext } from "@/lib/actions/ai-assistant";
import { analyzeWritingStyle } from "@/lib/utils/writing-analysis";

interface SimpleAIAssistantProps {
  currentContent: string;
  cursorPosition?: number;
  onAccept: (content: string, mode: 'append' | 'replace' | 'insert') => void;
  onClose: () => void;
  isVisible: boolean;
  blockType?: string;
  allBlocks?: string[];
}

interface Suggestion {
  id: string;
  content: string;
  type: 'continue' | 'summarize' | 'improve' | 'custom';
  customPrompt?: string;
}

export default function SimpleAIAssistant({
  currentContent,
  cursorPosition = 0,
  onAccept,
  onClose,
  isVisible,
  blockType = 'paragraph',
  allBlocks = []
}: SimpleAIAssistantProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<number>(0);
  const [customPrompt, setCustomPrompt] = useState("");
  const [activeTab, setActiveTab] = useState<'continue' | 'summarize' | 'improve' | 'custom'>('continue');
  const [showPreview, setShowPreview] = useState(false);
  const [writingStyle, setWritingStyle] = useState<AIWritingContext['writingStyle']>();
  const [isError, setIsError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Analyze writing style when content changes
  useEffect(() => {
    if (currentContent.trim()) {
      const style = analyzeWritingStyle(currentContent);
      setWritingStyle(style);
    }
  }, [currentContent]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedSuggestion(prev =>
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedSuggestion(prev => prev > 0 ? prev - 1 : prev);
          break;
        case 'Enter':
          e.preventDefault();
          if (suggestions.length > 0) {
            handleAcceptSuggestion(suggestions[selectedSuggestion]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'Tab':
          e.preventDefault();
          if (suggestions.length > 0) {
            handleAcceptSuggestion(suggestions[selectedSuggestion]);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, suggestions, selectedSuggestion, onClose]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVisible, onClose]);

  // Clear state when component closes
  useEffect(() => {
    if (!isVisible) {
      setSuggestions([]);
      setSelectedSuggestion(0);
      setCustomPrompt("");
      setActiveTab('continue');
      setShowPreview(false);
      setIsError(false);
      setLoading(false);
    }
  }, [isVisible]);

  const handleGetSuggestions = async (type: 'continue' | 'summarize' | 'improve' | 'custom') => {
    if (!currentContent.trim()) return;

    setLoading(true);
    setSuggestions([]);
    setSelectedSuggestion(0);
    setIsError(false);

    try {
      const context: AIWritingContext = {
        blockType,
        allBlocks: allBlocks.filter(block => block.trim()),
        cursorPosition,
        writingStyle
      };

      const result = await getAIAssistance(
        currentContent,
        type,
        type === 'custom' ? customPrompt : undefined,
        context
      );

      if (result.success && result.content) {
        const newSuggestion: Suggestion = {
          id: Date.now().toString(),
          content: result.content,
          type,
          customPrompt: type === 'custom' ? customPrompt : undefined
        };
        setSuggestions([newSuggestion]);
        setIsError(false);
      } else {
        setSuggestions([{
          id: Date.now().toString(),
          content: "Sorry, I couldn't generate a suggestion right now.",
          type
        }]);
        setIsError(true);
      }
    } catch (error) {
      setSuggestions([{
        id: Date.now().toString(),
        content: "Sorry, I couldn't generate a suggestion right now.",
        type
      }]);
      setIsError(true);
    }

    setLoading(false);
  };

  const handleAcceptSuggestion = (suggestion: Suggestion) => {
    // Don't accept if it's an error message
    if (isError || suggestion.content.includes("Sorry, I couldn't generate")) {
      return;
    }

    let mode: 'append' | 'replace' | 'insert' = 'append';

    switch (suggestion.type) {
      case 'continue':
        mode = 'append';
        break;
      case 'summarize':
        mode = 'replace';
        break;
      case 'improve':
        mode = 'replace';
        break;
      case 'custom':
        // Determine mode based on custom prompt
        const prompt = suggestion.customPrompt?.toLowerCase() || '';
        if (prompt.includes('replace') || prompt.includes('rewrite') || prompt.includes('improve')) {
          mode = 'replace';
        } else if (prompt.includes('insert') || prompt.includes('add')) {
          mode = 'insert';
        } else {
          mode = 'append';
        }
        break;
    }

    onAccept(suggestion.content, mode);
    onClose();
  };

  const handleRegenerate = () => {
    if (suggestions.length > 0) {
      const currentSuggestion = suggestions[selectedSuggestion];
      handleGetSuggestions(currentSuggestion.type);
    }
  };

  const getTabIcon = (type: string) => {
    switch (type) {
      case 'continue': return '→';
      case 'summarize': return '📝';
      case 'improve': return '✨';
      case 'custom': return '🎯';
      default: return '💡';
    }
  };

  const getTabLabel = (type: string) => {
    switch (type) {
      case 'continue': return 'Continue';
      case 'summarize': return 'Summarize';
      case 'improve': return 'Improve';
      case 'custom': return 'Custom';
      default: return type;
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="absolute top-full left-0 right-0 mt-2 bg-black/95 backdrop-blur-xl border border-purple-500/30 rounded-lg p-4 shadow-2xl z-50 max-w-md"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-white">AI Assistant</span>
            {writingStyle && (
              <span className="text-xs text-gray-400 px-2 py-1 bg-white/5 rounded">
                {writingStyle.tone} • {writingStyle.complexity}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-3 bg-white/5 rounded-lg p-1">
          {(['continue', 'summarize', 'improve', 'custom'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs rounded transition-all flex items-center gap-1 ${
                activeTab === tab
                  ? 'bg-purple-500/30 text-purple-300'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>{getTabIcon(tab)}</span>
              <span>{getTabLabel(tab)}</span>
            </button>
          ))}
        </div>

        {/* Custom prompt input */}
        {activeTab === 'custom' && (
          <div className="mb-3">
            <input
              type="text"
              placeholder="What would you like me to do? (e.g., 'make this more formal', 'add more details')"
              value={customPrompt}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomPrompt(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder:text-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-purple-400"
            />
          </div>
        )}

        {/* Generate button */}
        <Button
          onClick={() => handleGetSuggestions(activeTab)}
          disabled={loading || !currentContent.trim() || (activeTab === 'custom' && !customPrompt.trim())}
          className="w-full mb-3 bg-purple-600 hover:bg-purple-700 text-white text-sm py-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-3 h-3 mr-2" />
              Generate Suggestion
            </>
          )}
        </Button>

        {/* Suggestions display */}
        {suggestions.length > 0 && (
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white/5 border rounded p-3 cursor-pointer transition-all ${
                  selectedSuggestion === index
                    ? 'border-purple-500/50 bg-purple-500/10'
                    : 'border-white/10 hover:border-purple-500/30'
                }`}
                onClick={() => setSelectedSuggestion(index)}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-white text-sm leading-relaxed flex-1">
                    {suggestion.content}
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400 px-2 py-1 bg-white/5 rounded">
                      {getTabLabel(suggestion.type)}
                    </span>
                    {selectedSuggestion === index && (
                      <Check className="w-3 h-3 text-purple-400" />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            <div className="flex gap-2">
              <Button
                onClick={() => handleAcceptSuggestion(suggestions[selectedSuggestion])}
                size="sm"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                disabled={isError || suggestions[selectedSuggestion].content.includes("Sorry, I couldn't generate")}
              >
                <Check className="w-3 h-3 mr-1" />
                Accept
              </Button>
              <Button
                onClick={handleRegenerate}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Regenerate
              </Button>
            </div>
          </div>
        )}

        {/* Keyboard shortcuts hint */}
        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-xs text-gray-400 text-center">
            <kbd className="px-1 py-0.5 bg-white/10 rounded text-xs">Tab</kbd> to accept •
            <kbd className="px-1 py-0.5 bg-white/10 rounded text-xs">↑↓</kbd> to navigate •
            <kbd className="px-1 py-0.5 bg-white/10 rounded text-xs">Esc</kbd> to close
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}