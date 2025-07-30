"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useDropzone } from "react-dropzone";
import { useState, useTransition } from "react";
import { CloudUpload, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { uploadPDF, type UploadResult } from "@/app/actions/pdf-upload";
import { motion } from "framer-motion";
import { Button } from "./ui/button";

// Define the props interface
interface PdfUploadModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (pdfId: string) => void;
}

// Define the state type
type UploadState = "default" | "drag" | "uploading" | "success" | "error";

export function PdfUploadModal({ open, onClose, onSuccess }: PdfUploadModalProps) {
  const [state, setState] = useState<UploadState>("default");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [uploadedPdfId, setUploadedPdfId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  // Updated function to use Server Action instead of API route
  const uploadWithServerAction = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    console.log("📄 Starting upload with Server Action:", {
      name: file.name,
      size: file.size,
      type: file.type
    });

    try {
      // Use Server Action instead of fetch
      const result = await uploadPDF(formData);

      console.log('📄 Server Action Response:', result);

      if (!result.success) {
        throw new Error(result.message || 'Upload failed');
      }

      return result;
    } catch (error) {
      console.error('❌ Server Action error:', error);
      throw error;
    }
  };

  const onDrop = async (acceptedFiles: File[], fileRejections: any[]) => {
    console.log('📁 Files dropped:', acceptedFiles);
    console.log('❌ Rejected files:', fileRejections);

    // Validate files
    if (fileRejections.length > 0) {
      const rejection = fileRejections[0];
      if (rejection.errors.some((e: any) => e.code === 'file-too-large')) {
        setError("File size too large. Maximum 50MB allowed.");
      } else if (rejection.errors.some((e: any) => e.code === 'file-invalid-type')) {
        setError("Only PDF files are allowed.");
      } else {
        setError("Invalid file. Please try again.");
      }
      setState("error");
      return;
    }

    if (acceptedFiles.length === 0) {
      setError("No valid files selected.");
      setState("error");
      return;
    }

    const file = acceptedFiles[0];
    console.log('📄 Processing file:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    setState("uploading");
    setProgress(0);
    setError("");

    // Use React's startTransition for better UX
    startTransition(async () => {
      try {
        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90; // Stop at 90% until upload completes
            }
            return prev + 10;
          });
        }, 200);

        // Upload using Server Action
        const result = await uploadWithServerAction(file);

        // Complete progress
        clearInterval(progressInterval);
        setProgress(100);

        // Set success state
        setState("success");
        setUploadedPdfId(result.pdfId || null);

        console.log('✅ Upload completed, PDF ID:', result.pdfId);

        // Auto-redirect after success
        // setTimeout(() => {
        //   if (result.pdfId) {
        //     onSuccess?.(result.pdfId);
        //     onClose();
        //     router.push(`/pdf/${result.pdfId}`);
        //   }
        // }, 1500);

      } catch (error: any) {
        console.error('❌ Upload failed:', error);
        setState("error");
        setError(error.message || "Upload failed. Please try again.");
      }
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: false,
    onDrop,
  });

  const handleClose = () => {
    if (state === "uploading" || isPending) return; // Prevent closing during upload
    setState("default");
    setProgress(0);
    setError("");
    setUploadedPdfId(null);
    onClose();
  };

  const handleViewPDF = () => {
    if (uploadedPdfId) {
      onClose();
      router.push(`/pdf/${uploadedPdfId}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-black/70 border border-white/10 backdrop-blur-xl rounded-2xl shadow-xl">
        <DialogTitle className="text-white text-xl mb-4">Upload PDF</DialogTitle>
        <AnimatePresence mode="wait">
          {(state === "default" || state === "drag") && (
  <motion.div
    className="p-0" // Container for animation
    initial={{ scale: 0.95, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.95, opacity: 0 }}
    key="dropzone"
  >
    <div
      {...getRootProps()}
      className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all ${
        isDragActive
          ? "border-blue-500 bg-blue-500/10 shadow-lg"
          : "border-white/20 bg-black/30 hover:border-purple-400/50 hover:bg-purple-500/5"
      }`}
      style={{
        transform: 'scale(1)',
        transition: 'transform 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.02)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      <input {...getInputProps()} />
      <CloudUpload className="w-12 h-12 text-blue-400 mb-2 animate-bounce" />
      <div className="text-lg text-white font-semibold mb-1">
        Drop your PDF here or click to browse
      </div>
      <div className="text-sm text-gray-400">
        Supports PDF files up to 50MB
      </div>
    </div>
  </motion.div>
)}


          {(state === "uploading" || isPending) && (
            <motion.div
              className="flex flex-col items-center justify-center p-8"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              key="uploading"
            >
              <Loader2 className="w-10 h-10 text-blue-400 animate-spin mb-4" />
              <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                <motion.div
                  className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="text-sm text-gray-300">
                {progress < 90 ? `${progress}% uploading...` : 'Processing PDF...'}
              </div>
            </motion.div>
          )}

          {state === "success" && (
            <motion.div
              className="flex flex-col items-center justify-center p-8"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              key="success"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <CheckCircle className="w-10 h-10 text-green-400 mb-2" />
              </motion.div>
              <div className="text-lg text-green-300 font-semibold mb-1">
                Upload successful!
              </div>
              <div className="text-sm text-gray-300 mb-4 text-center">
                Your PDF is ready for viewing and AI interaction.
              </div>
              <Button
                className="mt-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                onClick={handleViewPDF}
              >
                View PDF
              </Button>
            </motion.div>
          )}

          {state === "error" && (
            <motion.div
              className="flex flex-col items-center justify-center p-8"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              key="error"
            >
              <XCircle className="w-10 h-10 text-red-400 mb-2" />
              <div className="text-lg text-red-300 font-semibold mb-1">
                Upload failed
              </div>
              <div className="text-sm text-gray-300 mb-4 text-center">
                {error}
              </div>
              <Button
                variant="outline"
                onClick={() => setState("default")}
                className="border-white/20 hover:border-purple-400/50"
              >
                Try Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}