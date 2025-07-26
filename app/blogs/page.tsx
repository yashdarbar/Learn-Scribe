"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
// import { useState } from "react";

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

const mockBlogs = [
  {
    id: 1,
    title: "Getting Started with AI Writing",
    excerpt: "Learn how AI can help you write better content...",
    author: "John Doe",
    date: "2024-01-15",
    tags: ["AI", "Writing", "Tutorial"],
    readTime: "5 min read"
  },
  {
    id: 2,
    title: "10 Tips for SEO Blogging",
    excerpt: "Boost your blog's visibility with these SEO tips...",
    author: "Jane Smith",
    date: "2024-01-20",
    tags: ["SEO", "Blogging"],
    readTime: "7 min read"
  },
  {
    id: 3,
    title: "Integrating PDFs into Your Research",
    excerpt: "Use PDFs for citations and research in your blogs...",
    author: "Alex Lee",
    date: "2024-01-22",
    tags: ["PDF", "Research"],
    readTime: "6 min read"
  },
  {
    id: 4,
    title: "AI vs Human: Who Writes Better?",
    excerpt: "A deep dive into AI-generated vs human-written content...",
    author: "Sam Patel",
    date: "2024-01-25",
    tags: ["AI", "Comparison"],
    readTime: "8 min read"
  },
  {
    id: 5,
    title: "How to Stay Consistent with Blogging",
    excerpt: "Consistency is key. Here’s how to keep up...",
    author: "Chris Kim",
    date: "2024-01-28",
    tags: ["Productivity", "Blogging"],
    readTime: "4 min read"
  },
];

export default function BlogsPage() {
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
            <h1 className="text-3xl font-bold text-white mb-2 md:mb-0">Explore & Create Blogs</h1>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search blogs..."
                  className="w-full rounded-lg bg-black/30 border border-white/10 px-4 py-2 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
              <Button asChild className="ml-2">
                <Link href="/editor">
                  <Plus className="w-4 h-4 mr-2" /> Write New Blog
                </Link>
              </Button>
            </div>
          </div>
          {/* Blog Cards Grid */}
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {mockBlogs.length === 0 ? (
              <Card className="col-span-full p-8 text-center text-gray-300 bg-black/30 border border-white/10">
                No blogs found. Start by writing your first blog!
              </Card>
            ) : (
              mockBlogs.map((blog) => (
                <motion.div
                  key={blog.id}
                  whileHover={{ scale: 1.03, boxShadow: "0 4px 32px 0 rgba(0,0,0,0.15)" }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="backdrop-blur-xl bg-black/20 border border-white/10 p-6 flex flex-col h-full transition-all">
                    <h2 className="text-xl font-semibold text-white mb-2">{blog.title}</h2>
                    <p className="text-gray-300 mb-4 flex-1">{blog.excerpt}</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {blog.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-xs font-medium">{tag}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400 mt-auto">
                      <span>By {blog.author}</span>
                      <span>{blog.date} • {blog.readTime}</span>
                    </div>
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