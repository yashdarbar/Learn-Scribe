"use client";
import React, { useState, useEffect, useRef } from "react";
import { sendMessageToAIWithAuth, getChatHistoryWithAuth, clearChatHistoryWithAuth } from "@/lib/actions/chat-actions";
import ChatMessage from "./ChatMessage";
import { Loader2 } from "lucide-react";

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

  // ✅ ADD: Clear chat functionality
  const handleClearChat = async () => {
    if (messages.length === 0) return;

    if (window.confirm('Are you sure you want to clear all chat history?')) {
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
      }
    }
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
        const history = await getChatHistoryWithAuth(pdfId);
        // Convert database format to our chat message format
        const formattedHistory = (history || []).map((msg: any) => ({
          id: msg.id,
          content: msg.response || msg.message,
          role: (msg.user_id === "me" ? "user" : "assistant") as 'user' | 'assistant',
          timestamp: new Date(msg.created_at),
          selectedText: msg.selected_text,
        }));
        setMessages(formattedHistory);
      } catch (err: any) {
        setError("Failed to load chat history");
      }
    })();
  }, [pdfId]);

  // Scroll to bottom on new message (same as before)
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

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

    // 1. Add user message immediately (optimistic update)
    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      content: messageToSend.trim(),
      role: 'user',
      timestamp: new Date(),
      selectedText: pendingSelectedText,
    };

    setMessages(prev => [...prev, userMessage]);

    // 2. Add loading message for AI response
    const loadingMessage: ChatMessageType = {
      id: `ai-${Date.now()}`,
      content: '',
      role: 'assistant',
      loading: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, loadingMessage]);

    // Clear input immediately for better UX
    setInput("");
    setPendingSelectedText(undefined);

    try {
      // 3. Call server action
      const result = await sendMessageToAIWithAuth({
        pdfId,
        message: messageToSend,
        selectedText: pendingSelectedText,
        docTitle,
        type: pendingSelectedText ? "explain" : "chat",
      });

      if (result.success) {
        // 4. Replace loading message with actual response
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
      {/* Chat messages (same as before) */}
      <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar min-h-0">
        {messages.length === 0 && !loading && (
          <div className="text-center text-gray-400 mt-8">
            <div className="text-sm">💬 No messages yet</div>
            <div className="text-xs mt-2">Select text from the PDF or ask a question to get started!</div>
          </div>
        )}
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg.content}
            response={msg.role === 'assistant' ? msg.content : undefined}
            selectedText={msg.selectedText}
            sender={msg.role === 'user' ? "user" : "ai"}
            timestamp={msg.timestamp.toISOString()}
          />
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

      {/* Input section - IMPROVED */}
      <div className="px-4 py-3 border-t border-white/10 bg-black/30 flex gap-2 items-end flex-shrink-0">
        <textarea
          ref={inputRef}  // NEW REF
          rows={1}
          maxLength={1500}
          className="flex-1 resize-none rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm disabled:opacity-50 transition min-h-[60px] max-h-[120px]"
          placeholder={
            pendingSelectedText
              ? "Ask about the selected text..."
              : "Type your message or select text from the PDF..."
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
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
        {input.length}/1500
      </div>
    </div>
  );
};

export default ChatInterface;