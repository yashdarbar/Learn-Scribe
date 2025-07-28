"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Plus, Search, Loader2, AlertCircle, User } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPublishedBlogs } from "@/lib/actions/blog-actions";
import { BlogWithDetails } from "@/types/blog";
import BlogReader from "@/components/blog/BlogReader";

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
export default function BlogsPage() {
  const [blogs, setBlogs] = useState<BlogWithDetails[]>([]);
  const [allBlogs, setAllBlogs] = useState<BlogWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBlogSlug, setSelectedBlogSlug] = useState<string | null>(null);
  const router = useRouter();

  // Fetch all blogs from database
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await getPublishedBlogs();

        if (result.success && result.data) {
          const blogsData = result.data as BlogWithDetails[];
          setAllBlogs(blogsData);
          setBlogs(blogsData);
        } else {
          setError(result.error || 'Failed to load blogs');
        }
      } catch (err) {
        setError('Failed to fetch blogs');
        console.error('Error fetching blogs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Filter blogs based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setBlogs(allBlogs);
    } else {
      const filtered = allBlogs.filter(blog =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.author?.user_metadata?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.author?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setBlogs(filtered);
    }
  }, [searchTerm, allBlogs]);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle blog click
  const handleBlogClick = (slug: string) => {
    setSelectedBlogSlug(slug);
  };

  // Handle close reader
  const handleCloseReader = () => {
    setSelectedBlogSlug(null);
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center py-8 px-2">
      <RetroGrid />
      <div className="absolute top-0 z-[0] h-screen w-screen bg-purple-950/10 bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

      {/* Blog Reader Modal */}
      {selectedBlogSlug && (
        <BlogReader
          blogSlug={selectedBlogSlug}
          onClose={handleCloseReader}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-6xl relative z-10"
      >
        <Card className="backdrop-blur-xl bg-black/30 border border-white/10 rounded-2xl shadow-xl p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Explore & Create Blogs</h1>
              <p className="text-gray-400">Discover amazing content from our community</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search blogs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg bg-black/30 border border-white/10 px-4 py-2 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
              <Button asChild variant="outline" className="ml-2">
                <Link href="/blogs/my-blogs">
                  <User className="w-4 h-4 mr-2" /> My Blogs
                </Link>
              </Button>
              <Button asChild className="ml-2">
                <Link href="/editor">
                  <Plus className="w-4 h-4 mr-2" /> Write New Blog
                </Link>
              </Button>
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
                <p className="text-gray-400">Loading blogs...</p>
              </div>
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
                <p className="text-red-400 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Blog Cards Grid */}
          {!loading && !error && (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {blogs.length === 0 ? (
                <Card className="col-span-full p-8 text-center text-gray-300 bg-black/30 border border-white/10">
                  {searchTerm ? (
                    <>
                      <p className="mb-4">No blogs found matching "{searchTerm}"</p>
                      <Button variant="outline" onClick={() => setSearchTerm("")}>
                        Clear Search
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="mb-4">No blogs found. Start by writing your first blog!</p>
                      <Button asChild>
                        <Link href="/editor">
                          <Plus className="w-4 h-4 mr-2" />
                          Write Your First Blog
                        </Link>
                      </Button>
                    </>
                  )}
                </Card>
              ) : (
                blogs.map((blog) => (
                  <motion.div
                    key={blog.id}
                    whileHover={{ scale: 1.03, boxShadow: "0 4px 32px 0 rgba(0,0,0,0.15)" }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Card
                      className="backdrop-blur-xl bg-black/20 border border-white/10 p-6 flex flex-col h-full transition-all cursor-pointer"
                      onClick={() => handleBlogClick(blog.slug)}
                    >
                      {/* Cover image */}
                      {blog.cover_image_url && (
                        <div className="mb-4">
                          <img
                            src={blog.cover_image_url}
                            alt={blog.title}
                            className="w-full h-32 object-cover rounded-lg border border-white/10"
                          />
                        </div>
                      )}

                      {/* Category */}
                      {blog.category && (
                        <div className="mb-2">
                          <span
                            className="inline-block px-2 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: `${blog.category.color}20`,
                              color: blog.category.color
                            }}
                          >
                            {blog.category.name}
                          </span>
                        </div>
                      )}

                      <h2 className="text-xl font-semibold text-white mb-2">{blog.title}</h2>
                      <p className="text-gray-300 mb-4 flex-1">{blog.excerpt}</p>

                      {/* Author info */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-xs font-semibold">
                          {blog.author?.user_metadata?.first_name?.[0] || blog.author?.email?.[0] || 'U'}
                        </div>
                        <span className="text-sm text-gray-400">
                          {blog.author?.user_metadata?.first_name || blog.author?.email || 'Unknown Author'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-400 mt-auto">
                        <span>{formatDate(blog.published_at || blog.created_at)}</span>
                        <span>{blog.read_time} min read</span>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}