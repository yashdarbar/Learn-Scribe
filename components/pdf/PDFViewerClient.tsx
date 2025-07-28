import dynamic from "next/dynamic";
import React from "react";
import { Loader2 } from "lucide-react";
import type { PDFViewerWithSelectionProps } from "./PDFViewerWithSelection";

const PDFViewerWithSelection = dynamic(
  () => import("./PDFViewerWithSelection"),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center w-full h-full min-h-[400px]">
        <Loader2 className="w-10 h-10 text-purple-400 animate-spin mb-4" />
        <div className="w-2/3 h-96 bg-white/10 rounded-lg animate-pulse" />
        <div className="text-gray-400 mt-4">Loading PDF viewer...</div>
      </div>
    ),
  }
);

const PDFViewerClient: React.FC<PDFViewerWithSelectionProps> = (props) => {
  return <PDFViewerWithSelection {...props} />;
};

export default PDFViewerClient;