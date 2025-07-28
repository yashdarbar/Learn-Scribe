"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { sendMessageToAIWithAuth, getChatHistoryWithAuth, clearChatHistoryWithAuth } from "@/lib/actions/chat-actions";
import ChatMessage from "./ChatMessage";
import { Loader2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface ChatInterfaceProps {
  pdfId: string;
  docTitle?: string;
  selectedText?: string;
  chatAction?: 'add' | 'explain' | 'summarize';  // NEW PROP
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
  chatAction,  // NEW PROP
  onClearSelectedText,
  clearChatTrigger,
}) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingSelectedText, setPendingSelectedText] = useState<string | undefined>(undefined);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);  // NEW REF

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
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  }, []);

  // Handle input change with auto-resize
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    handleTextareaResize();
  };

  // ✅ ADD: Clear chat functionality
  const handleClearChat = async () => {
    if (messages.length === 0) return;

    setDeleteModal({ isOpen: true, isDeleting: false });
  };

  const handleDeleteConfirm = async () => {
    setDeleteModal(prev => ({ ...prev, isDeleting: true }));

    try {
      // Clear from server
      const result = await clearChatHistoryWithAuth(pdfId);

      if (result.success) {
        // Clear from state
        setMessages([]);
        // Clear from localStorage
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

  // ✅ ADD: Listen for clear chat trigger
  useEffect(() => {
    if (clearChatTrigger && clearChatTrigger > 0) {
      handleClearChat();
    }
  }, [clearChatTrigger]);

  // Fetch chat history (same as before)
  useEffect(() => {
    (async () => {
      try {
        setError(null);
        console.log("🔄 Loading chat history for PDF:", pdfId);
        const history = await getChatHistoryWithAuth(pdfId);
        console.log("📥 Raw chat history from DB:", history);

        // Convert database format to our chat message format
        // Each DB row should create TWO messages: user message + AI response
        const formattedHistory: ChatMessageType[] = [];

        (history || []).forEach((dbRow: any, index: number) => {
          // Create user message from the 'message' field
          if (dbRow.message && dbRow.message.trim()) {
            formattedHistory.push({
              id: `user-${dbRow.id}-${index}`,
              content: dbRow.message.trim(),
              role: 'user' as const,
              timestamp: new Date(dbRow.created_at),
              selectedText: dbRow.selected_text,
            });
          }

          // Create AI response from the 'response' field
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
      }
    })();
  }, [pdfId]);

  // Scroll to bottom on new message (same as before)
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Debug: Log messages state changes
  useEffect(() => {
    console.log("💬 Current messages state:", messages);
  }, [messages]);

  // NEW: Handle selected text from popup actions
  useEffect(() => {
    if (selectedText && chatAction) {
      setPendingSelectedText(selectedText);

      switch (chatAction) {
        case 'add':
          // Just add to input, let user type their question
          setInput(`"${selectedText}"`);
          inputRef.current?.focus();
          break;

        case 'explain':
          // Auto-send explanation request
          setInput(`Can you explain this: "${selectedText}"`);
          setTimeout(() => handleSend(`Can you explain this: "${selectedText}"`), 100);
          break;

        case 'summarize':
          // Auto-send summarization request
          setInput(`Can you summarize this: "${selectedText}"`);
          setTimeout(() => handleSend(`Can you summarize this: "${selectedText}"`), 100);
          break;
      }

      // Clear the selectedText after processing
      if (onClearSelectedText) {
        setTimeout(() => onClearSelectedText(), 500);
      }
    }
  }, [selectedText, chatAction]);

  // ✅ NEW: Real-time chat with optimistic updates
  const handleSend = async (messageOverride?: string) => {
    const messageToSend = messageOverride || input;
    if (!messageToSend.trim() && !pendingSelectedText) return;

    setError(null);
    console.log("📤 Sending message:", messageToSend);

    // 1. Add user message immediately (optimistic update)
    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      content: messageToSend.trim(),
      role: 'user',
      timestamp: new Date(),
      selectedText: pendingSelectedText,
    };

    console.log("➕ Adding user message to state:", userMessage);
    setMessages(prev => [...prev, userMessage]);

    // 2. Add loading message for AI response
    const loadingMessage: ChatMessageType = {
      id: `ai-${Date.now()}`,
      content: 'AI is thinking...',
      role: 'assistant',
      loading: true,
      timestamp: new Date(),
    };

    console.log("➕ Adding loading message to state:", loadingMessage);
    setMessages(prev => [...prev, loadingMessage]);

    // Clear input immediately for better UX
    setInput("");
    setPendingSelectedText(undefined);
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    try {
      // 3. Call server action
      console.log("🤖 Calling AI with message:", messageToSend);
      const result = await sendMessageToAIWithAuth({
        pdfId,
        message: messageToSend,
        selectedText: pendingSelectedText,
        docTitle,
        type: pendingSelectedText ? "explain" : "chat",
      });

      console.log("🤖 AI response result:", result);

      if (result.success) {
        // 4. Replace loading message with actual response
        console.log("✅ Replacing loading message with AI response:", result.response);
        setMessages(prev =>
          prev.map(msg =>
            msg.id === loadingMessage.id
              ? {
                  ...msg,
                  content: result.response || 'No response received',
                  loading: false,
                  id: msg.id // Keep the existing ID
                }
              : msg
          )
        );
      } else {
        // Handle error - replace loading with error message
        console.log("❌ AI response error:", result.error);
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
      // Handle network error
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
      {/* Chat messages - IMPROVED with proper user/AI message display */}
      <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar min-h-0">
        {messages.length === 0 && !loading && (
          <div className="text-center text-gray-400 mt-8">
            <div className="text-sm">💬 No messages yet</div>
            <div className="text-xs mt-2">Select text from the PDF or ask a question to get started!</div>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-[80%] rounded-lg px-4 py-3 ${
              msg.role === 'user'
                ? 'bg-purple-600 text-white rounded-br-md'
                : msg.error
                  ? 'bg-red-900/20 border border-red-500/20 text-red-200 rounded-bl-md'
                  : msg.loading
                    ? 'bg-yellow-900/20 border border-yellow-500/20 text-yellow-200 rounded-bl-md'
                    : 'bg-black/40 text-gray-200 border border-white/10 rounded-bl-md'
            }`}>
              <p className="text-sm">{msg.content}</p>
              <div className="flex items-center gap-1 mt-2 text-xs opacity-70">
                {msg.role === 'user' ? (
                  <>
                    <span>You</span>
                    <span>•</span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </>
                ) : (
                  <>
                    <span>AI</span>
                    <span>•</span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Error display (same as before) */}
      {error && (
        <div className="text-xs text-red-400 px-4 pb-2 bg-red-900/10 border-t border-red-500/20">
          ❌ {error}
        </div>
      )}

      {/* Selected text context preview - IMPROVED */}
      {pendingSelectedText && (
        <div className="px-4 py-2 bg-purple-900/20 text-xs text-purple-200 border-t border-purple-700/20 flex items-center gap-2">
          <span className="text-purple-400">📝 Selected:</span>
          <span className="truncate max-w-[200px] italic">
            "{pendingSelectedText.length > 80 ? pendingSelectedText.slice(0, 80) + "..." : pendingSelectedText}"
          </span>
          <button
            className="ml-auto px-2 py-1 rounded bg-purple-700/30 hover:bg-purple-700/50 text-xs text-purple-100 transition"
            onClick={() => {
              setPendingSelectedText(undefined);
              setInput("");
            }}
          >
            Clear
          </button>
        </div>
      )}

      {/* Input section - IMPROVED with larger textarea */}
      <div className="px-4 py-3 border-t border-white/10 bg-black/30 flex gap-2 items-end flex-shrink-0">
        <textarea
          ref={inputRef}  // NEW REF
          rows={1}
          maxLength={3000}
          className="flex-1 resize-none rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm disabled:opacity-50 transition min-h-[80px] max-h-[200px]"
          placeholder={
            pendingSelectedText
              ? "Ask about the selected text..."
              : "Type your message, paste page content for flashcards, or select text from the PDF..."
          }
          value={input}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          disabled={false} // Remove loading state from input to allow typing while AI responds
        />
        <button
          className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition text-white disabled:opacity-50 flex items-center justify-center"
          title="Send message"
          onClick={() => handleSend()}
          disabled={!input.trim() && !pendingSelectedText}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-7.5-15-7.5v6l10 1.5-10 1.5v6z" />
          </svg>
        </button>
      </div>

      {/* Character count */}
      <div className="text-xs text-gray-500 px-4 pb-2 text-right">
        {input.length}/3000
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