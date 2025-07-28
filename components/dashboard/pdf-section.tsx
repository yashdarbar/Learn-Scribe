import { Button } from "@/components/ui/button"
import { BookOpen, Brain, MessageCircle, Sparkles, ChevronRight, ExternalLink, Play } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export function PdfSection() {
  return (
    <motion.section
      className="relative h-full"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-orange-500/10 to-transparent rounded-2xl" />

      <div className="relative z-10 flex flex-col h-full justify-between p-8 rounded-2xl border border-white/10 bg-black/20 backdrop-blur-xl">
        {/* Header with icon and title */}
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-10 h-10 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">PDF Learning Hub</h2>
        </div>

        {/* Feature tagline */}
        <p className="text-lg text-gray-300 mb-6">
          Transform any document into interactive study materials
        </p>

        {/* Benefits list */}
        <ul className="space-y-3 mb-8 text-gray-200">
          <li className="flex items-start gap-3">
            <MessageCircle className="w-5 h-5 text-purple-400 mt-0.5" />
            <span>Upload PDFs and ask AI questions about the content</span>
          </li>
          <li className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-purple-400 mt-0.5" />
            <span>Generate flashcards automatically from document text</span>
          </li>
          <li className="flex items-start gap-3">
            <Brain className="w-5 h-5 text-purple-400 mt-0.5" />
            <span>Create quizzes to test your understanding</span>
          </li>
          <li className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-purple-400 mt-0.5" />
            <span>Track your learning progress and identify weak areas</span>
          </li>
        </ul>

        {/* Perfect for section */}
        <div className="mb-8 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <p className="text-sm text-purple-300">
            <strong>Perfect for:</strong> Students, researchers, and professionals who need to learn from documents effectively.
          </p>
        </div>

        {/* Primary CTA */}
        <Button asChild size="default" className="mb-4">
          <Link href="/pdf">
            Upload Your First PDF
            <ChevronRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>

        {/* Secondary CTA */}
        {/* <Button asChild variant="ghost" size="sm">
          <Link href="/pdf-demo">
            See How It Works
            <Play className="w-3 h-3 ml-2" />
          </Link>
        </Button> */}
      </div>
    </motion.section>
  )
}