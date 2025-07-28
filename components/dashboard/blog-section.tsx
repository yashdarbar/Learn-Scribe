import { Button } from "@/components/ui/button"
import { Pen, Sparkles, FileText, Target, ChevronRight, ExternalLink } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export function BlogSection() {
  return (
    <motion.section
      className="relative h-full"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-transparent rounded-2xl" />

      <div className="relative z-10 flex flex-col h-full justify-between p-8 rounded-2xl border border-white/10 bg-black/20 backdrop-blur-xl">
        {/* Header with icon and title */}
        <div className="flex items-center gap-3 mb-4">
          <Pen className="w-10 h-10 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Blog Platform</h2>
        </div>

        {/* Feature tagline */}
        <p className="text-lg text-gray-300 mb-6">
          Create engaging content with AI-powered writing assistance
        </p>

        {/* Benefits list */}
        <ul className="space-y-3 mb-8 text-gray-200">
          <li className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-400 mt-0.5" />
            <span>Get real-time writing suggestions as you type</span>
          </li>
          <li className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-400 mt-0.5" />
            <span>Upload PDFs for research context and citations</span>
          </li>
          <li className="flex items-start gap-3">
            <Target className="w-5 h-5 text-blue-400 mt-0.5" />
            <span>Optimize your content for SEO automatically</span>
          </li>
          <li className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-400 mt-0.5" />
            <span>Write better blogs with grammar and style improvements</span>
          </li>
        </ul>

        {/* Perfect for section */}
        <div className="mb-8 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <p className="text-sm text-blue-300">
            <strong>Perfect for:</strong> Content creators, bloggers, and writers who want to produce high-quality articles efficiently.
          </p>
        </div>

        {/* Primary CTA */}
        {/* <Button asChild size="default" className="mb-4">
          <Link href="/editor">
            Start Writing Your First Blog
            <ChevronRight className="w-4 h-4 ml-2" />
          </Link>
        </Button> */}

        {/* Secondary CTAs */}
        <div className="flex gap-2 mb-4">
          <Button asChild variant="default" size="sm" className="flex-1">
            <Link href="/blogs">
              Start Writing Your First Blog
              <ExternalLink className="w-3 h-3 ml-2" />
            </Link>
          </Button>
          <Button asChild variant="default" size="sm" className="flex-1">
            <Link href="/blogs">
              Explore All Blogs
              <ExternalLink className="w-3 h-3 ml-2" />
            </Link>
          </Button>
          {/* <Button asChild variant="default" size="sm" className="flex-1">
            <Link href="/blogs/my-blogs">
              My Blogs
              <ExternalLink className="w-3 h-3 ml-2" />
            </Link>
          </Button> */}
        </div>
      </div>
    </motion.section>
  )
}