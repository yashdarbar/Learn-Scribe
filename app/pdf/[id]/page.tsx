"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ZoomIn, ZoomOut, LayoutPanelLeft, MessageCircle, Trash2, Loader2 } from "lucide-react";

// --- RetroGrid copied from dashboard ---
const RetroGrid = ({ angle = 65, cellSize = 60, opacity = 0.3, lineColor = "rgba(120,119,198,0.3)" }) => {
  const gridStyles = {
    "--grid-angle": `${angle}deg`,
    "--cell-size": `${cellSize}px`,
    "--opacity": opacity,
    "--line-color": lineColor,
  } as React.CSSProperties;

  return (
    <div className="pointer-events-none absolute size-full overflow-hidden [perspective:200px]" style={{ opacity }}>
      <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))]" style={gridStyles}>
        <div className="animate-grid [background-image:linear-gradient(to_right,var(--line-color)_1px,transparent_0),linear-gradient(to_bottom,var(--line-color)_1px,transparent_0)] [background-repeat:repeat] [background-size:var(--cell-size)_var(--cell-size)] [height:300vh] [inset:0%_0px] [margin-left:-200%] [transform-origin:100%_0_0] [width:600vw]" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent to-90%" />
    </div>
  );
};

export default function PDFViewerPage() {
  // Get PDF ID from URL parameters
  const params = useParams();
  const pdfId = params.id as string;

  // Component state
  const [chatOpen, setChatOpen] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(25);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pdfData, setPdfData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Console log the PDF ID for debugging
  console.log('📄 PDF ID from URL:', pdfId);

  // Fetch PDF data when component mounts
  useEffect(() => {
    const fetchPDFData = async () => {
      if (!pdfId) {
        setError("No PDF ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch PDF data from your API
        const response = await fetch(`/api/pdf/${pdfId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch PDF: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('📄 Fetched PDF data:', data);

        setPdfData(data);
        setError(null);

        // You might want to set total pages from the API response
        // setTotalPages(data.totalPages || 25);

      } catch (error) {
        console.error('❌ Error fetching PDF:', error);
        setError(error instanceof Error ? error.message : 'Failed to load PDF');
      } finally {
        setLoading(false);
      }
    };

    fetchPDFData();
  }, [pdfId]);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col">
      <RetroGrid />
      <div className="absolute top-0 z-[0] h-screen w-screen bg-purple-950/10 bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

      <div className="relative z-10 flex-1 flex flex-col md:flex-row h-full">
        {/* PDF Viewer Section */}
        <section className="w-full md:w-3/5 flex flex-col items-center justify-center p-4 md:p-8 bg-black/20 border-r border-white/10 min-h-[60vh]">
          <div className="w-full max-w-2xl h-[70vh] flex items-center justify-center relative">
            {/* Loading skeleton */}
            {loading ? (
              <div className="flex flex-col items-center justify-center w-full h-full">
                <Loader2 className="w-10 h-10 text-purple-400 animate-spin mb-4" />
                <div className="w-2/3 h-96 bg-white/10 rounded-lg animate-pulse" />
                <div className="text-gray-400 mt-4">Loading PDF...</div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center w-full h-full">
                <div className="w-full h-full bg-red-900/20 border border-red-500/20 rounded-lg flex flex-col items-center justify-center text-red-400 text-lg">
                  <div className="text-center p-8">
                    <h2 className="text-2xl font-bold text-red-300 mb-4">Error Loading PDF</h2>
                    <p className="text-sm">{error}</p>
                    <p className="text-xs mt-2 text-gray-400">PDF ID: {pdfId}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {/* PDF rendering placeholder */}
                <div className="w-full h-full bg-black/30 border border-white/10 rounded-lg flex flex-col items-center justify-center text-gray-400 text-lg">
                  <div className="text-center p-8">
                    <h2 className="text-2xl font-bold text-white mb-4">PDF Viewer</h2>
                    <p>PDF ID: {pdfId}</p>
                    {pdfData && (
                      <div className="mt-4 text-sm">
                        <p>Filename: {pdfData.filename || 'Unknown'}</p>
                        <p>Upload Status: {pdfData.upload_status || 'Unknown'}</p>
                      </div>
                    )}
                    <p className="text-sm mt-4 text-purple-300">PDF rendering will be implemented here</p>
                  </div>
                </div>
              </div>
            )}

            {/* Floating navigation controls - only show when not loading/error */}
            {!loading && !error && (
              <motion.div
                className="absolute left-1/2 -translate-x-1/2 bottom-4 flex gap-2 bg-black/40 border border-white/10 rounded-xl px-4 py-2 backdrop-blur-xl shadow-lg"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <button className="p-2 rounded-lg hover:bg-purple-900/30 transition" onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-lg hover:bg-purple-900/30 transition" onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}>
                  <ZoomOut className="w-5 h-5" />
                </button>
                <span className="px-3 py-1 rounded bg-black/30 border border-white/10 text-sm">
                  Page {page} of {totalPages}
                </span>
                <button className="p-2 rounded-lg hover:bg-purple-900/30 transition" onClick={() => setZoom((z) => Math.min(2, z + 0.1))}>
                  <ZoomIn className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-lg hover:bg-purple-900/30 transition" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </div>
        </section>

        {/* Chat Sidebar */}
        <aside className={`w-full md:w-2/5 flex flex-col bg-black/25 border-l border-white/10 min-h-[60vh] transition-all duration-300 ${chatOpen ? "" : "hidden md:flex"}`}>
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10 bg-black/30">
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-xl bg-purple-500/30" />
              <MessageCircle className="relative w-8 h-8 text-purple-400" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-lg text-white">Ask about this PDF</div>
              <div className="text-xs text-purple-300">
                {loading ? "Loading..." : error ? "Error" : "Ready to help"}
              </div>
            </div>
            <button className="p-2 rounded hover:bg-purple-900/20 transition" title="Clear chat">
              <Trash2 className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Chat messages area */}
          <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
            <div className="flex flex-col gap-4">
              {/* Example user message */}
              <div className="self-end max-w-[70%] bg-blue-600/80 text-white rounded-xl px-4 py-2 shadow-md">
                What is this document about?
                <span className="block text-xs text-gray-300 mt-1 text-right">12:01 PM</span>
              </div>

              {/* Example AI message */}
              <div className="self-start max-w-[70%] bg-gray-700/80 text-white rounded-xl px-4 py-2 shadow-md flex gap-2">
                <span className="inline-block align-top">
                  <span className="relative block w-6 h-6 rounded-full bg-purple-500/40 mr-2" />
                </span>
                <span>
                  {loading ? "Loading PDF data..." :
                   error ? "I'm having trouble accessing this PDF." :
                   `This is PDF document with ID: ${pdfId}. ${pdfData ? `The filename is "${pdfData.filename}".` : ''} I can help you analyze and understand its content.`}
                  <span className="block text-xs text-gray-300 mt-1">12:01 PM</span>
                </span>
              </div>

              {/* Conditional typing indicator */}
              {!loading && !error && (
                <div className="self-start flex items-center gap-2 mt-2">
                  <span className="inline-block w-6 h-6 rounded-full bg-purple-500/40" />
                  <span className="flex gap-1">
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "100ms" }} />
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "200ms" }} />
                  </span>
                  <span className="text-xs text-gray-400 ml-2">AI is ready to help…</span>
                </div>
              )}
            </div>
          </div>

          {/* Input section */}
          <div className="px-6 py-4 border-t border-white/10 bg-black/30">
            <div className="flex gap-2 mb-2 flex-wrap">
              <button
                className="px-3 py-1 rounded-lg bg-purple-900/30 text-purple-300 text-xs hover:bg-purple-700/40 transition disabled:opacity-50"
                disabled={loading || !!error}
              >
                Summarize Document
              </button>
              <button
                className="px-3 py-1 rounded-lg bg-purple-900/30 text-purple-300 text-xs hover:bg-purple-700/40 transition disabled:opacity-50"
                disabled={loading || !!error}
              >
                Generate Quiz
              </button>
              <button
                className="px-3 py-1 rounded-lg bg-purple-900/30 text-purple-300 text-xs hover:bg-purple-700/40 transition disabled:opacity-50"
                disabled={loading || !!error}
              >
                Key Points
              </button>
              <button
                className="px-3 py-1 rounded-lg bg-purple-900/30 text-purple-300 text-xs hover:bg-purple-700/40 transition disabled:opacity-50"
                disabled={loading || !!error}
              >
                Explain Terms
              </button>
            </div>
            <div className="flex items-end gap-2">
              <textarea
                rows={1}
                maxLength={500}
                className="flex-1 resize-none rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm disabled:opacity-50"
                placeholder={loading ? "Loading PDF..." : error ? "PDF unavailable" : "Ask me anything about this PDF..."}
                style={{ minHeight: 40, maxHeight: 120 }}
                disabled={loading || !!error}
              />
              <button
                className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition text-white disabled:opacity-50"
                title="Send"
                disabled={loading || !!error}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-7.5-15-7.5v6l10 1.5-10 1.5v6z" />
                </svg>
              </button>
            </div>
            <div className="text-xs text-gray-400 mt-1 text-right">0/500</div>
          </div>
        </aside>
      </div>

      {/* Mobile chat toggle button */}
      <button
        className="fixed bottom-6 right-6 z-50 md:hidden p-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg transition"
        onClick={() => setChatOpen((v) => !v)}
        aria-label="Toggle chat sidebar"
      >
        <LayoutPanelLeft className="w-6 h-6" />
      </button>
    </div>
  );
}


// import { useState } from "react";
// import { motion } from "framer-motion";
// import { ArrowLeft, ArrowRight, ZoomIn, ZoomOut, LayoutPanelLeft, MessageCircle, Trash2, Loader2 } from "lucide-react";

// // --- RetroGrid copied from dashboard ---
// const RetroGrid = ({ angle = 65, cellSize = 60, opacity = 0.3, lineColor = "rgba(120,119,198,0.3)" }) => {
//   const gridStyles = {
//     "--grid-angle": `${angle}deg`,
//     "--cell-size": `${cellSize}px`,
//     "--opacity": opacity,
//     "--line-color": lineColor,
//   } as React.CSSProperties;

//   return (
//     <div className="pointer-events-none absolute size-full overflow-hidden [perspective:200px]" style={{ opacity }}>
//       <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))]" style={gridStyles}>
//         <div className="animate-grid [background-image:linear-gradient(to_right,var(--line-color)_1px,transparent_0),linear-gradient(to_bottom,var(--line-color)_1px,transparent_0)] [background-repeat:repeat] [background-size:var(--cell-size)_var(--cell-size)] [height:300vh] [inset:0%_0px] [margin-left:-200%] [transform-origin:100%_0_0] [width:600vw]" />
//       </div>
//       <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent to-90%" />
//     </div>
//   );
// };

// export default function PDFViewerPage() {
//   // Responsive sidebar toggle for mobile/tablet
//   const [chatOpen, setChatOpen] = useState(true);
//   // Placeholder state for PDF viewer
//   const [page, setPage] = useState(1);
//   const totalPages = 25;
//   const [zoom, setZoom] = useState(1);
//   const [loading, setLoading] = useState(false);

//   return (
//     <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col">
//       <RetroGrid />
//       <div className="absolute top-0 z-[0] h-screen w-screen bg-purple-950/10 bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
//       <div className="relative z-10 flex-1 flex flex-col md:flex-row h-full">
//         {/* PDF Viewer Section */}
//         <section className="w-full md:w-3/5 flex flex-col items-center justify-center p-4 md:p-8 bg-black/20 border-r border-white/10 min-h-[60vh]">
//           <div className="w-full max-w-2xl h-[70vh] flex items-center justify-center relative">
//             {/* Loading skeleton */}
//             {loading ? (
//               <div className="flex flex-col items-center justify-center w-full h-full">
//                 <Loader2 className="w-10 h-10 text-purple-400 animate-spin mb-4" />
//                 <div className="w-2/3 h-96 bg-white/10 rounded-lg animate-pulse" />
//                 <div className="text-gray-400 mt-4">Loading PDF...</div>
//               </div>
//             ) : (
//               <div className="w-full h-full flex items-center justify-center">
//                 {/* PDF rendering placeholder */}
//                 <div className="w-full h-full bg-black/30 border border-white/10 rounded-lg flex items-center justify-center text-gray-400 text-lg">
//                   PDF Document Here
//                 </div>
//               </div>
//             )}
//             {/* Floating navigation controls */}
//             <motion.div
//               className="absolute left-1/2 -translate-x-1/2 bottom-4 flex gap-2 bg-black/40 border border-white/10 rounded-xl px-4 py-2 backdrop-blur-xl shadow-lg"
//               initial={{ opacity: 0, y: 16 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.4, ease: "easeOut" }}
//             >
//               <button className="p-2 rounded-lg hover:bg-purple-900/30 transition" onClick={() => setPage((p) => Math.max(1, p - 1))}>
//                 <ArrowLeft className="w-5 h-5" />
//               </button>
//               <button className="p-2 rounded-lg hover:bg-purple-900/30 transition" onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}>
//                 <ZoomOut className="w-5 h-5" />
//               </button>
//               <span className="px-3 py-1 rounded bg-black/30 border border-white/10 text-sm">
//                 Page {page} of {totalPages}
//               </span>
//               <button className="p-2 rounded-lg hover:bg-purple-900/30 transition" onClick={() => setZoom((z) => Math.min(2, z + 0.1))}>
//                 <ZoomIn className="w-5 h-5" />
//               </button>
//               <button className="p-2 rounded-lg hover:bg-purple-900/30 transition" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
//                 <ArrowRight className="w-5 h-5" />
//               </button>
//             </motion.div>
//           </div>
//         </section>
//         {/* Chat Sidebar */}
//         <aside className={`w-full md:w-2/5 flex flex-col bg-black/25 border-l border-white/10 min-h-[60vh] transition-all duration-300 ${chatOpen ? "" : "hidden md:flex"}`}>
//           {/* Header */}
//           <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10 bg-black/30">
//             <div className="relative">
//               <div className="absolute inset-0 rounded-full blur-xl bg-purple-500/30" />
//               <MessageCircle className="relative w-8 h-8 text-purple-400" />
//             </div>
//             <div className="flex-1">
//               <div className="font-bold text-lg text-white">Ask about this PDF</div>
//               <div className="text-xs text-purple-300">Ready to help</div>
//             </div>
//             <button className="p-2 rounded hover:bg-purple-900/20 transition" title="Clear chat">
//               <Trash2 className="w-5 h-5 text-gray-400" />
//             </button>
//           </div>
//           {/* Chat messages area (placeholder) */}
//           <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
//             <div className="flex flex-col gap-4">
//               {/* Example user message */}
//               <div className="self-end max-w-[70%] bg-blue-600/80 text-white rounded-xl px-4 py-2 shadow-md">
//                 What is this document about?
//                 <span className="block text-xs text-gray-300 mt-1 text-right">12:01 PM</span>
//               </div>
//               {/* Example AI message */}
//               <div className="self-start max-w-[70%] bg-gray-700/80 text-white rounded-xl px-4 py-2 shadow-md flex gap-2">
//                 <span className="inline-block align-top">
//                   <span className="relative block w-6 h-6 rounded-full bg-purple-500/40 mr-2" />
//                 </span>
//                 <span>
//                   This document appears to be about machine learning basics, covering fundamental concepts and algorithms.
//                   <span className="block text-xs text-gray-300 mt-1">12:01 PM</span>
//                 </span>
//               </div>
//               {/* Typing indicator */}
//               <div className="self-start flex items-center gap-2 mt-2">
//                 <span className="inline-block w-6 h-6 rounded-full bg-purple-500/40" />
//                 <span className="flex gap-1">
//                   <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
//                   <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "100ms" }} />
//                   <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "200ms" }} />
//                 </span>
//                 <span className="text-xs text-gray-400 ml-2">AI is typing…</span>
//               </div>
//             </div>
//           </div>
//           {/* Input section */}
//           <div className="px-6 py-4 border-t border-white/10 bg-black/30">
//             <div className="flex gap-2 mb-2">
//               <button className="px-3 py-1 rounded-lg bg-purple-900/30 text-purple-300 text-xs hover:bg-purple-700/40 transition">Summarize Document</button>
//               <button className="px-3 py-1 rounded-lg bg-purple-900/30 text-purple-300 text-xs hover:bg-purple-700/40 transition">Generate Quiz</button>
//               <button className="px-3 py-1 rounded-lg bg-purple-900/30 text-purple-300 text-xs hover:bg-purple-700/40 transition">Key Points</button>
//               <button className="px-3 py-1 rounded-lg bg-purple-900/30 text-purple-300 text-xs hover:bg-purple-700/40 transition">Explain Terms</button>
//             </div>
//             <div className="flex items-end gap-2">
//               <textarea
//                 rows={1}
//                 maxLength={500}
//                 className="flex-1 resize-none rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
//                 placeholder="Ask me anything about this PDF..."
//                 style={{ minHeight: 40, maxHeight: 120 }}
//               />
//               <button className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition text-white disabled:opacity-50" title="Send">
//                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-7.5-15-7.5v6l10 1.5-10 1.5v6z" />
//                 </svg>
//               </button>
//             </div>
//             <div className="text-xs text-gray-400 mt-1 text-right">0/500</div>
//           </div>
//         </aside>
//       </div>
//       {/* Mobile chat toggle button */}
//       <button
//         className="fixed bottom-6 right-6 z-50 md:hidden p-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg transition"
//         onClick={() => setChatOpen((v) => !v)}
//         aria-label="Toggle chat sidebar"
//       >
//         <LayoutPanelLeft className="w-6 h-6" />
//       </button>
//     </div>
//   );
// }
