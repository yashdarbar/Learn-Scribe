import { MessageCircle, Trash2 } from "lucide-react";

export function ChatHeader({ status = "Ready to help", onClear }: { status?: string; onClear?: () => void }) {
  return (
    <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10 bg-black/30">
      <div className="relative">
        <div className="absolute inset-0 rounded-full blur-xl bg-purple-500/30" />
        <MessageCircle className="relative w-8 h-8 text-purple-400" />
      </div>
      <div className="flex-1">
        <div className="font-bold text-lg text-white">Ask about this PDF</div>
        <div className="text-xs text-purple-300">{status}</div>
      </div>
      <button className="p-2 rounded hover:bg-purple-900/20 transition" title="Clear chat" onClick={onClear}>
        <Trash2 className="w-5 h-5 text-gray-400" />
      </button>
    </div>
  );
}