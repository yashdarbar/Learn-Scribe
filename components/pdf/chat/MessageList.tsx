export function MessageList({ messages }: { messages: { id: string; type: "user" | "ai"; content: string; timestamp: string }[] }) {
  return (
    <div className="flex flex-col gap-4">
      {messages.map((msg) =>
        msg.type === "user" ? (
          <div key={msg.id} className="self-end max-w-[70%] bg-blue-600/80 text-white rounded-xl px-4 py-2 shadow-md">
            {msg.content}
            <span className="block text-xs text-gray-300 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        ) : (
          <div key={msg.id} className="self-start max-w-[70%] bg-gray-700/80 text-white rounded-xl px-4 py-2 shadow-md flex gap-2">
            <span className="inline-block align-top">
              <span className="relative block w-6 h-6 rounded-full bg-purple-500/40 mr-2" />
            </span>
            <span>
              {msg.content}
              <span className="block text-xs text-gray-300 mt-1">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </span>
          </div>
        )
      )}
    </div>
  );
}