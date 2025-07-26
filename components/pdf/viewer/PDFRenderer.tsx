import { Loader2 } from "lucide-react";

export function PDFRenderer({ loading, page, totalPages, zoom }: { loading: boolean; page: number; totalPages: number; zoom: number }) {
  return (
    <div className="w-full max-w-2xl h-[70vh] flex items-center justify-center relative">
      {loading ? (
        <div className="flex flex-col items-center justify-center w-full h-full">
          <Loader2 className="w-10 h-10 text-purple-400 animate-spin mb-4" />
          <div className="w-2/3 h-96 bg-white/10 rounded-lg animate-pulse" />
          <div className="text-gray-400 mt-4">Loading PDF...</div>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-full h-full bg-black/30 border border-white/10 rounded-lg flex items-center justify-center text-gray-400 text-lg">
            PDF Document Here (Page {page} of {totalPages}, Zoom: {zoom.toFixed(2)}x)
          </div>
        </div>
      )}
    </div>
  );
}