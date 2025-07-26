import { ReactNode } from "react";

export function ChatSidebar({ children, open = true }: { children: ReactNode; open?: boolean }) {
  if (!open) return null;
  return (
    <aside className="w-full md:w-2/5 flex flex-col bg-black/25 border-l border-white/10 min-h-[60vh] transition-all duration-300">
      {children}
    </aside>
  );
}