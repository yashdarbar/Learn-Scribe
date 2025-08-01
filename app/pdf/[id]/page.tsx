"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, ZoomIn, ZoomOut, LayoutPanelLeft, MessageCircle, Trash2, Loader2, Download, ExternalLink, BookOpen, Menu, X } from "lucide-react";
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
  const [chatOpen, setChatOpen] = useState(false); // Start closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar state
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
  const [chatAction, setChatAction] = useState<'add' | 'explain' | 'summarize' | 'flashcards' | null>(null);

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

  // ✅ NEW: Context-aware text selection
  const [activeChatContext, setActiveChatContext] = useState<'chat' | 'flashcards' | 'quiz' | 'sets'>('chat');

  // ✅ NEW: Persistent flashcard state across section switches
  const [persistentFlashcards, setPersistentFlashcards] = useState<{
    flashcards: any[];
    title: string;
    isSaved: boolean;
  } | null>(null);

  // ✅ NEW: Quiz persistence state
  const [persistentQuiz, setPersistentQuiz] = useState<{
    questions: any[];
    title: string;
    isSaved: boolean;
  } | null>(null);

  const [isMounted, setIsMounted] = useState(false);

  // Mount detection
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ✅ NEW: Update active chat context when tab changes
  useEffect(() => {
    setActiveChatContext(activeTabNew);
  }, [activeTabNew]);

  // ✅ NEW: Listen for page change events from FlashcardGenerator
  useEffect(() => {
    const handlePageChange = (event: CustomEvent) => {
      const newPage = event.detail.page;
      if (newPage && newPage >= 1 && newPage <= totalPages) {
        setPage(newPage);
      }
    };

    window.addEventListener('changePage', handlePageChange as EventListener);

    return () => {
      window.removeEventListener('changePage', handlePageChange as EventListener);
    };
  }, [totalPages]);

  // ✅ NEW: Auto-open chat on desktop, keep closed on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setChatOpen(true);
        setSidebarOpen(false);
      } else {
        setChatOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  // ✅ UPDATED: Context-aware popup action handlers
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

      // ✅ NEW: Context-aware routing
      // Switch to appropriate tab based on active context
      if (activeChatContext !== 'chat') {
        setActiveTabNew(activeChatContext);
      }

      // Open chat sidebar on mobile
      if (window.innerWidth < 768) {
        setChatOpen(true);
        setSidebarOpen(true);
      }

      handleClosePopup();
    }
  };

  const handleExplain = () => {
    if (selectedText) {
      setPendingChatText(selectedText);
      setChatAction('explain');

      // ✅ NEW: Context-aware routing
      if (activeChatContext !== 'chat') {
        setActiveTabNew(activeChatContext);
      }

      if (window.innerWidth < 768) {
        setChatOpen(true);
        setSidebarOpen(true);
      }

      handleClosePopup();
    }
  };

  const handleSummarize = () => {
    if (selectedText) {
      setPendingChatText(selectedText);
      setChatAction('summarize');

      // ✅ NEW: Context-aware routing
      if (activeChatContext !== 'chat') {
        setActiveTabNew(activeChatContext);
      }

      if (window.innerWidth < 768) {
        setChatOpen(true);
        setSidebarOpen(true);
      }

      handleClosePopup();
    }
  };

  const handleAsk = () => {
    if (selectedText) {
      setPendingChatText(selectedText);
      setChatAction('add');

      // ✅ NEW: Context-aware routing
      if (activeChatContext !== 'chat') {
        setActiveTabNew(activeChatContext);
      }

      if (window.innerWidth < 768) {
        setChatOpen(true);
        setSidebarOpen(true);
      }

      handleClosePopup();
    }
  };

  const handleCreateFlashcards = () => {
    if (selectedText) {
      setPendingChatText(selectedText);
      setChatAction('flashcards');

      // ✅ NEW: Switch to flashcards tab and auto-generate
      setActiveTabNew('flashcards');

      // Open chat sidebar on mobile
      if (window.innerWidth < 768) {
        setChatOpen(true);
        setSidebarOpen(true);
      }

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

  // ✅ NEW: Handle flashcard persistence
  const handleFlashcardGenerated = (flashcards: any[], title: string) => {
    setPersistentFlashcards({
      flashcards,
      title,
      isSaved: false
    });
  };

  // ✅ NEW: Handle flashcard saved
  const handleFlashcardSaved = () => {
    if (persistentFlashcards) {
      setPersistentFlashcards({
        ...persistentFlashcards,
        isSaved: true
      });
    }
  };

  // ✅ NEW: Handle flashcard clear
  const handleFlashcardClear = () => {
    setPersistentFlashcards(null);
  };

  // ✅ NEW: Quiz persistence handlers
  const handleQuizGenerated = (questions: any[], title: string) => {
    setPersistentQuiz({
      questions,
      title,
      isSaved: false
    });
  };

  const handleQuizSaved = () => {
    if (persistentQuiz) {
      setPersistentQuiz({
        ...persistentQuiz,
        isSaved: true
      });
    }
  };

  const handleQuizClear = () => {
    setPersistentQuiz(null);
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

  // ✅ NEW: Mobile sidebar toggle
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // ✅ NEW: Close sidebar on overlay click
  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col">
      <RetroGrid />
      <div className="absolute top-0 z-[0] h-screen w-screen bg-purple-950/10 bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

      {/* ✅ UPDATED: Responsive Header */}
      {pdfData && !loading && !error && (
        <motion.header
          className="relative z-10 bg-black/20 border-b border-white/10 px-4 sm:px-6 py-3 sm:py-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              <button
                onClick={() => window.history.back()}
                className="p-2 rounded-lg hover:bg-purple-900/30 transition flex-shrink-0"
                title="Go back"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <div className="flex-1 min-w-0">
                <h1 className="text-sm sm:text-xl font-bold text-white truncate">
                  {pdfData.filename}
                </h1>
                <p className="text-xs sm:text-sm text-gray-400 truncate">
                  {formatFileSize(pdfData.file_size)} • Uploaded {new Date(pdfData.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Mobile menu button */}
              <button
                onClick={toggleSidebar}
                className="md:hidden p-2 rounded-lg hover:bg-purple-900/30 transition"
                title="Toggle sidebar"
              >
                <Menu className="w-4 h-4" />
              </button>

            </div>
          </div>
        </motion.header>
      )}

      {/* ✅ UPDATED: Responsive Main Layout */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row h-full">
        {/* ✅ UPDATED: PDF Viewer Section - Responsive */}
        <section className="w-full lg:w-3/5 flex flex-col items-center justify-center p-2 sm:p-4 lg:p-8 bg-black/20 border-r border-white/10 min-h-[50vh] lg:min-h-[60vh] relative">
          <div className="w-full max-w-4xl h-[70vh] sm:h-[75vh] lg:h-[85vh] flex items-center justify-center relative">
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
                onCreateFlashcards={handleCreateFlashcards}
                onClose={handleClosePopup}
                loading={popupLoading}
              />
            )}

            {/* ✅ UPDATED: Responsive Floating Navigation Controls */}
            {!loading && !error && pdfUrl && (
              <motion.div
                className="absolute left-1/2 -translate-x-1/2 bottom-2 sm:bottom-4 flex gap-1 sm:gap-2 bg-black/80 border border-white/10 rounded-lg sm:rounded-xl px-2 sm:px-4 py-1 sm:py-2 backdrop-blur-xl shadow-lg"
                style={{ minWidth: '240px', maxWidth: '90vw' }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
              >
                <button
                  className="p-1.5 sm:p-2 rounded-lg hover:bg-purple-900/30 transition disabled:opacity-50 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  title="Previous page"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  className="p-1.5 sm:p-2 rounded-lg hover:bg-purple-900/30 transition disabled:opacity-50 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0"
                  onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.1).toFixed(1))))}
                  disabled={zoom <= 0.5}
                  title={`Zoom out (${Math.round(zoom * 100)}%)`}
                >
                  <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {/* ✅ UPDATED: Responsive Page Input */}
                <div className="px-2 sm:px-3 py-1 rounded bg-black/30 border border-white/10 text-xs sm:text-sm flex items-center gap-1 sm:gap-2 min-w-[120px] sm:min-w-[140px] justify-center whitespace-nowrap">
                  <input
                    type="text"
                    min="1"
                    max={totalPages}
                    value={pageInput}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d+$/.test(value)) {
                        const numValue = parseInt(value);
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
                        setPageInput(page.toString());
                      }
                    }}
                    className={`w-8 sm:w-12 px-1 sm:px-2 py-1 text-center bg-black/40 border rounded text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 flex-shrink-0 transition-colors ${
                      pageInput && (parseInt(pageInput) < 1 || parseInt(pageInput) > totalPages)
                        ? 'border-red-500/50 bg-red-900/20'
                        : 'border-white/10'
                    }`}
                    placeholder={page.toString()}
                    title={`Enter page number (1-${totalPages})`}
                  />
                  <span className={`flex-shrink-0 text-xs sm:text-sm ${
                    pageInput && (parseInt(pageInput) < 1 || parseInt(pageInput) > totalPages)
                      ? 'text-red-400'
                      : 'text-gray-400'
                  }`}>of {totalPages}</span>
                  <span className="text-gray-400 flex-shrink-0 text-xs sm:text-sm">•</span>
                  <span className="min-w-[24px] sm:min-w-[32px] text-center flex-shrink-0 text-xs sm:text-sm">{Math.round(zoom * 100)}%</span>
                </div>

                <button
                  className="p-1.5 sm:p-2 rounded-lg hover:bg-purple-900/30 transition disabled:opacity-50 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0"
                  onClick={() => setZoom((z) => Math.min(3, Number((z + 0.1).toFixed(1))))}
                  disabled={zoom >= 3}
                  title={`Zoom in (${Math.round(zoom * 100)}%)`}
                >
                  <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  className="p-1.5 sm:p-2 rounded-lg hover:bg-purple-900/30 transition w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0"
                  onClick={() => setPage((p) => p + 1)}
                  title="Next page"
                >
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {/* ✅ UPDATED: Responsive Zoom Reset Button */}
                {zoom !== 1 && (
                  <button
                    className="px-1.5 sm:px-2 py-1 rounded-lg bg-purple-600/50 hover:bg-purple-600/70 transition text-xs h-8 sm:h-10 flex items-center justify-center flex-shrink-0"
                    onClick={() => setZoom(1)}
                    title="Reset zoom to 100%"
                  >
                    <span className="hidden sm:inline">Reset</span>
                    <span className="sm:hidden">R</span>
                  </button>
                )}
              </motion.div>
            )}
          </div>
        </section>

        {/* ✅ UPDATED: Responsive Chat Sidebar */}
        <aside className={`w-full lg:w-2/5 flex flex-col bg-black/25 border-l border-white/10 h-[calc(100vh-120px)] lg:h-[calc(100vh-120px)] transition-all duration-300 ${
          chatOpen ? "flex" : "hidden lg:flex"
        }`}>
          {/* ✅ UPDATED: Responsive Header */}
          <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 bg-black/30 flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-xl bg-purple-500/30" />
              <MessageCircle className="relative w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-base sm:text-lg text-white truncate">Ask about this PDF</div>
              <div className="text-xs text-purple-300 truncate">
                {loading ? "Loading..." : error ? "PDF unavailable" : "Ready to analyze document"}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                className="p-1.5 sm:p-2 rounded hover:bg-purple-900/20 transition"
                title="Clear chat history"
                onClick={() => {
                  setClearChatTrigger(prev => prev + 1);
                }}
              >
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              </button>
              {/* Mobile close button */}
              <button
                onClick={() => setChatOpen(false)}
                className="lg:hidden p-1.5 sm:p-2 rounded hover:bg-purple-900/20 transition"
                title="Close sidebar"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* ✅ UPDATED: Responsive Tab Navigation */}
          <div className="flex border-b border-white/10 bg-black/20 overflow-x-auto">
            <button
              onClick={() => setActiveTabNew('chat')}
              className={`flex-1 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                activeTabNew === 'chat'
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-900/20'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-black/20'
              }`}
            >
              <div className="flex items-center gap-1 sm:gap-2 justify-center">
                <span className="text-xs sm:text-sm">💬</span>
                <span className="hidden sm:inline">Chat</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTabNew('flashcards')}
              className={`flex-1 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                activeTabNew === 'flashcards'
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-900/20'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-black/20'
              }`}
            >
              <div className="flex items-center gap-1 sm:gap-2 justify-center">
                <span className="text-xs sm:text-sm">📚</span>
                <span className="hidden sm:inline">Flashcards</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTabNew('quiz')}
              className={`flex-1 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                activeTabNew === 'quiz'
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-900/20'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-black/20'
              }`}
            >
              <div className="flex items-center gap-1 sm:gap-2 justify-center">
                <span className="text-xs sm:text-sm">❓</span>
                <span className="hidden sm:inline">Quiz</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTabNew('sets')}
              className={`flex-1 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                activeTabNew === 'sets'
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-900/20'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-black/20'
              }`}
            >
              <div className="flex items-center gap-1 sm:gap-2 justify-center">
                <span className="text-xs sm:text-sm">📂</span>
                <span className="hidden sm:inline">My Sets</span>
              </div>
            </button>
          </div>

          {/* ✅ UPDATED: Responsive Chat Content */}
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
              <div className="flex flex-col h-full p-2 sm:p-4">
                <FlashcardGenerator
                  pdfId={pdfId}
                  pageNumber={page}
                  docTitle={pdfData?.filename}
                  selectedText={activeTabNew === 'flashcards' ? pendingChatText || undefined : undefined}
                  chatAction={activeTabNew === 'flashcards' ? chatAction || undefined : undefined}
                  onClearSelectedText={handleChatTextProcessed}
                  totalPages={totalPages}
                  onFlashcardGenerated={handleFlashcardGenerated}
                  onFlashcardSaved={handleFlashcardSaved}
                  onFlashcardClear={handleFlashcardClear}
                  persistentFlashcards={persistentFlashcards}
                />
              </div>
            ) : activeTabNew === 'quiz' ? (
              <div className="flex flex-col h-full p-2 sm:p-4">
                <QuizGenerator
                  pdfId={pdfId}
                  pageNumber={page}
                  docTitle={pdfData?.filename}
                  selectedText={activeTabNew === 'quiz' ? pendingChatText || undefined : undefined}
                  chatAction={activeTabNew === 'quiz' ? chatAction || undefined : undefined}
                  onClearSelectedText={handleChatTextProcessed}
                  totalPages={totalPages}
                  onQuizGenerated={handleQuizGenerated}
                  onQuizSaved={handleQuizSaved}
                  onQuizClear={handleQuizClear}
                  persistentQuiz={persistentQuiz}
                />
              </div>
            ) : activeTabNew === 'sets' ? (
              <div className="flex flex-col h-full p-2 sm:p-4">
                <MySets pdfId={pdfId} />
              </div>
            ) : null}
          </div>
        </aside>
      </div>

      {/* ✅ UPDATED: Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={handleOverlayClick}
          />
        )}
      </AnimatePresence>

      {/* ✅ UPDATED: Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-80 sm:w-96 bg-black/95 border-l border-white/10 z-50 lg:hidden flex flex-col"
          >
            {/* Mobile Sidebar Header */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10 bg-black/30 flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 rounded-full blur-xl bg-purple-500/30" />
                <MessageCircle className="relative w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-base text-white">Ask about this PDF</div>
                <div className="text-xs text-purple-300">
                  {loading ? "Loading..." : error ? "PDF unavailable" : "Ready to analyze document"}
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded hover:bg-purple-900/20 transition"
                title="Close sidebar"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Mobile Tab Navigation */}
            <div className="flex border-b border-white/10 bg-black/20 overflow-x-auto">
              <button
                onClick={() => setActiveTabNew('chat')}
                className={`flex-1 px-3 py-3 text-sm font-medium transition whitespace-nowrap ${
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
                className={`flex-1 px-3 py-3 text-sm font-medium transition whitespace-nowrap ${
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
                className={`flex-1 px-3 py-3 text-sm font-medium transition whitespace-nowrap ${
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
                className={`flex-1 px-3 py-3 text-sm font-medium transition whitespace-nowrap ${
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

            {/* Mobile Chat Content */}
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
                    selectedText={activeTabNew === 'flashcards' ? pendingChatText || undefined : undefined}
                    chatAction={activeTabNew === 'flashcards' ? chatAction || undefined : undefined}
                    onClearSelectedText={handleChatTextProcessed}
                    totalPages={totalPages}
                    onFlashcardGenerated={handleFlashcardGenerated}
                    onFlashcardSaved={handleFlashcardSaved}
                    onFlashcardClear={handleFlashcardClear}
                    persistentFlashcards={persistentFlashcards}
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
                    selectedText={activeTabNew === 'quiz' ? pendingChatText || undefined : undefined}
                    chatAction={activeTabNew === 'quiz' ? chatAction || undefined : undefined}
                    onClearSelectedText={handleChatTextProcessed}
                    totalPages={totalPages}
                    onQuizGenerated={handleQuizGenerated}
                    onQuizSaved={handleQuizSaved}
                    onQuizClear={handleQuizClear}
                    persistentQuiz={persistentQuiz}
                  />
                </div>
              ) : activeTabNew === 'sets' ? (
                <div className="flex flex-col h-full p-4">
                  {/* <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-white mb-2">My Study Sets</h3>
                    <p className="text-sm text-gray-400">View and manage your saved flashcards and quizzes</p>
                  </div> */}
                  <MySets pdfId={pdfId} />
                </div>
              ) : null}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ✅ UPDATED: Mobile Chat Toggle Button - Fixed Z-Index */}
      <button
        className="fixed bottom-4 right-4 z-40 hidden max-[710px]:block p-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg transition"
        onClick={toggleSidebar}
        aria-label="Toggle chat sidebar"
      >
        <LayoutPanelLeft className="w-5 h-5" />
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