"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Plus, FileText } from "lucide-react";
import Link from "next/link";

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

export default function PdfLibraryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center py-8 px-2">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-6xl"
      >
        <Card className="backdrop-blur-xl bg-black/30 border border-white/10 rounded-2xl shadow-xl p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 md:mb-0">PDF Learning Hub</h1>
            <Button asChild className="w-full md:w-auto">
              <Link href="#">
                <Plus className="w-4 h-4 mr-2" /> Upload New PDF
              </Link>
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
    </div>
  );
}