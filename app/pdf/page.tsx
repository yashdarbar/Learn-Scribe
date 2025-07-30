"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { Plus, FileText, Loader2, AlertCircle, ArrowLeft, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { PdfUploadModal } from "@/components/PdfUploadModal";
import { getUserPDFs } from "@/app/actions/pdf-fetch";
import { createClient } from "@/utils/supabase/client";

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

// Main component - DEFAULT EXPORT
export default function PdfLibraryPage() {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [pdfs, setPdfs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [headerLoading, setHeaderLoading] = useState(false);
  const [uploadingSample, setUploadingSample] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Get user data for header
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
        return;
      }
      setUser(data.user || null);
    };
    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        setUser(session?.user || null);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        router.push("/login");
      }
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, router]);

  // Handle logout
  const handleLogout = async () => {
    setHeaderLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        router.push("/login");
      }
    } catch (error) {
      console.log("Logout error:", error);
      router.push("/login");
    } finally {
      setHeaderLoading(false);
    }
  };

  // Fetch PDFs from database
  useEffect(() => {
    const fetchPDFs = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await getUserPDFs();

        if (result.success && result.data) {
          // Transform database data to match current component expectations
          const transformedPDFs = result.data.map((pdf) => ({
            id: pdf.id,
            name: pdf.filename,
            uploadDate: new Date(pdf.created_at).toLocaleDateString(),
            flashcards: pdf.flashcard_count || 0, // Use real count from database
            quizzes: pdf.quiz_count || 0,         // Use real count from database
            studyProgress: pdf.upload_status === 'completed' ? 100 :
                          pdf.upload_status === 'processing' ? 50 : 0,
            status: pdf.upload_status,
            fileSize: pdf.file_size
          }));

          setPdfs(transformedPDFs);
        } else {
          setError(result.error || 'Failed to load PDFs');
        }
      } catch (err) {
        setError('Failed to fetch PDFs');
        console.error('Error fetching PDFs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPDFs();
  }, []);

  // Refresh PDFs after successful upload
  const refreshPDFs = async () => {
    const result = await getUserPDFs();
    if (result.success && result.data) {
      const transformedPDFs = result.data.map((pdf) => ({
        id: pdf.id,
        name: pdf.filename,
        uploadDate: new Date(pdf.created_at).toLocaleDateString(),
        flashcards: pdf.flashcard_count || 0, // Use real count from database
        quizzes: pdf.quiz_count || 0,         // Use real count from database
        studyProgress: pdf.upload_status === 'completed' ? 100 :
                      pdf.upload_status === 'processing' ? 50 : 0,
        status: pdf.upload_status,
        fileSize: pdf.file_size
      }));
      setPdfs(transformedPDFs);
    }
  };

  // Handle successful upload and navigation
  const handleUploadSuccess = (pdfId: string) => {
    setUploadModalOpen(false);
    refreshPDFs(); // Refresh the PDF list
  };

  // Handle sample PDF upload
  const handleUploadSample = async () => {
    setUploadingSample(true);
    setError(null);

    try {
      const { uploadSamplePdf } = await import('@/app/actions/sample-upload');
      const result = await uploadSamplePdf();

      if (result.success) {
        await refreshPDFs(); // Refresh the PDF list
        console.log('✅ Sample PDF uploaded:', result.data);
        // Navigate to the uploaded PDF
        router.push(`/pdf/${result.data.id}`);
      } else {
        setError(result.error || 'Failed to upload sample PDF');
      }
    } catch (error) {
      console.error('Error uploading sample PDF:', error);
      setError('Failed to upload sample PDF');
    } finally {
      setUploadingSample(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <RetroGrid />
      <div className="absolute top-0 z-[0] h-screen w-screen bg-purple-950/10 bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

      {/* Header - Copied from dashboard */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.7)_100%)]">
          Welcome back, {user?.user_metadata?.first_name || user?.email || "User"}
        </div>
        <div className="flex items-center gap-4">
          <div className="relative inline-block overflow-hidden rounded-full p-[1px]">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-300/20 to-orange-200/20 rounded-full" />
            <Avatar className="relative bg-gradient-to-tr from-zinc-300/5 via-purple-400/20 to-transparent border border-white/10">
              <span className="text-lg font-semibold text-white">{user?.user_metadata?.full_name?.[0] || user?.email?.[0]}</span>
            </Avatar>
          </div>
          <span className="relative inline-block overflow-hidden rounded-full p-[1px]">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-300/20 to-orange-200/20 rounded-full" />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={headerLoading}
              className="relative bg-gradient-to-tr from-zinc-300/5 via-purple-400/20 to-transparent border border-white/10 hover:from-zinc-300/10 hover:via-purple-400/30 text-white"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center py-8 px-2">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full max-w-6xl relative z-10"
        >
          <Card className="backdrop-blur-xl bg-black/30 border border-white/10 rounded-2xl shadow-xl p-8">
            {/* Header with back button and title */}
            <div className="flex items-center gap-4 mb-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  size="lg"
                  onClick={() => router.push('/dashboard')}
                  className="w-full md:w-auto flex items-center gap-2 bg-gradient-to-r from-purple-600/80 to-purple-700/80 hover:from-purple-600 hover:to-purple-700 border border-purple-500/30 hover:border-purple-500/50 text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </Button>
              </motion.div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <h1 className="text-3xl font-bold text-white mb-2 md:mb-0">PDF Learning Hub</h1>
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button
                    className="w-full md:w-auto bg-gradient-to-r from-purple-600/80 to-purple-700/80 hover:from-purple-600 hover:to-purple-700 border border-purple-500/30 hover:border-purple-500/50 text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                    onClick={() => setUploadModalOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Upload New PDF
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button
                    onClick={handleUploadSample}
                    disabled={uploadingSample}
                    variant="outline"
                    className="w-full md:w-auto border-purple-500/50 hover:border-purple-500 text-purple-300 hover:text-white hover:bg-purple-600/20"
                  >
                    {uploadingSample ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading Sample...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Try Sample PDF
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* PDF Cards Grid */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                <Card className="col-span-full p-8 text-center text-gray-300 bg-black/30 border border-white/10">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading your PDFs...
                  </div>
                </Card>
              ) : error ? (
                <Card className="col-span-full p-8 text-center text-red-300 bg-black/30 border border-red-500/20">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <AlertCircle className="w-4 h-4" />
                    <p>❌ {error}</p>
                  </div>
                  <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                    Try Again
                  </Button>
                </Card>
              ) : pdfs.length === 0 ? (
                <Card className="col-span-full p-8 text-center text-gray-300 bg-black/30 border border-white/10">
                  No PDFs uploaded yet. Start by uploading your first PDF!
                </Card>
              ) : (
                pdfs.map((pdf) => (
                  <motion.div
                    key={pdf.id}
                    whileHover={{ scale: 1.03, boxShadow: "0 4px 32px 0 rgba(0,0,0,0.15)" }}
                    transition={{ type: "spring", stiffness: 300 }}
                    onClick={() => router.push(`/pdf/${pdf.id}`)}
                    className="cursor-pointer"
                  >
                    <Card className="backdrop-blur-xl bg-black/20 border border-white/10 p-6 flex flex-col h-full transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-5 h-5 text-purple-400" />
                        <span className="font-semibold text-white">{pdf.name}</span>
                        {pdf.status === 'processing' && (
                          <div className="animate-pulse w-2 h-2 bg-yellow-400 rounded-full"></div>
                        )}
                        {pdf.status === 'failed' && (
                          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        )}
                      </div>
                      <div className="text-gray-400 text-xs mb-4">Uploaded: {pdf.uploadDate}</div>
                      <div className="flex gap-4 text-xs text-purple-400 mb-2">
                        <span>Flashcards: {pdf.flashcards}</span>
                        <span>Quizzes: {pdf.quizzes}</span>
                      </div>
                      <div className="w-full bg-purple-900/40 rounded-full h-2 mb-2">
                        <div
                          className="bg-gradient-to-r from-purple-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${pdf.studyProgress}%` }}
                        />
                      </div>
                      <div className="text-xs text-purple-400">Study Progress: {pdf.studyProgress}%</div>
                      {pdf.status === 'processing' && (
                        <div className="text-xs text-yellow-400 mt-2">Processing...</div>
                      )}
                      {pdf.status === 'failed' && (
                        <div className="text-xs text-red-400 mt-2">Upload failed</div>
                      )}
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      <PdfUploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
}