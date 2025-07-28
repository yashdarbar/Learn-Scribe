"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { Plus, Search, Loader2, AlertCircle, Edit, Trash2, Eye, Calendar, Clock, User, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserBlogs, deleteBlog, publishBlog, unpublishBlog } from "@/lib/actions/blog-actions";
import { Blog } from "@/types/blog";
import { createClient } from "@/utils/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

export default function MyBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
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

  // Fetch user's blogs
  useEffect(() => {
    const fetchUserBlogs = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        const result = await getUserBlogs(user.id);

        if (result.success && result.data) {
          let filteredBlogs = result.data;

          // Filter by search term if provided
          if (searchTerm) {
            filteredBlogs = result.data.filter(blog =>
              blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              blog.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
            );
          }

          setBlogs(filteredBlogs);
        } else {
          setError(result.error || 'Failed to load your blogs');
        }
      } catch (err) {
        setError('Failed to fetch your blogs');
        console.error('Error fetching user blogs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserBlogs();
  }, [user, searchTerm]);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle blog actions
  const handleEdit = (blogId: string) => {
    router.push(`/editor?blogId=${blogId}`);
  };

  const handleView = (slug: string) => {
    router.push(`/blogs/${slug}`);
  };

  const handleDelete = async () => {
    if (!blogToDelete) return;

    try {
      setActionLoading(blogToDelete.id);
      const result = await deleteBlog(blogToDelete.id);

      if (result.success) {
        setBlogs(prev => prev.filter(blog => blog.id !== blogToDelete.id));
        setDeleteDialogOpen(false);
        setBlogToDelete(null);
      } else {
        setError(result.error || 'Failed to delete blog');
      }
    } catch (err) {
      setError('Failed to delete blog');
      console.error('Error deleting blog:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePublishToggle = async (blog: Blog) => {
    try {
      setActionLoading(blog.id);

      if (blog.status === 'published') {
        const result = await unpublishBlog(blog.id);
        if (result.success) {
          setBlogs(prev => prev.map(b =>
            b.id === blog.id ? { ...b, status: 'draft', published_at: undefined } : b
          ));
        }
      } else {
        const result = await publishBlog(blog.id);
        if (result.success) {
          setBlogs(prev => prev.map(b =>
            b.id === blog.id ? { ...b, status: 'published', published_at: new Date().toISOString() } : b
          ));
        }
      }
    } catch (err) {
      setError('Failed to update blog status');
      console.error('Error updating blog status:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const openDeleteDialog = (blog: Blog) => {
    setBlogToDelete(blog);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <RetroGrid />
      <div className="absolute top-0 z-[0] h-screen w-screen bg-blue-950/10 bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(59,130,246,0.3),rgba(255,255,255,0))]" />

      {/* Header - Copied from dashboard with blue theme */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.7)_100%)]">
          Welcome back, {user?.user_metadata?.first_name || user?.email || "User"}
        </div>
        <div className="flex items-center gap-4">
          <div className="relative inline-block overflow-hidden rounded-full p-[1px]">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-300/20 to-purple-200/20 rounded-full" />
            <Avatar className="relative bg-gradient-to-tr from-zinc-300/5 via-blue-400/20 to-transparent border border-white/10">
              <span className="text-lg font-semibold text-white">{user?.user_metadata?.full_name?.[0] || user?.email?.[0]}</span>
            </Avatar>
          </div>
          <span className="relative inline-block overflow-hidden rounded-full p-[1px]">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-300/20 to-purple-200/20 rounded-full" />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={headerLoading}
              className="relative bg-gradient-to-tr from-zinc-300/5 via-blue-400/20 to-transparent border border-white/10 hover:from-zinc-300/10 hover:via-blue-400/30 text-white"
              aria-label="Logout"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </Button>
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center py-8 px-2">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full max-w-6xl relative z-10"
        >
          <Card className="backdrop-blur-xl bg-black/30 border border-white/10 rounded-2xl shadow-xl p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="p-2 hover:bg-white/10 text-gray-400 hover:text-gray-300 transition-all duration-300"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </motion.div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">My Blogs</h1>
                  <p className="text-gray-400">Manage your published and draft blogs</p>
                </div>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search your blogs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg bg-black/30 border border-white/10 px-4 py-2 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button asChild className="ml-2 bg-gradient-to-r from-blue-600/80 to-blue-700/80 hover:from-blue-600 hover:to-blue-700 border border-blue-500/30 hover:border-blue-500/50 text-white shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
                    <Link href="/editor">
                      <Plus className="w-4 h-4 mr-2" /> Write New Blog
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* Loading state */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
                  <p className="text-blue-400">Loading your blogs...</p>
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
                      <p className="mb-4">You haven't written any blogs yet.</p>
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
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Card className="backdrop-blur-xl bg-black/20 border border-white/10 p-6 flex flex-col h-full">
                      {/* Status badge */}
                      <div className="flex items-center justify-between mb-4">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            blog.status === 'published'
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          }`}
                        >
                          {blog.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>{blog.read_time} min</span>
                        </div>
                      </div>

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

                      <h2 className="text-xl font-semibold text-white mb-2">{blog.title}</h2>
                      <p className="text-gray-300 mb-4 flex-1">{blog.excerpt}</p>

                      {/* Date info */}
                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {blog.status === 'published' && blog.published_at
                            ? `Published ${formatDate(blog.published_at)}`
                            : `Created ${formatDate(blog.created_at)}`
                          }
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 mt-auto">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(blog.slug)}
                            className="flex-1 border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-500/50 hover:text-white transition-all duration-300"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(blog.id)}
                            className="flex-1 border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-500/50 hover:text-white transition-all duration-300"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePublishToggle(blog)}
                            disabled={actionLoading === blog.id}
                            className="flex-1 border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-500/50 hover:text-white transition-all duration-300"
                          >
                            {actionLoading === blog.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : blog.status === 'published' ? (
                              'Unpublish'
                            ) : (
                              'Publish'
                            )}
                          </Button>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(blog)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/20 border-red-500/30 hover:border-red-500/50 transition-all duration-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-black/90 border border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Blog</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete "{blogToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={actionLoading === blogToDelete?.id}
                className="border-blue-500/30 hover:bg-blue-500/20"
              >
                Cancel
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                onClick={handleDelete}
                disabled={actionLoading === blogToDelete?.id}
                className="bg-red-600 hover:bg-red-700"
              >
                {actionLoading === blogToDelete?.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </Button>
            </motion.div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}