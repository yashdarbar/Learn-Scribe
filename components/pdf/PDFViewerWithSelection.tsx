import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Loader2 } from "lucide-react";

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// ✅ FIXED: Better worker configuration for Next.js
// ✅ Use the local worker file you just copied
try {
  if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf-worker/pdf.worker.min.js';
    console.log('✅ PDF.js worker set to local version:', pdfjs.GlobalWorkerOptions.workerSrc);
  }
} catch (err) {
  console.error('❌ Failed to configure PDF.js worker:', err);
}

// Log PDF.js version for debugging
if (typeof window !== 'undefined') {
  console.log('PDF.js API version:', pdfjs.version);
}

// ✅ ADD: Debouncing utility hook
const useDebounce = (value: number, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// ✅ ADD: Smooth scroll hook
function useSmoothScroll(containerRef: React.RefObject<HTMLDivElement | null>) {
  const scrollToPosition = useCallback((x: number, y: number) => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ left: x, top: y, behavior: 'smooth' });
    }
  }, [containerRef]);

  const scrollToTop = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [containerRef]);

  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [containerRef]);

  const scrollByAmount = useCallback((deltaX: number, deltaY: number) => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: deltaX, top: deltaY, behavior: 'smooth' });
    }
  }, [containerRef]);

  return { scrollToPosition, scrollToTop, scrollToBottom, scrollByAmount };
}

export interface PDFViewerWithSelectionProps {
  pdfUrl: string;
  page: number;
  totalPages?: number;
  zoom: number;
  onPageChange: (page: number) => void;
  onTextSelect: (selectedText: string, position: { x: number; y: number }) => void;
  onTotalPagesChange?: (totalPages: number) => void;
}

const PDFViewerWithSelection: React.FC<PDFViewerWithSelectionProps> = ({
  pdfUrl,
  page,
  totalPages,
  zoom,
  onPageChange,
  onTextSelect,
  onTotalPagesChange,
}) => {
  const [numPages, setNumPages] = useState<number>(totalPages || 1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce zoom
  const debouncedZoom = useDebounce(zoom, 150); // 150ms delay
  const zoomStyle = useMemo(() => ({
    transform: `scale(${debouncedZoom})`,
    transformOrigin: "top left",
    transition: "transform 0.2s cubic-bezier(.4,2,.6,1)",
  }), [debouncedZoom]);

  // Smooth scroll hook
  const { scrollToPosition, scrollToTop, scrollToBottom, scrollByAmount } = useSmoothScroll(containerRef);

  // Keyboard navigation for smooth scrolling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current) return;
      const isViewerFocused = containerRef.current.contains(document.activeElement) ||
        containerRef.current.matches(':hover');
      if (!isViewerFocused) return;
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          scrollByAmount(0, 100);
          break;
        case 'ArrowUp':
          e.preventDefault();
          scrollByAmount(0, -100);
          break;
        case 'ArrowRight':
          e.preventDefault();
          scrollByAmount(100, 0);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          scrollByAmount(-100, 0);
          break;
        case 'Home':
          e.preventDefault();
          scrollToTop();
          break;
        case 'End':
          e.preventDefault();
          scrollToBottom();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scrollByAmount, scrollToTop, scrollToBottom]);

  // ✅ ENHANCED: Handle PDF load success with retry reset
  const handleLoadSuccess = useCallback((pdf: any) => {
    setNumPages(pdf.numPages);
    setLoading(false);
    setError(null);
    setRetryCount(0); // Reset retry count on success

    // NEW: Pass total pages back to parent
    if (onTotalPagesChange) {
      onTotalPagesChange(pdf.numPages);
    }

    console.log('✅ PDF loaded successfully with', pdf.numPages, 'pages');
  }, [onTotalPagesChange]);

  // ✅ ENHANCED: Handle PDF load error with retry logic
  const handleLoadError = useCallback((err: any) => {
    console.error('PDF Load Error:', err);

    // Check if it's a worker-related error
    if (err.message?.includes('sendWithPromise') || err.message?.includes('WorkerTransport')) {
      if (retryCount < 3) {
        console.log(`🔄 Retrying PDF load (${retryCount + 1}/3)`);
        setRetryCount(prev => prev + 1);

        // Brief delay before retry
        setTimeout(() => {
          setError(null);
          setLoading(true);
        }, 500);
        return;
      } else {
        setError("PDF worker connection failed. Please refresh the page.");
      }
    } else {
      setError("Failed to load PDF");
    }

    setLoading(false);
  }, [retryCount]);

  // ✅ ENHANCED: Text selection handler with debouncing
  useEffect(() => {
    let selectionTimeout: NodeJS.Timeout | null = null;

    const handleSelection = () => {
      // Clear previous timeout
      if (selectionTimeout) {
        clearTimeout(selectionTimeout);
      }

      // Debounce selection to avoid excessive calls
      selectionTimeout = setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
          onTextSelect("", { x: 0, y: 0 });
          return;
        }

        const text = selection.toString().trim();
        if (text.length > 0) {
          try {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            if (containerRef.current) {
              const containerRect = containerRef.current.getBoundingClientRect();
              const x = rect.left - containerRect.left + rect.width / 2;
              const y = rect.top - containerRect.top - 40;

              // Only call if position is valid
              if (x >= 0 && y >= 0) {
                onTextSelect(text, { x, y });
              }
            }
          } catch (error) {
            console.error('Selection error:', error);
            onTextSelect("", { x: 0, y: 0 });
          }
        } else {
          onTextSelect("", { x: 0, y: 0 });
        }
      }, 100); // 100ms debounce for text selection
    };

    const ref = containerRef.current;
    if (ref) {
      ref.addEventListener("mouseup", handleSelection);
      ref.addEventListener("keyup", handleSelection);
      // Also listen for selection changes
      document.addEventListener("selectionchange", handleSelection);
    }

    return () => {
      if (selectionTimeout) {
        clearTimeout(selectionTimeout);
      }
      if (ref) {
        ref.removeEventListener("mouseup", handleSelection);
        ref.removeEventListener("keyup", handleSelection);
      }
      document.removeEventListener("selectionchange", handleSelection);
    };
  }, [onTextSelect]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative rounded-lg border border-white/10 bg-white dark:bg-black overflow-auto shadow-lg scroll-smooth"
      style={{ minHeight: 400 }}
      data-testid="pdf-viewer"
      tabIndex={0}
    >
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/40 rounded-lg">
          <Loader2 className="w-10 h-10 text-purple-400 animate-spin mb-4" />
          <div className="w-2/3 h-96 bg-white/10 rounded-lg animate-pulse" />
          <div className="text-gray-400 mt-4">
            Loading PDF... {retryCount > 0 && `(Retry ${retryCount}/3)`}
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-red-900/20 border border-red-500/20 rounded-lg">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-red-300 mb-4">Error Loading PDF</h2>
            <p className="text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600/80 hover:bg-red-600 rounded-lg transition text-white text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      <div style={zoomStyle} className="w-full h-full">
        <Document
          file={pdfUrl}
          onLoadSuccess={handleLoadSuccess}
          onLoadError={handleLoadError}
          loading={null}
          error={null}
          className="w-full h-full"
          key={`${debouncedZoom}-${page}`} // ✅ Force re-render only on debounced changes
        >
          <Page
            pageNumber={page}
            width={containerRef.current?.clientWidth || undefined}
            renderTextLayer={true}
            renderAnnotationLayer={false}
            loading={null}
            error={null}
            className="w-full h-full select-text"
          />
        </Document>
      </div>
    </div>
  );
};

export default PDFViewerWithSelection;