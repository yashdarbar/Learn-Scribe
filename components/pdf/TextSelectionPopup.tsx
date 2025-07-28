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
  // Adjust popup position to avoid screen edges
  const popupRef = React.useRef<HTMLDivElement>(null);
  const [adjusted, setAdjusted] = React.useState(position);

  React.useEffect(() => {
    if (popupRef.current) {
      const rect = popupRef.current.getBoundingClientRect();
      let x = position.x;
      let y = position.y;
      if (x + rect.width > window.innerWidth) x = window.innerWidth - rect.width - 8;
      if (y + rect.height > window.innerHeight) y = window.innerHeight - rect.height - 8;
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
        className="fixed z-50 bg-gray-900/95 border border-purple-700/40 shadow-xl rounded-xl px-4 py-3 flex flex-col gap-2 min-w-[220px] max-w-xs"
        style={{ left: 0, top: 0 }}
      >
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-xs text-purple-300 font-semibold truncate max-w-[160px]">Selected Text</span>
          <button
            className="p-1 rounded hover:bg-purple-800/30 transition"
            onClick={onClose}
            aria-label="Close popup"
            tabIndex={0}
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <div className="text-xs text-gray-200 bg-gray-800/80 rounded p-2 max-h-24 overflow-y-auto mb-2 border border-purple-700/10">
          {selectedText.length > 120 ? selectedText.slice(0, 120) + "..." : selectedText}
        </div>
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.key}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-700/20 hover:bg-purple-700/40 text-purple-200 text-xs font-medium transition disabled:opacity-50"
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
                <Icon className="w-4 h-4" />
                {action.label}
              </button>
            );
          })}
        </div>
        {loading && (
          <div className="text-xs text-purple-300 mt-2 animate-pulse">Processing...</div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default TextSelectionPopup;