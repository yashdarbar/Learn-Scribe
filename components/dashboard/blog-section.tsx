import { Button } from "@/components/ui/button"
import { Pen, ChevronRight, BookOpen, Users, Eye, MessageSquare } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import Image from "next/image"

export function BlogSection() {
  return (
    <motion.section
      className="relative h-full"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="relative z-10 h-full p-8 rounded-xl backdrop-blur-xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full items-center">
          {/* Left side - Image */}
          <div className="relative order-first">
            <div className="relative w-full aspect-[16/10] overflow-hidden rounded-xl border border-gray-800 shadow-2xl">
              <Image
                src="/blog-image.png"
                alt="Blog Platform Interface"
                fill
                className="object-cover object-top"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-orange-500/10 opacity-50" />
            </div>
          </div>

          {/* Right side - Content */}
          <div className="space-y-6">
            {/* Feature badge */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 md:px-5 py-2 bg-gradient-to-tr from-zinc-300/5 via-gray-400/5 to-transparent border-[2px] border-white/5 rounded-2xl sm:rounded-3xl group cursor-default">
              <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
              <span className="text-xs sm:text-sm text-gray-400 font-geist">Blog Platform</span>
              <ChevronRight className="inline w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 group-hover:translate-x-1 duration-300 flex-shrink-0" />
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-geist tracking-tight">
              <span className="text-white">Explore & Read </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-orange-200">Amazing Blogs</span>
            </h2>

            {/* Description */}
            <p className="text-gray-300 leading-relaxed">
              Discover and read published blogs by other creators. Explore diverse content,
              engage with writers, and find inspiration for your own writing journey.
            </p>

            {/* Features list */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-purple-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Eye className="w-2.5 h-2.5 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-medium text-sm">Browse Published Blogs</h4>
                  <p className="text-xs text-gray-400">Explore a wide variety of published content</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-purple-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Users className="w-2.5 h-2.5 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-medium text-sm">Connect with Writers</h4>
                  <p className="text-xs text-gray-400">Engage with other creators and their content</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-purple-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MessageSquare className="w-2.5 h-2.5 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-medium text-sm">Get Inspired</h4>
                  <p className="text-xs text-gray-400">Find ideas and inspiration for your own writing</p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <span className="relative inline-block overflow-hidden rounded-full p-[1.5px]">
                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                <div className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-gray-950 text-xs font-medium backdrop-blur-3xl">
                  <Link
                    href="/blogs"
                    className="inline-flex rounded-full text-center group items-center justify-center bg-gradient-to-tr from-zinc-300/5 via-purple-400/20 to-transparent text-white border-input border-[1px] hover:bg-gradient-to-tr hover:from-zinc-300/10 hover:via-purple-400/30 hover:to-transparent transition-all duration-300 py-3 px-6 gap-2"
                  >
                    <BookOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>Explore Blogs</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

