"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save,
  Eye,
  EyeOff,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  Settings,
  Globe,
  Lock,
  ArrowLeft,
  Menu,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createBlog, updateBlog, publishBlog, getAllCategories, getBlogById } from "@/lib/actions/blog-actions";
import { BlogCategory, CreateBlogData, UpdateBlogData } from "@/types/blog";
import TipTapEditor from "./editor/TipTapEditorSSR";
import SimpleAIAssistant from "./editor/SimpleAIAssistant";
import { BlogContent } from "@/types/blog";

interface BlogEditorProps {
  blogId?: string; // For editing existing blogs
  onSave?: (blog: any) => void;
  onPublish?: (blog: any) => void;
  onClose?: () => void;
}

export default function BlogEditor({ blogId, onSave, onPublish, onClose }: BlogEditorProps) {
  // Editor state
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [coverImageUrl, setCoverImageUrl] = useState<string>("");
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [readTime, setReadTime] = useState(1);

  // ✅ UPDATED: Responsive state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // AI Assistant state
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiAssistantPosition, setAIAssistantPosition] = useState({ x: 0, y: 0 });

  // Data state
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Auto-save state
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ UPDATED: Handle back button click
  const handleBack = () => {
    // Navigate to my-blogs page
    window.location.href = '/blogs';
  };

  // ✅ UPDATED: Handle sidebar toggle
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // ✅ UPDATED: Close sidebar on overlay click
  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const result = await getAllCategories();
        if (result.success && result.data) {
          setCategories(result.data);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Load existing blog data for editing
  useEffect(() => {
    const loadBlog = async () => {
      if (!blogId) return;

      try {
        setIsLoading(true);
        const result = await getBlogById(blogId);

        if (result.success && result.data) {
          const blog = result.data;
          console.log('🔍 Loading blog:', blog);
          console.log('📄 Blog content type:', typeof blog.content);
          console.log('📄 Blog content:', blog.content);
          console.log('📄 Blog content stringified:', JSON.stringify(blog.content, null, 2));

          setTitle(blog.title);
          setExcerpt(blog.excerpt || "");

          // Convert old block-based content to HTML if needed
          let contentToSet = blog.content;
          if (typeof blog.content === 'object' && blog.content && 'blocks' in blog.content) {
            // Old block-based format - convert to HTML
            console.log('🔄 Converting old block format to HTML');
            contentToSet = convertBlocksToHTML((blog.content as any).blocks);
            console.log('✅ Converted content:', contentToSet);
          } else if (typeof blog.content === 'string' && blog.content.trim() === '') {
            // Empty content
            console.log('📝 Empty content detected');
            contentToSet = '';
          } else if (typeof blog.content === 'string') {
            console.log('📝 Using content as-is (string format)');
          } else {
            console.log('❓ Unknown content format:', typeof blog.content);
            contentToSet = '';
          }

          console.log('🎯 Final content to set:', contentToSet);
          setContent(contentToSet);
          setCategoryId(blog.category?.id || "");
          setCoverImageUrl(blog.cover_image_url || "");
          setStatus(blog.status);
        } else {
          setError(result.error || 'Failed to load blog');
        }
      } catch (error) {
        console.error('Error loading blog:', error);
        setError('Failed to load blog');
      } finally {
        setIsLoading(false);
      }
    };

    loadBlog();
  }, [blogId]);

  // Helper function to convert old block-based content to HTML
  const convertBlocksToHTML = (blocks: any[]): string => {
    if (!blocks || !Array.isArray(blocks)) return '';

    return blocks.map(block => {
      switch (block.type) {
        case 'paragraph':
          return `<p>${block.content}</p>`;
        case 'heading':
          const level = block.attributes?.level || 1;
          return `<h${level}>${block.content}</h${level}>`;
        case 'list':
          const isOrdered = block.attributes?.ordered === true;
          const listTag = isOrdered ? 'ol' : 'ul';
          return `<${listTag}><li>${block.content}</li></${listTag}>`;
        case 'quote':
          return `<blockquote>${block.content}</blockquote>`;
        case 'code':
          return `<pre><code>${block.content}</code></pre>`;
        case 'image':
          return `<img src="${block.content}" alt="Blog image" />`;
        default:
          return `<p>${block.content}</p>`;
      }
    }).join('');
  };

  // Calculate word count and read time
  useEffect(() => {
    let totalWords = 0;
    // The content state is now a string, not a BlogContent object.
    // This useEffect needs to be updated to parse the string into blocks.
    // For now, we'll keep it as is, but it will not reflect the actual block count.
    // A proper implementation would involve a TipTap extension that provides block counts.
    // For now, we'll just set wordCount to 0 as the content is a string.
    // This will be fixed once TipTap is fully integrated.
    setWordCount(0);
    setReadTime(Math.max(1, Math.ceil(0 / 200))); // 200 words per minute
  }, [content]);

  // Debug useEffect to track content changes
  useEffect(() => {
    // Removed debug logging to improve performance
  }, [content]);

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!title.trim() || isSaving) return;

    setIsSaving(true);
    setError(null);

    try {
      const blogData: CreateBlogData = {
        title: title.trim(),
        content: content, // Save the string content
        excerpt: excerpt.trim(),
        cover_image_url: coverImageUrl,
        category_id: categoryId || undefined,
      };

      const result = blogId
        ? await updateBlog(blogId, blogData)
        : await createBlog(blogData);

      if (result.success) {
        setLastSaved(new Date());
        setSuccess('Draft saved automatically');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || 'Failed to save draft');
      }
    } catch (error) {
      setError('Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  }, [title, content, excerpt, coverImageUrl, categoryId, blogId]);

  // Auto-save on content change
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(autoSave, 3000); // Auto-save after 3 seconds

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [autoSave]);

  // Manual save
  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const blogData: CreateBlogData = {
        title: title.trim(),
        content: content, // Save the string content
        excerpt: excerpt.trim(),
        cover_image_url: coverImageUrl,
        category_id: categoryId || undefined,
      };

      const result = blogId
        ? await updateBlog(blogId, blogData)
        : await createBlog(blogData);

      if (result.success) {
        setLastSaved(new Date());
        setSuccess('Blog saved successfully');
        setTimeout(() => setSuccess(null), 3000);
        onSave?.(result.data);
      } else {
        setError(result.error || 'Failed to save blog');
      }
    } catch (error) {
      setError('Failed to save blog');
    } finally {
      setIsSaving(false);
    }
  };

  // Publish blog
  const handlePublish = async () => {
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    setIsPublishing(true);
    setError(null);

    try {
      const blogData: CreateBlogData = {
        title: title.trim(),
        content: content, // Save the string content
        excerpt: excerpt.trim(),
        cover_image_url: coverImageUrl,
        category_id: categoryId || undefined,
      };

      let result;
      if (blogId) {
        result = await updateBlog(blogId, { ...blogData, status: 'published' });
      } else {
        result = await createBlog(blogData);
        if (result.success && result.data) {
          result = await publishBlog(result.data.id);
        }
      }

      if (result.success) {
        setStatus('published');
        setSuccess('Blog published successfully');
        setTimeout(() => setSuccess(null), 3000);
        onPublish?.(result.data);
      } else {
        setError(result.error || 'Failed to publish blog');
      }
    } catch (error) {
      setError('Failed to publish blog');
    } finally {
      setIsPublishing(false);
    }
  };

  // Add new block
  const addBlock = (type: string, afterId?: string) => {
    // This function is no longer needed as TipTap handles block creation
    // Keeping it for now, but it will be removed once TipTap is fully integrated
    console.log('addBlock called with type:', type, 'afterId:', afterId);
  };

  // Update block
  const updateBlock = (id: string, updates: any) => {
    // This function is no longer needed as TipTap handles block updates
    // Keeping it for now, but it will be removed once TipTap is fully integrated
    console.log('updateBlock called with ID:', id, 'updates:', updates);
  };

  // Delete block
  const deleteBlock = (id: string) => {
    // This function is no longer needed as TipTap handles block deletion
    // Keeping it for now, but it will be removed once TipTap is fully integrated
    console.log('deleteBlock called with ID:', id);
  };

  // Move block
  const moveBlock = (id: string, direction: 'up' | 'down') => {
    // This function is no longer needed as TipTap handles block reordering
    // Keeping it for now, but it will be removed once TipTap is fully integrated
    console.log('moveBlock called with ID:', id, 'direction:', direction);
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex flex-col">
      {/* ✅ UPDATED: Responsive Header with proper mobile layout */}
      {/* // Replace your existing header section with this responsive version */}

<header className="border-b border-white/10 bg-black/50">
  {/* Mobile Header (Below 750px) */}
  <div className="flex max-[750px]:flex min-[750px]:hidden items-center justify-between p-3">
    {/* Left side - Back button, icon, title */}
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <Button
        size="sm"
        variant="default"
        onClick={handleBack}
        className="p-2 h-9 w-9 flex-shrink-0"
      >
        <ArrowLeft className="w-4 h-4" />
      </Button>
      <FileText className="w-4 h-4 text-purple-400 flex-shrink-0" />
      <span className="text-sm font-semibold text-white truncate">
        {blogId ? 'Edit Blog' : 'Write New Blog'}
      </span>
    </div>

    {/* Right side - Settings and action buttons */}
    <div className="flex items-center gap-1">
      {/* Settings button */}
      <Button
        size="sm"
        variant="outline"
        onClick={toggleSidebar}
        className="p-2 h-9 w-9"
      >
        <Settings className="w-4 h-4" />
      </Button>

      {/* Status indicator */}
      <div className="px-1">
        {status === 'draft' ? (
          <Lock className="w-4 h-4 text-gray-400" />
        ) : (
          <Globe className="w-4 h-4 text-green-400" />
        )}
      </div>

      {/* Preview button */}
      <Button
        size="sm"
        variant="outline"
        onClick={() => setShowPreview(!showPreview)}
        className="p-2 h-9 w-9"
      >
        {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </Button>

      {/* Save button */}
      <Button
        size="sm"
        variant="outline"
        onClick={handleSave}
        disabled={isSaving}
        className="p-2 h-9 w-9"
      >
        {isSaving ? (
          <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
      </Button>

      {/* Publish button */}
      <Button
        size="sm"
        onClick={handlePublish}
        disabled={isPublishing || !title.trim()}
        className="p-2 h-9 w-9"
      >
        {isPublishing ? (
          <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Globe className="w-4 h-4" />
        )}
      </Button>

      {/* Close button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="p-2 h-9 w-9"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  </div>

  {/* Desktop Header (Above 750px) - Keep your existing desktop header */}
  <div className="hidden min-[750px]:flex items-center justify-between p-4">
    <div className="flex items-center gap-4">
      <Button
        size="sm"
        variant="default"
        onClick={handleBack}
        className="p-2"
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-purple-400" />
        <span className="text-lg font-semibold text-white">
          {blogId ? 'Edit Blog' : 'Write New Blog'}
        </span>
      </div>
    </div>

    <div className="flex items-center gap-3">
      {/* Status indicator */}
      <div className="flex items-center gap-2 text-sm">
        {status === 'draft' ? (
          <Lock className="w-4 h-4 text-gray-400" />
        ) : (
          <Globe className="w-4 h-4 text-green-400" />
        )}
        <span className={status === 'draft' ? 'text-gray-400' : 'text-green-400'}>
          {status === 'draft' ? 'Draft' : 'Published'}
        </span>
      </div>

      {/* Word count and read time */}
      <div className="flex items-center gap-4 text-sm text-gray-400">
        <span>{wordCount} words</span>
        <span>•</span>
        <span>{readTime} min read</span>
      </div>

      {/* Save status */}
      {lastSaved && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <CheckCircle className="w-3 h-3" />
          <span>Saved {lastSaved.toLocaleTimeString()}</span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2"
        >
          {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          Preview
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save
        </Button>

        <Button
          size="sm"
          onClick={handlePublish}
          disabled={isPublishing || !title.trim()}
          className="flex items-center gap-2"
        >
          {isPublishing ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Globe className="w-4 h-4" />
          )}
          {blogId ? 'Update Blog' : 'Publish'}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="p-2"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>
    </div>
  </div>
</header>

      {/* ✅ UPDATED: Error/Success messages - responsive */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center gap-2 p-2 sm:p-3 bg-red-900/20 border border-red-500/20 text-red-400 text-xs sm:text-sm"
          >
            <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              onClick={() => setError(null)}
              className="p-1 hover:bg-red-500/20 rounded flex-shrink-0"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center gap-2 p-2 sm:p-3 bg-green-900/20 border border-green-500/20 text-green-400 text-xs sm:text-sm"
          >
            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="flex-1">{success}</span>
            <button
              onClick={() => setSuccess(null)}
              className="p-1 hover:bg-green-500/20 rounded flex-shrink-0"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ UPDATED: Main editor - responsive layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* ✅ UPDATED: Mobile Sidebar Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-40 md:hidden"
                onClick={handleOverlayClick}
              />

              {/* Sidebar Panel */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed left-0 top-0 h-full w-80 bg-black/95 backdrop-blur-xl border-r border-white/10 z-50 md:hidden overflow-y-auto"
              >
                {/* Mobile sidebar header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <h3 className="text-lg font-semibold text-white">Blog Settings</h3>
                  <Button size="sm" variant="default" onClick={() => setSidebarOpen(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Sidebar content */}
                <div className="p-4 space-y-4 sm:space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter your blog title..."
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-black/40 border border-white/10 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 text-xs sm:text-sm"
                    />
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                      Excerpt
                    </label>
                    <textarea
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      placeholder="Brief description of your blog..."
                      rows={3}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-black/40 border border-white/10 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none text-xs sm:text-sm"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                      Category
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400 text-xs sm:text-sm"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Cover Image */}
                  {/* <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                      Cover Image URL
                    </label>
                    <input
                      type="url"
                      value={coverImageUrl}
                      onChange={(e) => setCoverImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-black/40 border border-white/10 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 text-xs sm:text-sm"
                    />
                    {coverImageUrl && (
                      <div className="mt-2">
                        <img
                          src={coverImageUrl}
                          alt="Cover preview"
                          className="w-full h-24 sm:h-32 object-cover rounded-lg border border-white/10"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div> */}

                  {/* Statistics */}
                  <div className="space-y-1 sm:space-y-2">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-gray-400">Word Count</span>
                      <span className="text-white">{wordCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-gray-400">Read Time</span>
                      <span className="text-white">{readTime} min</span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-gray-400">Blocks</span>
                      <span className="text-white">{0}</span> {/* This will be updated once TipTap is integrated */}
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ✅ UPDATED: Desktop Sidebar */}
        <div className="hidden md:block w-80 border-r border-white/10 bg-black/20 overflow-y-auto">
          <div className="p-4 space-y-4 sm:space-y-6">
            {/* Title */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your blog title..."
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-black/40 border border-white/10 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 text-xs sm:text-sm"
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                Excerpt
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Brief description of your blog..."
                rows={3}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-black/40 border border-white/10 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none text-xs sm:text-sm"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400 text-xs sm:text-sm"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Cover Image */}
            {/* <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                Cover Image URL
              </label>
              <input
                type="url"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-black/40 border border-white/10 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 text-xs sm:text-sm"
              />
              {coverImageUrl && (
                <div className="mt-2">
                  <img
                    src={coverImageUrl}
                    alt="Cover preview"
                    className="w-full h-24 sm:h-32 object-cover rounded-lg border border-white/10"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div> */}

            {/* Statistics */}
            <div className="space-y-1 sm:space-y-2">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-400">Word Count</span>
                <span className="text-white">{wordCount}</span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-400">Read Time</span>
                <span className="text-white">{readTime} min</span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-400">Blocks</span>
                <span className="text-white">{0}</span> {/* This will be updated once TipTap is integrated */}
              </div>
            </div>
          </div>
        </div>

        {/* ✅ UPDATED: Editor content - mobile-first */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* ✅ UPDATED: Toolbar */}
          {/* <EditorToolbar onAddBlock={addBlock} /> */}

          {/* ✅ UPDATED: Content area */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 relative">
            {/* AI Assistant Button */}
            {!showPreview && (
              <div className="absolute top-4 right-4 z-10">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAIAssistant(true)}
                  className="bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 hover:text-purple-200 border border-purple-500/30"
                  title="AI Writing Assistant"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Assistant
                </Button>
              </div>
            )}

            {showPreview ? (
              <BlogPreview
                title={title}
                content={content}
                coverImageUrl={coverImageUrl}
                excerpt={excerpt}
              />
            ) : (
              <TipTapEditor
                content={content}
                onChange={setContent}
                placeholder="Type '/' for commands..."
              />
            )}

            {/* AI Assistant */}
            {showAIAssistant && (
              <div
                className="fixed z-50"
                style={{
                  right: '1rem',
                  top: '5rem',
                  maxWidth: 'calc(100vw - 2rem)',
                  minWidth: '320px'
                }}
              >
                <SimpleAIAssistant
                  currentContent={content}
                  cursorPosition={0}
                  onAccept={(aiContent, mode) => {
                    switch (mode) {
                      case 'append':
                        setContent(prev => prev + ' ' + aiContent);
                        break;
                      case 'replace':
                        setContent(aiContent);
                        break;
                      case 'insert':
                        setContent(prev => prev + ' ' + aiContent);
                        break;
                    }
                    setShowAIAssistant(false);
                  }}
                  onClose={() => setShowAIAssistant(false)}
                  isVisible={showAIAssistant}
                  blockType="paragraph"
                  allBlocks={[content]}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Blog Preview Component
interface BlogPreviewProps {
  title: string;
  content: string; // Changed from BlogContent to string
  coverImageUrl?: string;
  excerpt?: string;
}

function BlogPreview({ title, content, coverImageUrl, excerpt }: BlogPreviewProps) {
  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4">
      {/* ✅ UPDATED: Responsive preview header */}
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-xs sm:text-sm">
        📖 Preview Mode - This is how your blog will appear to readers
      </div>

      {/* ✅ UPDATED: Responsive blog content */}
      <article className="prose prose-invert max-w-none">
        {/* ✅ UPDATED: Responsive cover image */}
        {coverImageUrl && (
          <img
            src={coverImageUrl}
            alt=""
            className="w-full h-48 sm:h-64 object-cover rounded-lg mb-4 sm:mb-6"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}

        {/* ✅ UPDATED: Responsive title */}
        {title && (
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">{title}</h1>
        )}

        {/* ✅ UPDATED: Responsive excerpt */}
        {excerpt && (
          <p className="text-gray-400 text-base sm:text-lg mb-4 sm:mb-6 italic">{excerpt}</p>
        )}

        {/* ✅ UPDATED: Responsive content - Render HTML with white text */}
        <div
          className="text-white leading-relaxed text-sm sm:text-base prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </article>

      <style jsx>{`
        .prose h1 {
          font-size: 2.25rem !important;
          line-height: 2.5rem !important;
          font-weight: 700 !important;
          color: white !important;
          margin-top: 2rem !important;
          margin-bottom: 1rem !important;
        }
        .prose h2 {
          font-size: 1.875rem !important;
          line-height: 2.25rem !important;
          font-weight: 600 !important;
          color: white !important;
          margin-top: 1.5rem !important;
          margin-bottom: 0.75rem !important;
        }
        .prose h3 {
          font-size: 1.5rem !important;
          line-height: 2rem !important;
          font-weight: 600 !important;
          color: white !important;
          margin-top: 1.25rem !important;
          margin-bottom: 0.5rem !important;
        }
        .prose p {
          color: #d1d5db !important;
          line-height: 1.75 !important;
          margin-bottom: 1rem !important;
        }
        .prose ul, .prose ol {
          color: #d1d5db !important;
          margin-bottom: 1rem !important;
        }
        .prose li {
          color: #d1d5db !important;
        }
        .prose blockquote {
          color: #d1d5db !important;
          border-left-color: #8b5cf6 !important;
        }
        .prose code {
          color: #10b981 !important;
          background-color: rgba(16, 185, 129, 0.1) !important;
        }
        .prose pre {
          background-color: rgba(17, 24, 39, 0.5) !important;
          border-color: #374151 !important;
        }
        .prose pre code {
          color: #10b981 !important;
          background-color: transparent !important;
        }
      `}</style>
    </div>
  );
}