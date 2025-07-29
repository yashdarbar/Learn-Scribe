import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clipboard, MessageCircle, Info, Sparkles, Plus, X } from "lucide-react";

interface TextSelectionPopupProps {
  selectedText: string;
  position: { x: number; y: number };
  onCopy: () => void;
  onAddToChat: () => void;
  onExplain: () => void;
  onSummarize: () => void;
  onAsk: () => void;
  onClose: () => void;
  loading?: boolean;
  disabled?: boolean;
}

const actions = [
  {
    key: "copy",
    label: "Copy",
    icon: Clipboard,
    handler: (props: TextSelectionPopupProps) => props.onCopy(),
  },
  {
    key: "add",
    label: "Add to Chat",
    icon: Plus,
    handler: (props: TextSelectionPopupProps) => props.onAddToChat(),
  },
  {
    key: "explain",
    label: "Explain",
    icon: Info,
    handler: (props: TextSelectionPopupProps) => props.onExplain(),
  },
  {
    key: "summarize",
    label: "Summarize",
    icon: Sparkles,
    handler: (props: TextSelectionPopupProps) => props.onSummarize(),
  },
  {
    key: "ask",
    label: "Ask Question",
    icon: MessageCircle,
    handler: (props: TextSelectionPopupProps) => props.onAsk(),
  },
];

export const TextSelectionPopup: React.FC<TextSelectionPopupProps> = ({
  selectedText,
  position,
  onCopy,
  onAddToChat,
  onExplain,
  onSummarize,
  onAsk,
  onClose,
  loading = false,
  disabled = false,
}) => {
  // ✅ UPDATED: Responsive popup positioning
  const popupRef = React.useRef<HTMLDivElement>(null);
  const [adjusted, setAdjusted] = React.useState(position);

  React.useEffect(() => {
    if (popupRef.current) {
      const rect = popupRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let x = position.x;
      let y = position.y;

      // ✅ NEW: Responsive positioning logic
      const isMobile = viewportWidth < 768;
      const maxWidth = isMobile ? viewportWidth - 16 : 320;
      const maxHeight = isMobile ? viewportHeight * 0.6 : 400;

      // Adjust horizontal position
      if (x + rect.width > viewportWidth - 8) {
        x = viewportWidth - rect.width - 8;
      }
      if (x < 8) x = 8;

      // Adjust vertical position
      if (y + rect.height > viewportHeight - 8) {
        y = viewportHeight - rect.height - 8;
      }
      if (y < 8) y = 8;

      // ✅ NEW: Mobile-specific adjustments
      if (isMobile) {
        // Center horizontally on mobile if too wide
        if (rect.width > maxWidth) {
          x = (viewportWidth - maxWidth) / 2;
        }
        // Ensure it doesn't go off-screen
        x = Math.max(8, Math.min(x, viewportWidth - maxWidth - 8));
      }

      setAdjusted({ x: Math.max(8, x), y: Math.max(8, y) });
    }
  }, [position]);

  return (
    <AnimatePresence>
      <motion.div
        ref={popupRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1, x: adjusted.x, y: adjusted.y }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.18 }}
        className="fixed z-50 bg-gray-900/95 border border-purple-700/40 shadow-xl rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 flex flex-col gap-2 min-w-[200px] sm:min-w-[220px] max-w-[90vw] sm:max-w-xs backdrop-blur-xl"
        style={{ left: 0, top: 0 }}
      >
        {/* ✅ UPDATED: Responsive Header */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-xs sm:text-sm text-purple-300 font-semibold truncate max-w-[120px] sm:max-w-[160px]">Selected Text</span>
          <button
            className="p-1 sm:p-1.5 rounded hover:bg-purple-800/30 transition flex-shrink-0"
            onClick={onClose}
            aria-label="Close popup"
            tabIndex={0}
          >
            <X className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
          </button>
        </div>

        {/* ✅ UPDATED: Responsive Text Display */}
        <div className="text-xs sm:text-sm text-gray-200 bg-gray-800/80 rounded p-2 sm:p-3 max-h-20 sm:max-h-24 overflow-y-auto mb-2 border border-purple-700/10">
          {selectedText.length > (window.innerWidth < 768 ? 80 : 120)
            ? selectedText.slice(0, window.innerWidth < 768 ? 80 : 120) + "..."
            : selectedText}
        </div>

        {/* ✅ UPDATED: Responsive Action Buttons */}
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.key}
                className="flex items-center gap-1 px-2 py-1.5 sm:px-2 sm:py-1 rounded-lg bg-purple-700/20 hover:bg-purple-700/40 text-purple-200 text-xs font-medium transition disabled:opacity-50 flex-1 sm:flex-none min-w-0"
                onClick={() => action.handler({
                  selectedText,
                  position,
                  onCopy,
                  onAddToChat,
                  onExplain,
                  onSummarize,
                  onAsk,
                  onClose,
                  loading,
                  disabled,
                })}
                disabled={loading || disabled}
                tabIndex={0}
              >
                <Icon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">{action.label}</span>
              </button>
            );
          })}
        </div>

        {/* ✅ UPDATED: Responsive Loading State */}
        {loading && (
          <div className="text-xs sm:text-sm text-purple-300 mt-2 animate-pulse text-center">Processing...</div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default TextSelectionPopup;