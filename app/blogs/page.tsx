"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { Plus, Search, Loader2, AlertCircle, User, ArrowLeft, LogOut } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPublishedBlogs } from "@/lib/actions/blog-actions";
import { BlogWithDetails } from "@/types/blog";
import BlogReader from "@/components/blog/BlogReader";
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
export default function BlogsPage() {
  const [blogs, setBlogs] = useState<BlogWithDetails[]>([]);
  const [allBlogs, setAllBlogs] = useState<BlogWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBlogSlug, setSelectedBlogSlug] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [headerLoading, setHeaderLoading] = useState(false);
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
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <RetroGrid />
      <div className="absolute top-0 z-[0] h-screen w-screen bg-blue-950/10 bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(59,130,246,0.3),rgba(255,255,255,0))]" />

      {/* Header - Copied from dashboard with blue theme */}
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-white/10 bg-black/50 backdrop-blur-xl">
  <div className="text-base sm:text-lg lg:text-xl font-bold tracking-tight bg-clip-text text-transparent bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.7)_100%)] flex-1 min-w-0 pr-4">
    <span className="truncate">
      Welcome back, {user?.user_metadata?.first_name || user?.email || "User"}
    </span>
  </div>

  <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-shrink-0">
    <div className="relative inline-block overflow-hidden rounded-full p-[1px]">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-300/20 to-orange-200/20 rounded-full" />
      <Avatar className="relative bg-gradient-to-tr from-zinc-300/5 via-purple-400/20 to-transparent border border-white/10 w-8 h-8 sm:w-10 sm:h-10">
        <span className="text-sm sm:text-lg font-semibold text-white">
          {user?.user_metadata?.full_name?.[0] || user?.email?.[0]}
        </span>
      </Avatar>
    </div>

    <span className="relative inline-block overflow-hidden rounded-full p-[1px]">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-300/20 to-orange-200/20 rounded-full" />
      <Button
        variant="ghost"
        size="icon"
        onClick={handleLogout}
        disabled={loading}
        aria-label="Logout"
        className="
          relative
          h-8 w-8 sm:h-10 sm:w-10 rounded-full
          bg-gradient-to-tr from-zinc-300/5 via-purple-400/20 to-transparent
          border border-white/10
          hover:from-zinc-300/10 hover:via-purple-400/30
          text-white flex items-center justify-center
          transition-all
          p-0
        "
      >
        <LogOut className="w-4 h-4" />
      </Button>
    </span>
  </div>
</header>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center py-8 px-2">
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
            {/* Back to Dashboard button in left corner */}
            {/* <div className="mb-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  size="lg"
                  onClick={() => router.push('/dashboard')}
                  className="w-full md:w-auto flex items-center gap-2 bg-gradient-to-r from-blue-600/80 to-blue-700/80 hover:from-blue-600 hover:to-blue-700 border border-blue-500/30 hover:border-blue-500/50 text-white shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </Button>
              </motion.div>
            </div> */}

            {/* Heading and action buttons */}
            <div className="flex flex-col gap-6 mb-8">
  {/* Header Section */}
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">Explore & Create Blogs</h1>
      <p className="text-gray-400">Discover amazing content from our community</p>
    </div>
  </div>

  {/* Search and Actions Section */}
  <div className="flex flex-col sm:flex-row gap-3">
    {/* Search Input */}
    <div className="relative flex-1 min-w-0">
      <input
        type="text"
        placeholder="Search blogs..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full rounded-lg bg-black/30 border border-white/10 px-4 py-2 pr-10 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
    </div>

    {/* Action Buttons */}
    <div className="flex gap-2 sm:gap-3 flex-shrink-0">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className="flex-1 sm:flex-none"
      >
        <Button
          asChild
          variant="outline"
          className="w-full sm:w-auto border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-500/50 transition-all hover:text-white duration-300 px-3 sm:px-4"
        >
          <Link href="/blogs/my-blogs">
            <User className="w-4 h-4 sm:mr-2" />
            <span className="hidden xs:inline sm:inline">My Blogs</span>
            <span className="xs:hidden sm:hidden">My</span>
          </Link>
        </Button>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className="flex-1 sm:flex-none"
      >
        <Button
          asChild
          className="w-full sm:w-auto bg-gradient-to-r from-blue-600/80 to-blue-700/80 hover:from-blue-600 hover:to-blue-700 border border-blue-500/30 hover:border-blue-500/50 text-white shadow-lg hover:shadow-blue-500/25 transition-all duration-300 px-3 sm:px-4"
        >
          <Link href="/editor">
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden xs:inline sm:inline">Write New Blog</span>
            <span className="xs:hidden sm:hidden">Write</span>
          </Link>
        </Button>
      </motion.div>
    </div>
  </div>
</div>

            {/* Loading state */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
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
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Button onClick={() => window.location.reload()} variant="outline" size="sm" className="border-blue-500/30 hover:bg-blue-500/20">
                      Try Again
                    </Button>
                  </motion.div>
                </div>
              </div>
            )}

            {/* Blog Cards Grid */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {!loading && !error && blogs.length === 0 ? (
                <Card className="col-span-full p-8 text-center text-gray-300 bg-black/30 border border-white/10">
                  {searchTerm ? (
                    <>
                      <p className="mb-4">No blogs found matching "{searchTerm}"</p>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <Button variant="outline" onClick={() => setSearchTerm("")} className="border-blue-500/30 hover:bg-blue-500/20">
                          Clear Search
                        </Button>
                      </motion.div>
                    </>
                  ) : (
                    <>
                      <p className="mb-4">No blogs found. Start by writing your first blog!</p>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <Button asChild className="bg-gradient-to-r from-blue-600/80 to-blue-700/80 hover:from-blue-600 hover:to-blue-700 border border-blue-500/30 hover:border-blue-500/50 text-white shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
                          <Link href="/editor">
                            <Plus className="w-4 h-4 mr-2" />
                            Write Your First Blog
                          </Link>
                        </Button>
                      </motion.div>
                    </>
                  )}
                </Card>
              ) : (
                blogs.map((blog) => (
                  <motion.div
                    key={blog.id}
                    whileHover={{ scale: 1.03, boxShadow: "0 4px 32px 0 rgba(0,0,0,0.15)" }}
                    transition={{ type: "spring", stiffness: 300 }}
                    onClick={() => handleBlogClick(blog.slug)}
                    className="cursor-pointer"
                  >
                    <Card className="backdrop-blur-xl bg-black/20 border border-white/10 p-6 flex flex-col h-full transition-all hover:border-blue-500/30">
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
                        <div className="w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center text-xs font-semibold">
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
          </Card>
        </motion.div>
      </div>
    </div>
  );
}