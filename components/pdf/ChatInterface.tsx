"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { sendMessageToAIWithAuth, getChatHistoryWithAuth, clearChatHistoryWithAuth } from "@/lib/actions/chat-actions";
import ChatMessage from "./ChatMessage";
import { Loader2, Trash2, X } from "lucide-react";
import { motion } from "framer-motion";

interface ChatInterfaceProps {
  pdfId: string;
  docTitle?: string;
  selectedText?: string;
  chatAction?: 'add' | 'explain' | 'summarize' | 'flashcards';
  onClearSelectedText?: () => void;
  clearChatTrigger?: number;
}

// Proper chat message interface
interface ChatMessageType {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  loading?: boolean;
  error?: boolean;
  selectedText?: string;
}

// Custom Delete Confirmation Modal Component
const DeleteConfirmModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}> = ({ isOpen, onClose, onConfirm, isDeleting }) => {
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

          <h3 className="text-lg font-semibold text-white mb-2">Clear Chat History</h3>
          <p className="text-gray-300 text-sm mb-2">
            Are you sure you want to clear all chat messages?
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
                  Clearing...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Clear Chat
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  pdfId,
  docTitle,
  selectedText,
  chatAction,
  onClearSelectedText,
  clearChatTrigger,
}) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingSelectedText, setPendingSelectedText] = useState<string | undefined>(undefined);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    isDeleting: boolean;
  }>({
    isOpen: false,
    isDeleting: false
  });

  // Auto-resize functionality for textarea
  const handleTextareaResize = useCallback(() => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, []);

  // Handle input change with auto-resize
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    handleTextareaResize();
  };

  // Clear chat functionality
  const handleClearChat = async () => {
    if (messages.length === 0) return;

    setDeleteModal({ isOpen: true, isDeleting: false });
  };

  const handleDeleteConfirm = async () => {
    setDeleteModal(prev => ({ ...prev, isDeleting: true }));

    try {
      const result = await clearChatHistoryWithAuth(pdfId);

      if (result.success) {
        setMessages([]);
        localStorage.removeItem(`pdf-chat-${pdfId}`);
        console.log('Chat history cleared successfully');
      } else {
        console.error('Failed to clear chat history:', result.error);
      }
    } catch (error) {
      console.error('Error clearing chat history:', error);
    } finally {
      setDeleteModal({ isOpen: false, isDeleting: false });
    }
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, isDeleting: false });
  };

  // Listen for clear chat trigger
  useEffect(() => {
    if (clearChatTrigger && clearChatTrigger > 0) {
      handleClearChat();
    }
  }, [clearChatTrigger]);

  // Fetch chat history
  useEffect(() => {
    (async () => {
      try {
        setIsLoadingHistory(true);
        setError(null);
        console.log("🔄 Loading chat history for PDF:", pdfId);
        const history = await getChatHistoryWithAuth(pdfId);
        console.log("📥 Raw chat history from DB:", history);

        const formattedHistory: ChatMessageType[] = [];

        (history || []).forEach((dbRow: any, index: number) => {
          if (dbRow.message && dbRow.message.trim()) {
            formattedHistory.push({
              id: `user-${dbRow.id}-${index}`,
              content: dbRow.message.trim(),
              role: 'user' as const,
              timestamp: new Date(dbRow.created_at),
              selectedText: dbRow.selected_text,
            });
          }

          if (dbRow.response && dbRow.response.trim()) {
            formattedHistory.push({
              id: `ai-${dbRow.id}-${index}`,
              content: dbRow.response.trim(),
              role: 'assistant' as const,
              timestamp: new Date(dbRow.created_at),
              selectedText: dbRow.selected_text,
            });
          }
        });

        console.log("✅ Formatted chat messages:", formattedHistory);
        setMessages(formattedHistory);
      } catch (err: any) {
        console.error("❌ Error loading chat history:", err);
        setError("Failed to load chat history");
      } finally {
        setIsLoadingHistory(false);
      }
    })();
  }, [pdfId]);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Debug: Log messages state changes
  useEffect(() => {
    console.log("💬 Current messages state:", messages);
  }, [messages]);

  // Handle selected text from popup actions
  useEffect(() => {
    if (selectedText && chatAction) {
      setPendingSelectedText(selectedText);

      switch (chatAction) {
        case 'add':
          setInput(`"${selectedText}"`);
          // Focus and position cursor at the end after state update
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.focus();
              const textLength = inputRef.current.value.length;
              inputRef.current.setSelectionRange(textLength, textLength);
            }
          }, 50);
          break;

        case 'explain':
          setInput(`Can you explain this: "${selectedText}"`);
          setTimeout(() => handleSend(`Can you explain this: "${selectedText}"`), 100);
          break;

        case 'summarize':
          setInput(`Can you summarize this: "${selectedText}"`);
          setTimeout(() => handleSend(`Can you summarize this: "${selectedText}"`), 100);
          break;
      }

      if (onClearSelectedText) {
        setTimeout(() => onClearSelectedText(), 500);
      }
    }
  }, [selectedText, chatAction]);

  // Real-time chat with optimistic updates
  const handleSend = async (messageOverride?: string) => {
    const messageToSend = messageOverride || input;
    if (!messageToSend.trim() && !pendingSelectedText) return;

    setError(null);
    console.log("📤 Sending message:", messageToSend);

    // Add user message immediately
    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      content: messageToSend.trim(),
      role: 'user',
      timestamp: new Date(),
      selectedText: pendingSelectedText,
    };

    setMessages(prev => [...prev, userMessage]);

    // Add loading message for AI response
    const loadingMessage: ChatMessageType = {
      id: `ai-${Date.now()}`,
      content: 'AI is thinking...',
      role: 'assistant',
      loading: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, loadingMessage]);

    // Clear input immediately
    setInput("");
    setPendingSelectedText(undefined);
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    try {
      const result = await sendMessageToAIWithAuth({
        pdfId,
        message: messageToSend,
        selectedText: pendingSelectedText,
        docTitle,
        type: pendingSelectedText ? "explain" : "chat",
      });

      if (result.success) {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === loadingMessage.id
              ? {
                  ...msg,
                  content: result.response || 'No response received',
                  loading: false,
                  id: msg.id
                }
              : msg
          )
        );
      } else {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === loadingMessage.id
              ? {
                  ...msg,
                  content: result.error || 'AI failed to respond',
                  loading: false,
                  error: true
                }
              : msg
          )
        );
        setError(result.error || "AI failed to respond");
      }
    } catch (err: any) {
      console.error("❌ Network error sending message:", err);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === loadingMessage.id
            ? {
                ...msg,
                content: 'Failed to send message. Please try again.',
                loading: false,
                error: true
              }
            : msg
        )
      );
      setError("Failed to send message");
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/20 rounded-xl border border-white/10 overflow-hidden">
      {/* Chat messages - Clean and simple */}
      <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar">
        {isLoadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-400">Loading chat...</span>
              </div>
            </div>
          </div>
        ) : messages.length === 0 && !loading ? (
          <div className="text-center text-gray-400 mt-8">
            <div className="text-sm">Ask me anything about this PDF!</div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                msg.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : msg.error
                    ? 'bg-red-900/20 border border-red-500/20 text-red-200'
                    : msg.loading
                      ? 'bg-gray-700/50 text-gray-300'
                      : 'bg-gray-800/50 text-gray-100 border border-gray-700/50'
              }`}>
                {msg.loading ? (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Subtle error display */}
      {error && (
        <div className="px-4 py-2 text-xs text-red-400 bg-red-900/10 border-t border-red-500/20">
          {error}
        </div>
      )}

      {/* Unified input section */}
      <div className="px-4 py-3 border-t border-white/10 bg-black/30 flex gap-2 items-start">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            rows={2}
            maxLength={3000}
            className="w-full resize-none rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm transition h-[60px] max-h-[120px] custom-scrollbar"
            placeholder={
              pendingSelectedText
                ? "Ask about the selected text..."
                : "Type your message..."
            }
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={isLoadingHistory}
          />
          {pendingSelectedText && (
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-purple-900/20 border border-purple-500/30 rounded-xl px-3 py-2 pointer-events-none">
              <div className="text-xs text-purple-300 mb-1 flex items-center gap-2">
                {/* <span>📝 Selected text:</span> */}
                <button
                  className="ml-auto px-1 rounded bg-gray-700/50 hover:bg-gray-600/50 text-xs transition pointer-events-auto"
                  onClick={() => {
                    setPendingSelectedText(undefined);
                    setInput("");
                    // Reset textarea to default size
                    if (inputRef.current) {
                      inputRef.current.style.height = '60px';
                    }
                  }}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              {/* <div className="text-xs text-purple-200 line-clamp-2 italic">
                "{pendingSelectedText.length > 80 ? pendingSelectedText.slice(0, 80) + "..." : pendingSelectedText}"
              </div> */}
            </div>
          )}
        </div>
        <button
          className="p-2 rounded-xl bg-purple-600 hover:bg-purple-700 transition text-white disabled:opacity-50 flex items-center justify-center mt-1"
          title="Send message"
          onClick={() => handleSend()}
          disabled={!input.trim() && !pendingSelectedText || isLoadingHistory}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-7.5-15-7.5v6l10 1.5-10 1.5v6z" />
          </svg>
        </button>
      </div>

      {/* Custom Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteModal.isDeleting}
      />
    </div>
  );
};

export default ChatInterface;