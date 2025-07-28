"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ZoomIn, ZoomOut, LayoutPanelLeft, MessageCircle, Trash2, Loader2, Download, ExternalLink, BookOpen } from "lucide-react";
import { getPDFById, getPDFContent } from "@/app/actions/pdf-fetch";
import TextSelectionPopup from "@/components/pdf/TextSelectionPopup";
import ChatInterface from "@/components/pdf/ChatInterface";
import PDFViewerClient from "@/components/pdf/PDFViewerClient";
import FlashcardGenerator from "@/components/pdf/FlashcardGenerator";
import MySets from "@/components/pdf/MySets";
import QuizGenerator from "@/components/pdf/QuizGenerator";
import QuizSets from "@/components/pdf/QuizSets";

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

interface PDFData {
  id: string;
  filename: string;
  file_path: string;
  file_size: number;
  upload_status: string;
  created_at: string;
}

export default function PDFViewerPage() {
  // Get PDF ID from URL parameters
  const params = useParams();
  const pdfId = params.id as string;

  // Component state
  const [chatOpen, setChatOpen] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pdfData, setPdfData] = useState<PDFData | null>(null);
  const [basePdfUrl, setBasePdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Text selection state
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(null);
  const [popupLoading, setPopupLoading] = useState(false);

  // ✅ NEW: Chat integration state - THIS IS THE KEY FIX
  const [pendingChatText, setPendingChatText] = useState<string | null>(null);
  const [chatAction, setChatAction] = useState<'add' | 'explain' | 'summarize' | null>(null);

  // ✅ ADD: Page input state for proper synchronization
  const [pageInput, setPageInput] = useState(page.toString());

  // ✅ ADD: Sync pageInput when page changes from buttons
  useEffect(() => {
    setPageInput(page.toString());
  }, [page]);

  // ✅ ADD: State to trigger clear chat
  const [clearChatTrigger, setClearChatTrigger] = useState(0);

  // ✅ ADD: Active tab state for Chat/Flashcards
  const [activeTab, setActiveTab] = useState<'chat' | 'flashcards'>('chat');
  // ✅ ADD: New tab state for the improved navigation
  const [activeTabNew, setActiveTabNew] = useState<'chat' | 'flashcards' | 'quiz' | 'sets'>('chat');

  const [isMounted, setIsMounted] = useState(false);

  // Mount detection
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Generate dynamic PDF URL with current zoom and page
  const pdfUrl = basePdfUrl ? `${basePdfUrl}#toolbar=1&navpanes=1&scrollbar=1&page=${page}&zoom=${Math.round(zoom * 100)}` : null;

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
        setError(null);

        // Use server action to get PDF metadata
        const result = await getPDFById(pdfId);

        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch PDF data');
        }

        if (!result.data) {
          throw new Error('No PDF data returned from server');
        }

        const data = result.data;
        console.log('📄 Fetched PDF data:', data);

        if (data.upload_status !== 'completed') {
          throw new Error(`PDF is still ${data.upload_status}. Please wait or try again later.`);
        }

        setPdfData(data);

        // Get the signed URL for the PDF content
        const contentResult = await getPDFContent(pdfId);

        if (!contentResult.success) {
          throw new Error(contentResult.error || 'Failed to get PDF content URL');
        }

        if (!contentResult.data) {
          throw new Error('No PDF content URL returned from server');
        }

        setBasePdfUrl(contentResult.data.url);
        console.log('📄 PDF URL obtained successfully');

      } catch (error) {
        console.error('❌ Error fetching PDF:', error);
        setError(error instanceof Error ? error.message : 'Failed to load PDF');
      } finally {
        setLoading(false);
      }
    };

    fetchPDFData();
  }, [pdfId]);

  // New: handle text selection from PDF.js
  const handleTextSelection = (text: string, pos: { x: number; y: number }) => {
    if (text && text.trim().length > 0) {
      setSelectedText(text);
      setPopupPos(pos);
    } else {
      setSelectedText(null);
      setPopupPos(null);
    }
  };

  // ✅ UPDATED: Popup action handlers with new chat integration
  const handleCopy = async () => {
    if (selectedText) {
      try {
        await navigator.clipboard.writeText(selectedText);
        // Optional: Show success message
      } catch (err) {
        console.error('Failed to copy text:', err);
      }
    }
    handleClosePopup();
  };

  const handleAddToChat = () => {
    if (selectedText) {
      setPendingChatText(selectedText);
      setChatAction('add');
      setChatOpen(true);
      handleClosePopup();
    }
  };

  const handleExplain = () => {
    if (selectedText) {
      setPendingChatText(selectedText);
      setChatAction('explain');
      setChatOpen(true);
      handleClosePopup();
    }
  };

  const handleSummarize = () => {
    if (selectedText) {
      setPendingChatText(selectedText);
      setChatAction('summarize');
      setChatOpen(true);
      handleClosePopup();
    }
  };

  const handleAsk = () => {
    if (selectedText) {
      setPendingChatText(selectedText);
      setChatAction('add');
      setChatOpen(true);
      handleClosePopup();
    }
  };

  const handleClosePopup = () => {
    setSelectedText(null);
    setPopupPos(null);
  };

  // ✅ NEW: Callback for when ChatInterface processes the pending text
  const handleChatTextProcessed = () => {
    setPendingChatText(null);
    setChatAction(null);
  };

  // ✅ REMOVED: handleClearSelectedText function (replaced by handleChatTextProcessed)

  // Handle PDF download
  const handleDownload = async () => {
    if (!pdfData || !basePdfUrl) return;

    try {
      const response = await fetch(basePdfUrl);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = pdfData.filename;

      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      // You could add a toast notification here
    }
  };

  // Handle opening PDF in new tab
  const handleOpenInNewTab = () => {
    if (basePdfUrl) {
      window.open(basePdfUrl, '_blank');
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col">
      <RetroGrid />
      <div className="absolute top-0 z-[0] h-screen w-screen bg-purple-950/10 bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

      {/* Header with PDF info and actions */}
      {pdfData && !loading && !error && (
        <motion.header
          className="relative z-10 bg-black/20 border-b border-white/10 px-6 py-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 rounded-lg hover:bg-purple-900/30 transition"
                title="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white truncate max-w-md">
                  {pdfData.filename}
                </h1>
                <p className="text-sm text-gray-400">
                  {formatFileSize(pdfData.file_size)} • Uploaded {new Date(pdfData.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-600/80 hover:bg-purple-600 transition text-white text-sm"
                title="Download PDF"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={handleOpenInNewTab}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-600/80 hover:bg-gray-600 transition text-white text-sm"
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4" />
                Open
              </button>
            </div>
          </div>
        </motion.header>
      )}

      <div className="relative z-10 flex-1 flex flex-col md:flex-row h-full">
        {/* PDF Viewer Section */}
        <section className="w-full md:w-3/5 flex flex-col items-center justify-center p-4 md:p-8 bg-black/20 border-r border-white/10 min-h-[60vh]">
          <div className="w-full max-w-4xl h-[85vh] flex items-center justify-center relative">
            {/* PDF rendering and text selection popup */}
            {pdfUrl && (
              <PDFViewerClient
                pdfUrl={pdfUrl}
                page={page}
                totalPages={totalPages}
                zoom={zoom}
                onPageChange={setPage}
                onTextSelect={handleTextSelection}
                onTotalPagesChange={setTotalPages}
              />
            )}
            {selectedText && popupPos && (
              <TextSelectionPopup
                selectedText={selectedText}
                position={popupPos}
                onCopy={handleCopy}
                onAddToChat={handleAddToChat}
                onExplain={handleExplain}
                onSummarize={handleSummarize}
                onAsk={handleAsk}
                onClose={handleClosePopup}
                loading={popupLoading}
              />
            )}
            {/* Floating navigation controls - only show when PDF is loaded */}
            {!loading && !error && pdfUrl && (
              <motion.div
                className="absolute left-1/2 -translate-x-1/2 bottom-4 flex gap-2 bg-black/60 border border-white/10 rounded-xl px-4 py-2 backdrop-blur-xl shadow-lg"
                style={{ minWidth: '280px' }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
              >
                <button
                  className="p-2 rounded-lg hover:bg-purple-900/30 transition disabled:opacity-50 w-10 h-10 flex items-center justify-center flex-shrink-0"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  title="Previous page"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  className="p-2 rounded-lg hover:bg-purple-900/30 transition disabled:opacity-50 w-10 h-10 flex items-center justify-center flex-shrink-0"
                  onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.1).toFixed(1))))}
                  disabled={zoom <= 0.5}
                  title={`Zoom out (${Math.round(zoom * 100)}%)`}
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <div className="px-3 py-1 rounded bg-black/30 border border-white/10 text-sm flex items-center gap-2 min-w-[180px] justify-center whitespace-nowrap">
  <input
    type="text"
    min="1"
    max={totalPages}
    value={pageInput}
    onChange={(e) => {
      const value = e.target.value;
      // Allow only numbers and empty string, with validation against totalPages
      if (value === '' || /^\d+$/.test(value)) {
        const numValue = parseInt(value);
        // Only allow if empty, or if number is within valid range
        if (value === '' || (numValue >= 1 && numValue <= totalPages)) {
          setPageInput(value);
        }
      }
    }}
    onKeyDown={(e) => {
      if (e.key === 'Enter') {
        const newPage = parseInt(pageInput);
        if (!isNaN(newPage) && newPage >= 1 && newPage <= totalPages) {
          setPage(newPage);
        } else {
          // Reset to current page if invalid
          setPageInput(page.toString());
        }
        (e.target as HTMLInputElement).blur();
      }
    }}
    onBlur={() => {
      const pageNum = parseInt(pageInput);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages && pageNum !== page) {
        setPage(pageNum);
      } else {
        // Reset to current page if invalid
        setPageInput(page.toString());
      }
    }}
    className={`w-12 px-2 py-1 text-center bg-black/40 border rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 flex-shrink-0 transition-colors ${
      pageInput && (parseInt(pageInput) < 1 || parseInt(pageInput) > totalPages)
        ? 'border-red-500/50 bg-red-900/20'
        : 'border-white/10'
    }`}
    placeholder={page.toString()}
    title={`Enter page number (1-${totalPages})`}
  />
  <span className={`flex-shrink-0 ${
    pageInput && (parseInt(pageInput) < 1 || parseInt(pageInput) > totalPages)
      ? 'text-red-400'
      : 'text-gray-400'
  }`}>of {totalPages}</span>
  <span className="text-gray-400 flex-shrink-0">•</span>
  <span className="min-w-[32px] text-center flex-shrink-0">{Math.round(zoom * 100)}%</span>
</div>

                <button
                  className="p-2 rounded-lg hover:bg-purple-900/30 transition disabled:opacity-50 w-10 h-10 flex items-center justify-center flex-shrink-0"
                  onClick={() => setZoom((z) => Math.min(3, Number((z + 0.1).toFixed(1))))}
                  disabled={zoom >= 3}
                  title={`Zoom in (${Math.round(zoom * 100)}%)`}
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
                <button
                  className="p-2 rounded-lg hover:bg-purple-900/30 transition w-10 h-10 flex items-center justify-center flex-shrink-0"
                  onClick={() => setPage((p) => p + 1)}
                  title="Next page"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
                {/* Zoom reset button */}
                {zoom !== 1 && (
                  <button
                    className="px-2 py-1 rounded-lg bg-purple-600/50 hover:bg-purple-600/70 transition text-xs h-10 flex items-center justify-center flex-shrink-0"
                    onClick={() => setZoom(1)}
                    title="Reset zoom to 100%"
                  >
                    Reset
                  </button>
                )}
              </motion.div>
            )}
          </div>
        </section>

        {/* ✅ UPDATED: Chat Sidebar with new props */}
        <aside className={`w-full md:w-2/5 flex flex-col bg-black/25 border-l border-white/10 h-[calc(100vh-120px)] transition-all duration-300 ${chatOpen ? "" : "hidden md:flex"}`}>
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10 bg-black/30 flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-xl bg-purple-500/30" />
              <MessageCircle className="relative w-8 h-8 text-purple-400" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-lg text-white">Ask about this PDF</div>
              <div className="text-xs text-purple-300">
                {loading ? "Loading..." : error ? "PDF unavailable" : "Ready to analyze document"}
              </div>
            </div>
            <button
              className="p-2 rounded hover:bg-purple-900/20 transition"
              title="Clear chat history"
              onClick={() => {
                // Trigger clear chat by incrementing the trigger
                setClearChatTrigger(prev => prev + 1);
              }}
            >
              <Trash2 className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* NEW: Improved Tab Navigation */}
          <div className="flex border-b border-white/10 bg-black/20">
            <button
              onClick={() => setActiveTabNew('chat')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition ${
                activeTabNew === 'chat'
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-900/20'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-black/20'
              }`}
            >
              <div className="flex items-center gap-2 justify-center">
                <span>💬</span>
                <span>Chat</span>
                  </div>
            </button>
            <button
              onClick={() => setActiveTabNew('flashcards')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition ${
                activeTabNew === 'flashcards'
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-900/20'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-black/20'
              }`}
            >
              <div className="flex items-center gap-2 justify-center">
                <span>📚</span>
                <span>Flashcards</span>
                </div>
            </button>
            <button
              onClick={() => setActiveTabNew('quiz')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition ${
                activeTabNew === 'quiz'
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-900/20'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-black/20'
              }`}
            >
              <div className="flex items-center gap-2 justify-center">
                <span>❓</span>
                <span>Quiz</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTabNew('sets')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition ${
                activeTabNew === 'sets'
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-900/20'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-black/20'
              }`}
            >
              <div className="flex items-center gap-2 justify-center">
                <span>📂</span>
                <span>My Sets</span>
              </div>
            </button>
              </div>

          {/* ✅ UPDATED: Chat messages area with new ChatInterface props */}
          <div className="flex-1 overflow-hidden">
            {activeTabNew === 'chat' ? (
              <ChatInterface
                pdfId={pdfId}
                docTitle={pdfData?.filename}
                selectedText={pendingChatText || undefined}
                chatAction={chatAction || undefined}
                onClearSelectedText={handleChatTextProcessed}
                clearChatTrigger={clearChatTrigger}
              />
            ) : activeTabNew === 'flashcards' ? (
              <div className="flex flex-col h-full p-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Generate Flashcards</h3>
                  <p className="text-sm text-gray-400">Paste page content to create study cards</p>
                  </div>
                <FlashcardGenerator
                  pdfId={pdfId}
                  pageNumber={page}
                  docTitle={pdfData?.filename}
                />
                </div>
            ) : activeTabNew === 'quiz' ? (
              <div className="flex flex-col h-full p-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Generate Quiz</h3>
                  <p className="text-sm text-gray-400">Create multiple choice questions from page content</p>
                </div>
                <QuizGenerator
                  pdfId={pdfId}
                  pageNumber={page}
                  docTitle={pdfData?.filename}
                />
              </div>
            ) : activeTabNew === 'sets' ? (
              <div className="flex flex-col h-full p-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">My Study Sets</h3>
                  <p className="text-sm text-gray-400">View and manage your saved flashcards and quizzes</p>
            </div>
                <MySets pdfId={pdfId} />
              </div>
            ) : null}
          </div>
        </aside>
      </div>

      {/* OLD: Keep for backward compatibility but hide */}
      <aside className={`w-full md:w-2/5 flex flex-col bg-black/25 border-l border-white/10 h-[calc(100vh-120px)] transition-all duration-300 ${chatOpen ? "" : "hidden md:flex"} hidden`}>
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10 bg-black/30 flex-shrink-0">
          <div className="relative">
            <div className="absolute inset-0 rounded-full blur-xl bg-purple-500/30" />
            <MessageCircle className="relative w-8 h-8 text-purple-400" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-lg text-white">Ask about this PDF</div>
            <div className="text-xs text-purple-300">
              {loading ? "Loading..." : error ? "PDF unavailable" : "Ready to analyze document"}
            </div>
          </div>
          <button
            className="p-2 rounded hover:bg-purple-900/20 transition"
            title="Clear chat history"
            onClick={() => {
              // Trigger clear chat by incrementing the trigger
              setClearChatTrigger(prev => prev + 1);
            }}
          >
            <Trash2 className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-black/20">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition ${
              activeTab === 'chat'
                ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-900/20'
                : 'text-gray-400 hover:text-gray-300 hover:bg-black/20'
            }`}
          >
            <div className="flex items-center gap-2 justify-center">
              <MessageCircle className="w-4 h-4" />
              Chat
            </div>
          </button>
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition ${
              activeTab === 'flashcards'
                ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-900/20'
                : 'text-gray-400 hover:text-gray-300 hover:bg-black/20'
            }`}
          >
            <div className="flex items-center gap-2 justify-center">
              <BookOpen className="w-4 h-4" />
              Flashcards
            </div>
          </button>
        </div>

        {/* ✅ UPDATED: Chat messages area with new ChatInterface props */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'chat' ? (
            <ChatInterface
              pdfId={pdfId}
              docTitle={pdfData?.filename}
              selectedText={pendingChatText || undefined}
              chatAction={chatAction || undefined}
              onClearSelectedText={handleChatTextProcessed}
              clearChatTrigger={clearChatTrigger}
            />
          ) : (
            <div className="flex flex-col h-full">
              {/* Flashcard Generator */}
              <div className="flex-1 overflow-y-auto p-4">
                <FlashcardGenerator
                  pdfId={pdfId}
                  pageNumber={page}
                  docTitle={pdfData?.filename}
                />
              </div>

              {/* Flashcard Sets */}
              <div className="border-t border-white/10 p-4">
                <MySets pdfId={pdfId} />
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile chat toggle button */}
      <button
        className="fixed bottom-6 right-6 z-50 md:hidden p-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg transition"
        onClick={() => setChatOpen((v) => !v)}
        aria-label="Toggle chat sidebar"
      >
        <LayoutPanelLeft className="w-6 h-6" />
      </button>

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(147, 51, 234, 0.7);
        }
      `}</style>
    </div>
  );
}