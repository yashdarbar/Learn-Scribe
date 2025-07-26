"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Plus, FileText } from "lucide-react";
// import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
// import { useDropzone } from "react-dropzone";
import { useState } from "react";
// import { CloudUpload, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
// import { uploadPDF, type UploadResult } from "@/app/actions/pdf-upload";
import { PdfUploadModal } from "@/components/PdfUploadModal";

// New interface for Next.js page props
interface PageProps {
  params?: Record<string, string | string[]>;
  searchParams?: Record<string, string | string[] | undefined>;
}


// // Define the props interface
// interface PdfUploadModalProps {
//   open: boolean;
//   onClose: () => void;
//   onSuccess?: (pdfId: string) => void;
// }

// Define the state type
// type UploadState = "default" | "drag" | "uploading" | "success" | "error";

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

const mockPDFs = [
  {
    id: 1,
    name: "Machine Learning Basics.pdf",
    uploadDate: "2024-01-10",
    flashcards: 12,
    quizzes: 3,
    studyProgress: 65
  },
  {
    id: 2,
    name: "Deep Learning Explained.pdf",
    uploadDate: "2024-01-12",
    flashcards: 20,
    quizzes: 5,
    studyProgress: 80
  },
  {
    id: 3,
    name: "AI Ethics.pdf",
    uploadDate: "2024-01-15",
    flashcards: 8,
    quizzes: 2,
    studyProgress: 40
  },
];

