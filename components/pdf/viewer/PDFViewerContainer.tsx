import { ReactNode } from "react";

export function PDFViewerContainer({ children }: { children: ReactNode }) {
  return (
    <div className="relative z-10 flex-1 flex flex-col md:flex-row h-full">
      {children}
    </div>
  );
}