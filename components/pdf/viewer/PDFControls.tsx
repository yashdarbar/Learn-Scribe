import { ArrowLeft, ArrowRight, ZoomIn, ZoomOut } from "lucide-react";

export function PDFControls({ page, setPage, totalPages, zoom, setZoom }: {
  page: number;
  setPage: (p: number) => void;
  totalPages: number;
  zoom: number;
  setZoom: (z: number) => void;
}) {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-4 flex gap-2 bg-black/40 border border-white/10 rounded-xl px-4 py-2 backdrop-blur-xl shadow-lg">
      <button className="p-2 rounded-lg hover:bg-purple-900/30 transition" onClick={() => setPage(Math.max(1, page - 1))}>
        <ArrowLeft className="w-5 h-5" />
      </button>
      <button className="p-2 rounded-lg hover:bg-purple-900/30 transition" onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}>
        <ZoomOut className="w-5 h-5" />
      </button>
      <span className="px-3 py-1 rounded bg-black/30 border border-white/10 text-sm">
        Page {page} of {totalPages}
      </span>
      <button className="p-2 rounded-lg hover:bg-purple-900/30 transition" onClick={() => setZoom(Math.min(2, zoom + 0.1))}>
        <ZoomIn className="w-5 h-5" />
      </button>
      <button className="p-2 rounded-lg hover:bg-purple-900/30 transition" onClick={() => setPage(Math.min(totalPages, page + 1))}>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}