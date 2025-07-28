import React from "react";
import { motion } from "framer-motion";
import { MessageCircle, User, Sparkles, Loader2 } from "lucide-react";

interface ChatMessageProps {
  message: string;
  response?: string | null;
  selectedText?: string;
  sender: "user" | "ai";
  timestamp: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  response,
  selectedText,
  sender,
  timestamp,
}) => {
  const isUser = sender === "user";
  const isLoading = response && response.includes('AI is thinking...');
  const isError = response && (response.includes('Error') || response.includes('Failed'));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-6`}
    >
      <div className={`max-w-[85%] flex flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
        {/* Selected text context */}
        {selectedText && (
          <div className="flex items-center gap-2 text-xs text-purple-300 bg-purple-900/20 border border-purple-700/20 rounded-lg px-3 py-2 mb-2 backdrop-blur-xl">
            <Sparkles className="w-3 h-3" />
            <span className="truncate max-w-[200px] italic">{selectedText.length > 80 ? selectedText.slice(0, 80) + "..." : selectedText}</span>
          </div>
        )}
        {/* Message bubble */}
        <div className={`rounded-2xl px-4 py-3 shadow-lg text-sm backdrop-blur-xl ${
          isUser
            ? "bg-purple-600/80 text-white rounded-br-md ml-auto"
            : isError
              ? "bg-red-900/20 border border-red-500/20 text-red-200 rounded-bl-md"
              : isLoading
                ? "bg-yellow-900/20 border border-yellow-500/20 text-yellow-200 rounded-bl-md"
                : "bg-black/20 border border-white/10 text-white rounded-bl-md"
        }`}>
          {isUser ? message : isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>AI is thinking...</span>
            </div>
          ) : response || message}
        </div>
        {/* Timestamp and sender icon */}
        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1 opacity-70">
          {isUser ? <User className="w-4 h-4" /> : <MessageCircle className="w-4 h-4 text-purple-400" />}
          <span>{new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;