import { useRef } from "react";

export function ChatInput({ value, onChange, onSend, disabled, quickActions = [] }: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled?: boolean;
  quickActions?: { label: string; onClick: () => void }[];
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  return (
    <div>
      <div className="flex gap-2 mb-2">
        {quickActions.map((qa) => (
          <button
            key={qa.label}
            className="px-3 py-1 rounded-lg bg-purple-900/30 text-purple-300 text-xs hover:bg-purple-700/40 transition"
            onClick={qa.onClick}
            type="button"
          >
            {qa.label}
          </button>
        ))}
      </div>
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          rows={1}
          maxLength={500}
          className="flex-1 resize-none rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
          placeholder="Ask me anything about this PDF..."
          style={{ minHeight: 40, maxHeight: 120 }}
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
        />
        <button
          className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition text-white disabled:opacity-50"
          title="Send"
          onClick={onSend}
          disabled={disabled || !value.trim()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-7.5-15-7.5v6l10 1.5-10 1.5v6z" />
          </svg>
        </button>
      </div>
      <div className="text-xs text-gray-400 mt-1 text-right">{value.length}/500</div>
    </div>
  );
}