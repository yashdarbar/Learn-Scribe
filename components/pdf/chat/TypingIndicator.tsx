export function TypingIndicator() {
  return (
    <div className="self-start flex items-center gap-2 mt-2">
      <span className="inline-block w-6 h-6 rounded-full bg-purple-500/40" />
      <span className="flex gap-1">
        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "100ms" }} />
        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "200ms" }} />
      </span>
      <span className="text-xs text-gray-400 ml-2">AI is typing…</span>
    </div>
  );
}