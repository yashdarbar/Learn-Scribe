import { Button } from "@/components/ui/button"
import { Pen, ChevronRight } from "lucide-react"
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
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-transparent rounded-xl" />

      <div className="relative z-10 flex flex-col h-full justify-between p-8 rounded-xl border border-white/10 bg-black/20 backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/20">
            <Pen className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Blog Platform</h2>
            <p className="text-gray-400 text-sm">AI-powered writing assistance</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-300 text-lg leading-relaxed mb-8">
          Create engaging content with AI-powered writing assistance. Write better blogs with grammar and style improvements.
        </p>

        {/* Primary CTA */}
        <div className="flex justify-center">
          <span className="relative inline-block overflow-hidden rounded-full p-[1.5px] w-48">
            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
            <div className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-gray-950 text-xs font-medium backdrop-blur-3xl">
              <Link
                href="/blogs"
                className="inline-flex rounded-full text-center group items-center justify-center bg-gradient-to-tr from-zinc-300/5 via-purple-400/20 to-transparent text-gray-300 border-input border-[1px] hover:bg-gradient-to-tr hover:from-zinc-300/10 hover:via-purple-400/30 hover:to-transparent transition-all duration-300 py-3 px-6 text-sm font-medium w-full"
              >
                <span>Explore Blogs</span>
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 duration-300" />
              </Link>
            </div>
          </span>
        </div>
      </div>
    </motion.section>
  )
}




// import { Button } from "@/components/ui/button"
// import { Pen, ChevronRight } from "lucide-react"
// import Link from "next/link"
// import { motion } from "framer-motion"

// export function BlogSection() {
//   return (
//     <motion.section
//       className="relative h-full"
//       initial={{ opacity: 0, y: 24 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.6, ease: "easeOut" }}
//     >
//       {/* Background gradient */}
//       <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-transparent rounded-xl" />

//       <div className="relative z-10 flex flex-col h-full justify-between p-8 rounded-xl border border-white/10 bg-black/20 backdrop-blur-xl">
//         {/* Header */}
//         <div className="flex items-center gap-4 mb-6">
//           <div className="p-3 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/20">
//             <Pen className="w-8 h-8 text-blue-400" />
//           </div>
//           <div>
//             <h2 className="text-2xl font-bold text-white mb-1">Blog Platform</h2>
//             <p className="text-gray-400 text-sm">AI-powered writing assistance</p>
//           </div>
//         </div>

//         {/* Description */}
//         <p className="text-gray-300 text-lg leading-relaxed mb-8">
//           Create engaging content with AI-powered writing assistance. Write better blogs with grammar and style improvements.
//         </p>

//         {/* Primary CTA */}
//         <div className="flex justify-center">
//           <span className="relative inline-block overflow-hidden rounded-full p-[1.5px] w-48">
//             <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
//             <div className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-gray-950 text-xs font-medium backdrop-blur-3xl">
//               <Link
//                 href="/blogs"
//                 className="inline-flex rounded-full text-center group items-center justify-center bg-gradient-to-tr from-zinc-300/5 via-purple-400/20 to-transparent text-gray-300 border-input border-[1px] hover:bg-gradient-to-tr hover:from-zinc-300/10 hover:via-purple-400/30 hover:to-transparent transition-all duration-300 py-3 px-6 text-sm font-medium w-full"
//               >
//                 <span>Explore Blogs</span>
//                 <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 duration-300" />
//               </Link>
//             </div>
//           </span>
//         </div>
//       </div>
//     </motion.section>
//   )
// }

