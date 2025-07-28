"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Share2,
  Eye,
  Clock,
  Calendar,
  User,
  ArrowLeft,
  ExternalLink,
  MessageCircle,
  Bookmark,
  Twitter,
  Facebook,
  Linkedin,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { getBlogBySlug, likeBlog, unlikeBlog } from "@/lib/actions/blog-actions";
import { BlogWithDetails } from "@/types/blog";
import BlogContent from "./reader/BlogContent";
import BlogEngagement from "./reader/BlogEngagement";

interface BlogReaderProps {
  blogSlug: string;
  onClose?: () => void;
}

export default function BlogReader({ blogSlug, onClose }: BlogReaderProps) {
  const [blog, setBlog] = useState<BlogWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Load blog data
  useEffect(() => {
    const loadBlog = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await getBlogBySlug(blogSlug);

        if (result.success && result.data) {
          setBlog(result.data);
          setIsLiked(result.data.user_has_liked);
          setLikeCount(result.data.like_count);
        } else {
          setError(result.error || 'Blog not found');
        }
      } catch (error) {
        setError('Failed to load blog');
        console.error('Error loading blog:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBlog();
  }, [blogSlug]);

  // Handle like/unlike
  const handleLike = async () => {
    if (!blog) return;

    try {
      const result = isLiked
        ? await unlikeBlog(blog.id)
        : await likeBlog(blog.id);

      if (result.success) {
        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  // Handle social sharing
  const handleShare = (platform: string) => {
    if (!blog) return;

    const url = window.location.href;
    const title = blog.title;
    const text = blog.excerpt || '';

    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Loading blog...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Blog Not Found</h2>
          <p className="text-gray-400 mb-4">{error || 'The blog you are looking for does not exist.'}</p>
          <Button onClick={onClose}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={`flex items-center gap-2 ${
                    isLiked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="text-sm">{likeCount}</span>
                </Button>

                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="text-gray-400 hover:text-white"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>

                  <AnimatePresence>
                    {showShareMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 top-full mt-2 bg-black/90 border border-white/10 rounded-lg p-2 shadow-xl"
                      >
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShare('twitter')}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Twitter className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShare('facebook')}
                            className="text-blue-600 hover:text-blue-500"
                          >
                            <Facebook className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShare('linkedin')}
                            className="text-blue-700 hover:text-blue-600"
                          >
                            <Linkedin className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShare('copy')}
                            className="text-gray-400 hover:text-white"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-4xl mx-auto px-6 py-8">
          {/* Blog header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            {/* Category */}
            {blog.category && (
              <div className="mb-4">
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${blog.category.color}20`,
                    color: blog.category.color
                  }}
                >
                  {blog.category.name}
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {blog.title}
            </h1>

            {/* Cover image */}
            {blog.cover_image_url && (
              <div className="mb-6">
                <img
                  src={blog.cover_image_url}
                  alt={blog.title}
                  className="w-full h-64 md:h-80 object-cover rounded-lg border border-white/10"
                />
              </div>
            )}

            {/* Meta information */}
            <div className="flex items-center gap-6 text-sm text-gray-400 mb-6">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{blog.author.user_metadata?.first_name || blog.author.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(blog.published_at || blog.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{blog.read_time} min read</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{blog.view_count} views</span>
              </div>
            </div>

            {/* Excerpt */}
            {blog.excerpt && (
              <p className="text-lg text-gray-300 leading-relaxed mb-8">
                {blog.excerpt}
              </p>
            )}
          </motion.div>

          {/* Blog content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="prose prose-invert prose-lg max-w-none"
          >
            <BlogContent content={blog.content} />
          </motion.div>

          {/* Engagement section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-12 pt-8 border-t border-white/10"
          >
            <BlogEngagement
              blog={blog}
              isLiked={isLiked}
              likeCount={likeCount}
              onLike={handleLike}
              onShare={handleShare}
            />
          </motion.div>
        </main>
      </div>
    </div>
  );
}