// Main component - DEFAULT EXPORT
export default function PdfLibraryPage({params, searchParams}: PageProps) {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const router = useRouter();

  // Handle successful upload and navigation
  const handleUploadSuccess = (pdfId: string) => {
    console.log('✅ PDF uploaded successfully with ID:', pdfId);
    setUploadModalOpen(false);
    // The modal will handle navigation automatically
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center py-8 px-2">
      <RetroGrid />
      <div className="absolute top-0 z-[0] h-screen w-screen bg-purple-950/10 bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-6xl relative z-10"
      >
        <Card className="backdrop-blur-xl bg-black/30 border border-white/10 rounded-2xl shadow-xl p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 md:mb-0">PDF Learning Hub</h1>
            <Button className="w-full md:w-auto" onClick={() => setUploadModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Upload New PDF
            </Button>
          </div>
          {/* PDF Cards Grid */}
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {mockPDFs.length === 0 ? (
              <Card className="col-span-full p-8 text-center text-gray-300 bg-black/30 border border-white/10">
                No PDFs uploaded yet. Start by uploading your first PDF!
              </Card>
            ) : (
              mockPDFs.map((pdf) => (
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
                    </div>
                    <div className="text-gray-400 text-xs mb-4">Uploaded: {pdf.uploadDate}</div>
                    <div className="flex gap-4 text-xs text-purple-300 mb-2">
                      <span>Flashcards: {pdf.flashcards}</span>
                      <span>Quizzes: {pdf.quizzes}</span>
                    </div>
                    <div className="w-full bg-purple-900/40 rounded-full h-2 mb-2">
                      <div
                        className="bg-gradient-to-r from-purple-400 to-orange-400 h-2 rounded-full"
                        style={{ width: `${pdf.studyProgress}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-300">Study Progress: {pdf.studyProgress}%</div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </Card>
      </motion.div>
      <PdfUploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
}

// Updated PdfUploadModal component with Server Actions - NAMED EXPORT
// export function PdfUploadModal({ open, onClose, onSuccess }: PdfUploadModalProps) {
//   const [state, setState] = useState<UploadState>("default");
//   const [progress, setProgress] = useState(0);
//   const [error, setError] = useState("");
//   const [uploadedPdfId, setUploadedPdfId] = useState<string | null>(null);
//   const [isPending, startTransition] = useTransition();

//   const router = useRouter();

//   // Updated function to use Server Action instead of API route
//   const uploadWithServerAction = async (file: File) => {
//     const formData = new FormData();
//     formData.append('file', file);

//     console.log("📄 Starting upload with Server Action:", {
//       name: file.name,
//       size: file.size,
//       type: file.type
//     });

//     try {
//       // Use Server Action instead of fetch
//       const result = await uploadPDF(formData);

//       console.log('📄 Server Action Response:', result);

//       if (!result.success) {
//         throw new Error(result.message || 'Upload failed');
//       }

//       return result;
//     } catch (error) {
//       console.error('❌ Server Action error:', error);
//       throw error;
//     }
//   };

//   const onDrop = async (acceptedFiles: File[], fileRejections: any[]) => {
//     console.log('📁 Files dropped:', acceptedFiles);
//     console.log('❌ Rejected files:', fileRejections);

//     // Validate files
//     if (fileRejections.length > 0) {
//       const rejection = fileRejections[0];
//       if (rejection.errors.some((e: any) => e.code === 'file-too-large')) {
//         setError("File size too large. Maximum 50MB allowed.");
//       } else if (rejection.errors.some((e: any) => e.code === 'file-invalid-type')) {
//         setError("Only PDF files are allowed.");
//       } else {
//         setError("Invalid file. Please try again.");
//       }
//       setState("error");
//       return;
//     }

//     if (acceptedFiles.length === 0) {
//       setError("No valid files selected.");
//       setState("error");
//       return;
//     }

//     const file = acceptedFiles[0];
//     console.log('📄 Processing file:', {
//       name: file.name,
//       size: file.size,
//       type: file.type
//     });

//     setState("uploading");
//     setProgress(0);
//     setError("");

//     // Use React's startTransition for better UX
//     startTransition(async () => {
//       try {
//         // Simulate progress for better UX
//         const progressInterval = setInterval(() => {
//           setProgress((prev) => {
//             if (prev >= 90) {
//               clearInterval(progressInterval);
//               return 90; // Stop at 90% until upload completes
//             }
//             return prev + 10;
//           });
//         }, 200);

//         // Upload using Server Action
//         const result = await uploadWithServerAction(file);

//         // Complete progress
//         clearInterval(progressInterval);
//         setProgress(100);

//         // Set success state
//         setState("success");
//         setUploadedPdfId(result.pdfId || null);

//         console.log('✅ Upload completed, PDF ID:', result.pdfId);

//         // Auto-redirect after success
//         // setTimeout(() => {
//         //   if (result.pdfId) {
//         //     onSuccess?.(result.pdfId);
//         //     onClose();
//         //     router.push(`/pdf/${result.pdfId}`);
//         //   }
//         // }, 1500);

//       } catch (error: any) {
//         console.error('❌ Upload failed:', error);
//         setState("error");
//         setError(error.message || "Upload failed. Please try again.");
//       }
//     });
//   };

//   const { getRootProps, getInputProps, isDragActive } = useDropzone({
//     accept: { "application/pdf": [".pdf"] },
//     maxSize: 50 * 1024 * 1024, // 50MB
//     multiple: false,
//     onDrop,
//   });

//   const handleClose = () => {
//     if (state === "uploading" || isPending) return; // Prevent closing during upload
//     setState("default");
//     setProgress(0);
//     setError("");
//     setUploadedPdfId(null);
//     onClose();
//   };

//   const handleViewPDF = () => {
//     if (uploadedPdfId) {
//       onClose();
//       router.push(`/pdf/${uploadedPdfId}`);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={handleClose}>
//       <DialogContent className="max-w-md bg-black/70 border border-white/10 backdrop-blur-xl rounded-2xl shadow-xl">
//         <DialogTitle className="text-white text-xl mb-4">Upload PDF</DialogTitle>
//         <AnimatePresence mode="wait">
//           {/* {(state === "default" || state === "drag") && (
//             <motion.div
//               {...getRootProps()}
//               className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all ${
//                 isDragActive
//                   ? "border-blue-500 bg-blue-500/10 shadow-lg"
//                   : "border-white/20 bg-black/30 hover:border-purple-400/50 hover:bg-purple-500/5"
//               }`}
//               initial={{ scale: 0.95, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.95, opacity: 0 }}
//               whileHover={{ scale: 1.02 }}
//               key="dropzone"
//             >
//               <input {...getInputProps()} />
//               <CloudUpload className="w-12 h-12 text-blue-400 mb-2 animate-bounce" />
//               <div className="text-lg text-white font-semibold mb-1">
//                 Drop your PDF here or click to browse
//               </div>
//               <div className="text-sm text-gray-400">
//                 Supports PDF files up to 50MB
//               </div>
//             </motion.div>
//           )} */}
//           {(state === "default" || state === "drag") && (
//   <motion.div
//     className="p-0" // Container for animation
//     initial={{ scale: 0.95, opacity: 0 }}
//     animate={{ scale: 1, opacity: 1 }}
//     exit={{ scale: 0.95, opacity: 0 }}
//     key="dropzone"
//   >
//     <div
//       {...getRootProps()}
//       className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all ${
//         isDragActive
//           ? "border-blue-500 bg-blue-500/10 shadow-lg"
//           : "border-white/20 bg-black/30 hover:border-purple-400/50 hover:bg-purple-500/5"
//       }`}
//       style={{
//         transform: 'scale(1)',
//         transition: 'transform 0.2s ease'
//       }}
//       onMouseEnter={(e) => {
//         e.currentTarget.style.transform = 'scale(1.02)';
//       }}
//       onMouseLeave={(e) => {
//         e.currentTarget.style.transform = 'scale(1)';
//       }}
//     >
//       <input {...getInputProps()} />
//       <CloudUpload className="w-12 h-12 text-blue-400 mb-2 animate-bounce" />
//       <div className="text-lg text-white font-semibold mb-1">
//         Drop your PDF here or click to browse
//       </div>
//       <div className="text-sm text-gray-400">
//         Supports PDF files up to 50MB
//       </div>
//     </div>
//   </motion.div>
// )}


//           {(state === "uploading" || isPending) && (
//             <motion.div
//               className="flex flex-col items-center justify-center p-8"
//               initial={{ scale: 0.95, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.95, opacity: 0 }}
//               key="uploading"
//             >
//               <Loader2 className="w-10 h-10 text-blue-400 animate-spin mb-4" />
//               <div className="w-full bg-white/10 rounded-full h-2 mb-2">
//                 <motion.div
//                   className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full"
//                   initial={{ width: 0 }}
//                   animate={{ width: `${progress}%` }}
//                   transition={{ duration: 0.3 }}
//                 />
//               </div>
//               <div className="text-sm text-gray-300">
//                 {progress < 90 ? `${progress}% uploading...` : 'Processing PDF...'}
//               </div>
//             </motion.div>
//           )}

//           {state === "success" && (
//             <motion.div
//               className="flex flex-col items-center justify-center p-8"
//               initial={{ scale: 0.95, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.95, opacity: 0 }}
//               key="success"
//             >
//               <motion.div
//                 initial={{ scale: 0 }}
//                 animate={{ scale: 1 }}
//                 transition={{ delay: 0.2, type: "spring" }}
//               >
//                 <CheckCircle className="w-10 h-10 text-green-400 mb-2" />
//               </motion.div>
//               <div className="text-lg text-green-300 font-semibold mb-1">
//                 Upload successful!
//               </div>
//               <div className="text-sm text-gray-300 mb-4 text-center">
//                 Your PDF is ready for viewing and AI interaction.
//               </div>
//               <Button
//                 className="mt-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
//                 onClick={handleViewPDF}
//               >
//                 View PDF
//               </Button>
//             </motion.div>
//           )}

//           {state === "error" && (
//             <motion.div
//               className="flex flex-col items-center justify-center p-8"
//               initial={{ scale: 0.95, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.95, opacity: 0 }}
//               key="error"
//             >
//               <XCircle className="w-10 h-10 text-red-400 mb-2" />
//               <div className="text-lg text-red-300 font-semibold mb-1">
//                 Upload failed
//               </div>
//               <div className="text-sm text-gray-300 mb-4 text-center">
//                 {error}
//               </div>
//               <Button
//                 variant="outline"
//                 onClick={() => setState("default")}
//                 className="border-white/20 hover:border-purple-400/50"
//               >
//                 Try Again
//               </Button>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </DialogContent>
//     </Dialog>
//   );
// }








// "use client";

// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { motion } from "framer-motion";
// import { Plus, FileText } from "lucide-react";
// import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
// import { useDropzone } from "react-dropzone";
// import { useState } from "react";
// import { CloudUpload, CheckCircle, XCircle, Loader2 } from "lucide-react";
// import { AnimatePresence } from "framer-motion";
// import { useRouter } from "next/navigation";

// // Define the props interface
// interface PdfUploadModalProps {
//   open: boolean;
//   onClose: () => void;
//   onSuccess?: (pdfId: string) => void;
// }

// // Define the state type
// type UploadState = "default" | "drag" | "uploading" | "success" | "error";

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

// const mockPDFs = [
//   {
//     id: 1,
//     name: "Machine Learning Basics.pdf",
//     uploadDate: "2024-01-10",
//     flashcards: 12,
//     quizzes: 3,
//     studyProgress: 65
//   },
//   {
//     id: 2,
//     name: "Deep Learning Explained.pdf",
//     uploadDate: "2024-01-12",
//     flashcards: 20,
//     quizzes: 5,
//     studyProgress: 80
//   },
//   {
//     id: 3,
//     name: "AI Ethics.pdf",
//     uploadDate: "2024-01-15",
//     flashcards: 8,
//     quizzes: 2,
//     studyProgress: 40
//   },
// ];

// // Main component - DEFAULT EXPORT
// export default function PdfLibraryPage() {
//   const [uploadModalOpen, setUploadModalOpen] = useState(false);
//   const router = useRouter();

//   // Handle successful upload and navigation
//   const handleUploadSuccess = (pdfId: string) => {
//     console.log('✅ PDF uploaded successfully with ID:', pdfId);
//     setUploadModalOpen(false);
//     // The modal will handle navigation automatically
//   };

//   return (
//     <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center py-8 px-2">
//       <RetroGrid />
//       <div className="absolute top-0 z-[0] h-screen w-screen bg-purple-950/10 bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
//       <motion.div
//         initial={{ opacity: 0, y: 32 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.7, ease: "easeOut" }}
//         className="w-full max-w-6xl relative z-10"
//       >
//         <Card className="backdrop-blur-xl bg-black/30 border border-white/10 rounded-2xl shadow-xl p-8">
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
//             <h1 className="text-3xl font-bold text-white mb-2 md:mb-0">PDF Learning Hub</h1>
//             <Button className="w-full md:w-auto" onClick={() => setUploadModalOpen(true)}>
//               <Plus className="w-4 h-4 mr-2" /> Upload New PDF
//             </Button>
//           </div>
//           {/* PDF Cards Grid */}
//           <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
//             {mockPDFs.length === 0 ? (
//               <Card className="col-span-full p-8 text-center text-gray-300 bg-black/30 border border-white/10">
//                 No PDFs uploaded yet. Start by uploading your first PDF!
//               </Card>
//             ) : (
//               mockPDFs.map((pdf) => (
//                 <motion.div
//                   key={pdf.id}
//                   whileHover={{ scale: 1.03, boxShadow: "0 4px 32px 0 rgba(0,0,0,0.15)" }}
//                   transition={{ type: "spring", stiffness: 300 }}
//                   onClick={() => router.push(`/pdf/${pdf.id}`)}
//                   className="cursor-pointer"
//                 >
//                   <Card className="backdrop-blur-xl bg-black/20 border border-white/10 p-6 flex flex-col h-full transition-all">
//                     <div className="flex items-center gap-2 mb-2">
//                       <FileText className="w-5 h-5 text-purple-400" />
//                       <span className="font-semibold text-white">{pdf.name}</span>
//                     </div>
//                     <div className="text-gray-400 text-xs mb-4">Uploaded: {pdf.uploadDate}</div>
//                     <div className="flex gap-4 text-xs text-purple-300 mb-2">
//                       <span>Flashcards: {pdf.flashcards}</span>
//                       <span>Quizzes: {pdf.quizzes}</span>
//                     </div>
//                     <div className="w-full bg-purple-900/40 rounded-full h-2 mb-2">
//                       <div
//                         className="bg-gradient-to-r from-purple-400 to-orange-400 h-2 rounded-full"
//                         style={{ width: `${pdf.studyProgress}%` }}
//                       />
//                     </div>
//                     <div className="text-xs text-gray-300">Study Progress: {pdf.studyProgress}%</div>
//                   </Card>
//                 </motion.div>
//               ))
//             )}
//           </div>
//         </Card>
//       </motion.div>
//       <PdfUploadModal
//         open={uploadModalOpen}
//         onClose={() => setUploadModalOpen(false)}
//         onSuccess={handleUploadSuccess}
//       />
//     </div>
//   );
// }

// // Updated PdfUploadModal component - NAMED EXPORT
// export function PdfUploadModal({ open, onClose, onSuccess }: PdfUploadModalProps) {
//   const [state, setState] = useState<UploadState>("default");
//   const [progress, setProgress] = useState(0);
//   const [error, setError] = useState("");
//   const [uploadedPdfId, setUploadedPdfId] = useState<string | null>(null);

//   const router = useRouter();

//   const uploadToAPI = async (file: File) => {
//     const formData = new FormData();
//     formData.append('file', file);
//     console.log("file", file);
//     console.log(":::",formData);

//     try {
//       const response = await fetch('/api/pdf/upload', {
//         method: 'POST',
//         body: formData,
//       });
//       console.log("RESPONse",response)

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Upload failed');
//       }

//       const data = await response.json();
//       console.log('📄 API Response:', data);
//       return data;
//     } catch (error) {
//       console.error('❌ Upload error:', error);
//       throw error;
//     }
//   };

//   const onDrop = async (acceptedFiles: File[], fileRejections: any[]) => {
//     console.log('📁 Files dropped:', acceptedFiles);
//     console.log('❌ Rejected files:', fileRejections);

//     // Validate files
//     if (fileRejections.length > 0) {
//       const rejection = fileRejections[0];
//       if (rejection.errors.some((e: any) => e.code === 'file-too-large')) {
//         setError("File size too large. Maximum 50MB allowed.");
//       } else if (rejection.errors.some((e: any) => e.code === 'file-invalid-type')) {
//         setError("Only PDF files are allowed.");
//       } else {
//         setError("Invalid file. Please try again.");
//       }
//       setState("error");
//       return;
//     }

//     if (acceptedFiles.length === 0) {
//       setError("No valid files selected.");
//       setState("error");
//       return;
//     }

//     const file = acceptedFiles[0];
//     console.log('📄 Processing file:', {
//       name: file.name,
//       size: file.size,
//       type: file.type
//     });

//     setState("uploading");
//     setProgress(0);
//     setError("");

//     try {
//       // Simulate progress for better UX
//       const progressInterval = setInterval(() => {
//         setProgress((prev) => {
//           if (prev >= 90) {
//             clearInterval(progressInterval);
//             return 90; // Stop at 90% until upload completes
//           }
//           return prev + 10;
//         });
//       }, 200);

//       // Actual upload
//       const result = await uploadToAPI(file);

//       // Complete progress
//       clearInterval(progressInterval);
//       setProgress(100);

//       // Set success state
//       setState("success");
//       setUploadedPdfId(result.pdfId);

//       console.log('✅ Upload completed, PDF ID:', result.pdfId);

//       // Auto-redirect after success
//       setTimeout(() => {
//         onSuccess?.(result.pdfId);
//         onClose();
//         router.push(`/pdf/${result.pdfId}`);
//       }, 1500);

//     } catch (error: any) {
//       console.error('❌ Upload failed:', error);
//       setState("error");
//       setError(error.message || "Upload failed. Please try again.");
//     }
//   };

//   const { getRootProps, getInputProps, isDragActive } = useDropzone({
//     accept: { "application/pdf": [".pdf"] },
//     maxSize: 50 * 1024 * 1024, // 50MB
//     multiple: false,
//     onDrop,
//   });

//   const handleClose = () => {
//     if (state === "uploading") return; // Prevent closing during upload
//     setState("default");
//     setProgress(0);
//     setError("");
//     setUploadedPdfId(null);
//     onClose();
//   };

//   const handleViewPDF = () => {
//     if (uploadedPdfId) {
//       onClose();
//       router.push(`/pdf/${uploadedPdfId}`);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={handleClose}>
//       <DialogContent className="max-w-md bg-black/70 border border-white/10 backdrop-blur-xl rounded-2xl shadow-xl">
//         <DialogTitle className="text-white text-xl mb-4">Upload PDF</DialogTitle>
//         <AnimatePresence mode="wait">
//           {(state === "default" || state === "drag") && (
//             <motion.div
//               {...getRootProps()}
//               className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all ${
//                 isDragActive
//                   ? "border-blue-500 bg-blue-500/10 shadow-lg"
//                   : "border-white/20 bg-black/30 hover:border-purple-400/50 hover:bg-purple-500/5"
//               }`}
//               initial={{ scale: 0.95, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.95, opacity: 0 }}
//               whileHover={{ scale: 1.02 }}
//               key="dropzone"
//             >
//               <input {...getInputProps()} />
//               <CloudUpload className="w-12 h-12 text-blue-400 mb-2 animate-bounce" />
//               <div className="text-lg text-white font-semibold mb-1">
//                 Drop your PDF here or click to browse
//               </div>
//               <div className="text-sm text-gray-400">
//                 Supports PDF files up to 50MB
//               </div>
//             </motion.div>
//           )}

//           {state === "uploading" && (
//             <motion.div
//               className="flex flex-col items-center justify-center p-8"
//               initial={{ scale: 0.95, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.95, opacity: 0 }}
//               key="uploading"
//             >
//               <Loader2 className="w-10 h-10 text-blue-400 animate-spin mb-4" />
//               <div className="w-full bg-white/10 rounded-full h-2 mb-2">
//                 <motion.div
//                   className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full"
//                   initial={{ width: 0 }}
//                   animate={{ width: `${progress}%` }}
//                   transition={{ duration: 0.3 }}
//                 />
//               </div>
//               <div className="text-sm text-gray-300">
//                 {progress < 90 ? `${progress}% uploading...` : 'Processing PDF...'}
//               </div>
//             </motion.div>
//           )}

//           {state === "success" && (
//             <motion.div
//               className="flex flex-col items-center justify-center p-8"
//               initial={{ scale: 0.95, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.95, opacity: 0 }}
//               key="success"
//             >
//               <motion.div
//                 initial={{ scale: 0 }}
//                 animate={{ scale: 1 }}
//                 transition={{ delay: 0.2, type: "spring" }}
//               >
//                 <CheckCircle className="w-10 h-10 text-green-400 mb-2" />
//               </motion.div>
//               <div className="text-lg text-green-300 font-semibold mb-1">
//                 Upload successful!
//               </div>
//               <div className="text-sm text-gray-300 mb-4 text-center">
//                 Your PDF is ready for viewing and AI interaction.
//               </div>
//               <Button
//                 className="mt-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
//                 onClick={handleViewPDF}
//               >
//                 View PDF
//               </Button>
//             </motion.div>
//           )}

//           {state === "error" && (
//             <motion.div
//               className="flex flex-col items-center justify-center p-8"
//               initial={{ scale: 0.95, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.95, opacity: 0 }}
//               key="error"
//             >
//               <XCircle className="w-10 h-10 text-red-400 mb-2" />
//               <div className="text-lg text-red-300 font-semibold mb-1">
//                 Upload failed
//               </div>
//               <div className="text-sm text-gray-300 mb-4 text-center">
//                 {error}
//               </div>
//               <Button
//                 variant="outline"
//                 onClick={() => setState("default")}
//                 className="border-white/20 hover:border-purple-400/50"
//               >
//                 Try Again
//               </Button>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </DialogContent>
//     </Dialog>
//   );
// }


// "use client";

// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { motion } from "framer-motion";
// import { Plus, FileText } from "lucide-react";
// // import Link from "next/link";
// import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
// import { useDropzone } from "react-dropzone";
// import { useState } from "react";
// import { CloudUpload, CheckCircle, XCircle, Loader2 } from "lucide-react";
// import { AnimatePresence } from "framer-motion";


// // Define the props interface
// interface PdfUploadModalProps {
//   open: boolean;
//   onClose: () => void;
//   onSuccess?: () => void;
// }

// // Define the state type
// type UploadState = "default" | "drag" | "uploading" | "success" | "error";

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

// const mockPDFs = [
//   {
//     id: 1,
//     name: "Machine Learning Basics.pdf",
//     uploadDate: "2024-01-10",
//     flashcards: 12,
//     quizzes: 3,
//     studyProgress: 65
//   },
//   {
//     id: 2,
//     name: "Deep Learning Explained.pdf",
//     uploadDate: "2024-01-12",
//     flashcards: 20,
//     quizzes: 5,
//     studyProgress: 80
//   },
//   {
//     id: 3,
//     name: "AI Ethics.pdf",
//     uploadDate: "2024-01-15",
//     flashcards: 8,
//     quizzes: 2,
//     studyProgress: 40
//   },
// ];

// export default function PdfLibraryPage() {
//   const [uploadModalOpen, setUploadModalOpen] = useState(false);

//   return (
//     <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center py-8 px-2">
//       <RetroGrid />
//       <div className="absolute top-0 z-[0] h-screen w-screen bg-purple-950/10 bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
//       <motion.div
//         initial={{ opacity: 0, y: 32 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.7, ease: "easeOut" }}
//         className="w-full max-w-6xl relative z-10"
//       >
//         <Card className="backdrop-blur-xl bg-black/30 border border-white/10 rounded-2xl shadow-xl p-8">
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
//             <h1 className="text-3xl font-bold text-white mb-2 md:mb-0">PDF Learning Hub</h1>
//             <Button asChild className="w-full md:w-auto" onClick={() => setUploadModalOpen(true)}>
//               <span>
//                 <Plus className="w-4 h-4 mr-2" /> Upload New PDF
//               </span>
//             </Button>
//           </div>
//           {/* PDF Cards Grid */}
//           <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
//             {mockPDFs.length === 0 ? (
//               <Card className="col-span-full p-8 text-center text-gray-300 bg-black/30 border border-white/10">
//                 No PDFs uploaded yet. Start by uploading your first PDF!
//               </Card>
//             ) : (
//               mockPDFs.map((pdf) => (
//                 <motion.div
//                   key={pdf.id}
//                   whileHover={{ scale: 1.03, boxShadow: "0 4px 32px 0 rgba(0,0,0,0.15)" }}
//                   transition={{ type: "spring", stiffness: 300 }}
//                 >
//                   <Card className="backdrop-blur-xl bg-black/20 border border-white/10 p-6 flex flex-col h-full transition-all">
//                     <div className="flex items-center gap-2 mb-2">
//                       <FileText className="w-5 h-5 text-purple-400" />
//                       <span className="font-semibold text-white">{pdf.name}</span>
//                     </div>
//                     <div className="text-gray-400 text-xs mb-4">Uploaded: {pdf.uploadDate}</div>
//                     <div className="flex gap-4 text-xs text-purple-300 mb-2">
//                       <span>Flashcards: {pdf.flashcards}</span>
//                       <span>Quizzes: {pdf.quizzes}</span>
//                     </div>
//                     <div className="w-full bg-purple-900/40 rounded-full h-2 mb-2">
//                       <div
//                         className="bg-gradient-to-r from-purple-400 to-orange-400 h-2 rounded-full"
//                         style={{ width: `${pdf.studyProgress}%` }}
//                       />
//                     </div>
//                     <div className="text-xs text-gray-300">Study Progress: {pdf.studyProgress}%</div>
//                   </Card>
//                 </motion.div>
//               ))
//             )}
//           </div>
//         </Card>
//       </motion.div>
//       <PdfUploadModal
//         open={uploadModalOpen}
//         onClose={() => setUploadModalOpen(false)}
//         onSuccess={() => {
//           setUploadModalOpen(false);
//         }}
//       />
//     </div>
//   );
// }

// export function PdfUploadModal({ open, onClose, onSuccess }: PdfUploadModalProps) {
//   const [state, setState] = useState("default"); // default | drag | uploading | success | error
//   const [progress, setProgress] = useState(0);
//   const [error, setError] = useState("");

//   const onDrop = (acceptedFiles: File[], fileRejections: any[]) => {
//     // Validate and simulate upload
//     if (fileRejections.length > 0) {
//       setError("Only PDF files up to 50MB are allowed.");
//       setState("error");
//       return;
//     }
//     setState("uploading");
//     setProgress(0);
//     // Simulate upload
//     const interval = setInterval(() => {
//       setProgress((p) => {
//         if (p >= 100) {
//           clearInterval(interval);
//           setState("success");
//           setTimeout(() => {
//             onSuccess?.();
//             onClose();
//           }, 1200);
//           return 100;
//         }
//         return p + 10;
//       });
//     }, 120);
//   };

//   const { getRootProps, getInputProps, isDragActive } = useDropzone({
//     accept: { "application/pdf": [".pdf"] },
//     maxSize: 50 * 1024 * 1024,
//     multiple: false,
//     onDrop,
//   });

//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="max-w-md bg-black/70 border border-white/10 backdrop-blur-xl rounded-2xl shadow-xl">
//         <DialogTitle className="text-white text-xl mb-4">Upload PDF</DialogTitle>
//         <AnimatePresence>
//           {state === "default" || state === "drag" ? (
//             <motion.div
//               {...getRootProps()}
//               className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all ${
//                 isDragActive ? "border-blue-500 bg-blue-500/10 shadow-lg" : "border-white/20 bg-black/30"
//               }`}
//               initial={{ scale: 0.95, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.95, opacity: 0 }}
//               whileHover={{ scale: 1.02 }}
//             >
//               <input {...getInputProps()} />
//               <CloudUpload className="w-12 h-12 text-blue-400 mb-2 animate-bounce" />
//               <div className="text-lg text-white font-semibold mb-1">Drop your PDF here or click to browse</div>
//               <div className="text-sm text-gray-400">Supports PDF files up to 50MB</div>
//             </motion.div>
//           ) : null}
//           {state === "uploading" ? (
//             <motion.div
//               className="flex flex-col items-center justify-center p-8"
//               initial={{ scale: 0.95, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.95, opacity: 0 }}
//             >
//               <Loader2 className="w-10 h-10 text-blue-400 animate-spin mb-4" />
//               <div className="w-full bg-white/10 rounded-full h-2 mb-2">
//                 <div
//                   className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all"
//                   style={{ width: `${progress}%` }}
//                 />
//               </div>
//               <div className="text-sm text-gray-300">{progress}% uploading...</div>
//             </motion.div>
//           ) : null}
//           {state === "success" ? (
//             <motion.div
//               className="flex flex-col items-center justify-center p-8"
//               initial={{ scale: 0.95, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.95, opacity: 0 }}
//             >
//               <CheckCircle className="w-10 h-10 text-green-400 mb-2" />
//               <div className="text-lg text-green-300 font-semibold mb-1">Upload successful!</div>
//               <Button className="mt-2" onClick={onClose}>
//                 View PDF
//               </Button>
//             </motion.div>
//           ) : null}
//           {state === "error" ? (
//             <motion.div
//               className="flex flex-col items-center justify-center p-8"
//               initial={{ scale: 0.95, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.95, opacity: 0 }}
//             >
//               <XCircle className="w-10 h-10 text-red-400 mb-2" />
//               <div className="text-lg text-red-300 font-semibold mb-1">Upload failed</div>
//               <div className="text-sm text-gray-300 mb-2">{error}</div>
//               <Button variant="outline" onClick={() => setState("default")}>
//                 Try Again
//               </Button>
//             </motion.div>
//           ) : null}
//         </AnimatePresence>
//       </DialogContent>
//     </Dialog>
//   );
// }