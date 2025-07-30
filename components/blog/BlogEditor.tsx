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
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createBlog, updateBlog, publishBlog, getAllCategories, getBlogById } from "@/lib/actions/blog-actions";
import { BlogCategory, CreateBlogData, UpdateBlogData } from "@/types/blog";
import EditorToolbar from "./editor/EditorToolbar";
import EditorBlock from "./editor/EditorBlock";
import { BlogContent, EditorBlock as EditorBlockType } from "@/types/blog";

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
  const [content, setContent] = useState<BlogContent>({
    blocks: [
      {
        id: `block-${Date.now()}-initial`,
        type: "paragraph",
        content: "",
        attributes: {}
      }
    ],
    version: "1.0"
  });
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
          setTitle(blog.title);
          setExcerpt(blog.excerpt || "");
          setContent(blog.content);
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

  // Calculate word count and read time
  useEffect(() => {
    let totalWords = 0;
    content.blocks.forEach(block => {
      if (block.content) {
        totalWords += block.content.trim().split(/\s+/).length;
      }
    });

    setWordCount(totalWords);
    setReadTime(Math.max(1, Math.ceil(totalWords / 200))); // 200 words per minute
  }, [content]);

  // Debug useEffect to track content changes
  useEffect(() => {
    console.log('Content blocks updated:', content.blocks.length);
    console.log('Block IDs:', content.blocks.map(block => block.id));
  }, [content.blocks]);

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!title.trim() || isSaving) return;

    setIsSaving(true);
    setError(null);

    try {
      const blogData: CreateBlogData = {
        title: title.trim(),
        content,
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
        content,
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
        content,
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
  const addBlock = (type: EditorBlockType['type'], afterId?: string) => {
    const newBlock: EditorBlockType = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // More unique ID
      type,
      content: "",
      attributes: {}
    };

    console.log('Adding new block with ID:', newBlock.id);

    setContent(prev => {
      const newBlocks = [...prev.blocks];
      if (afterId) {
        const index = newBlocks.findIndex(block => block.id === afterId);
        newBlocks.splice(index + 1, 0, newBlock);
      } else {
        newBlocks.push(newBlock);
      }
      return { ...prev, blocks: newBlocks };
    });
  };

  // Update block
  const updateBlock = (id: string, updates: Partial<EditorBlockType>) => {
    setContent(prev => ({
      ...prev,
      blocks: prev.blocks.map(block =>
        block.id === id ? { ...block, ...updates } : block
      )
    }));
  };

  // Delete block
  const deleteBlock = (id: string) => {
    console.log('deleteBlock called with ID:', id);
    console.log('Current blocks before deletion:', content.blocks);
    console.log('Blocks length:', content.blocks.length);

    if (content.blocks.length === 1) {
      console.log('Cannot delete last block');
      return;
    }

    setContent(prev => {
      const newBlocks = prev.blocks.filter(block => block.id !== id);
      console.log('New blocks after deletion:', newBlocks);
      return {
        ...prev,
        blocks: newBlocks
      };
    });
  };

  // Move block
  const moveBlock = (id: string, direction: 'up' | 'down') => {
    setContent(prev => {
      const newBlocks = [...prev.blocks];
      const index = newBlocks.findIndex(block => block.id === id);

      if (direction === 'up' && index > 0) {
        [newBlocks[index], newBlocks[index - 1]] = [newBlocks[index - 1], newBlocks[index]];
      } else if (direction === 'down' && index < newBlocks.length - 1) {
        [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
      }

      return { ...prev, blocks: newBlocks };
    });
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
                  <Button size="sm" variant="ghost" onClick={() => setSidebarOpen(false)}>
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
                      <span className="text-white">{content.blocks.length}</span>
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
                <span className="text-white">{content.blocks.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ UPDATED: Editor content - mobile-first */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* ✅ UPDATED: Toolbar */}
          <EditorToolbar onAddBlock={addBlock} />

          {/* ✅ UPDATED: Content area */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
            {showPreview ? (
              <BlogPreview
                title={title}
                content={content}
                coverImageUrl={coverImageUrl}
                excerpt={excerpt}
              />
            ) : (
              <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
                {content.blocks.map((block, index) => (
                  <EditorBlock
                    key={block.id}
                    block={block}
                    onUpdate={(updates) => updateBlock(block.id, updates)}
                    onDelete={() => {
                      console.log('Delete called for block:', block.id, 'at index:', index);
                      deleteBlock(block.id);
                    }}
                    onMove={(direction) => moveBlock(block.id, direction)}
                    onAddAfter={(type) => addBlock(type, block.id)}
                    isFirst={index === 0}
                    isLast={index === content.blocks.length - 1}
                    allBlocks={content.blocks}
                  />
                ))}

                {/* ✅ UPDATED: Add new block button */}
                <button
                  onClick={() => addBlock('paragraph')}
                  className="w-full p-3 sm:p-4 border-2 border-dashed border-white/20 rounded-lg text-gray-400 hover:text-white hover:border-white/40 transition-colors text-sm sm:text-base"
                >
                  + Add new block
                </button>
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
  content: BlogContent;
  coverImageUrl?: string;
  excerpt?: string;
}

function BlogPreview({ title, content, coverImageUrl, excerpt }: BlogPreviewProps) {
  const renderBlock = (block: EditorBlockType) => {
    const alignment = block.attributes?.align || 'left';
    const textAlign = alignment === 'center' ? 'text-center' : alignment === 'right' ? 'text-right' : 'text-left';

    switch (block.type) {
      case 'paragraph':
        return (
          <p className={`text-white leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base ${textAlign}`}>
            {block.content}
          </p>
        );

      case 'heading':
        const level = block.attributes?.level || 1;
        const fontSize = level === 1 ? 'text-2xl sm:text-3xl' : level === 2 ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl';

        if (level === 1) {
          return (
            <h1 className={`font-bold text-white mb-3 sm:mb-4 ${fontSize} ${textAlign}`}>
              {block.content}
            </h1>
          );
        } else if (level === 2) {
          return (
            <h2 className={`font-bold text-white mb-3 sm:mb-4 ${fontSize} ${textAlign}`}>
              {block.content}
            </h2>
          );
        } else {
          return (
            <h3 className={`font-bold text-white mb-3 sm:mb-4 ${fontSize} ${textAlign}`}>
              {block.content}
            </h3>
          );
        }

      case 'list':
        return (
          <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="mt-2 w-2 h-2 rounded-full bg-purple-400 flex-shrink-0" />
            <p className="text-white leading-relaxed text-sm sm:text-base">{block.content}</p>
          </div>
        );

      case 'quote':
        return (
          <blockquote className="border-l-4 border-purple-400 pl-3 sm:pl-4 mb-3 sm:mb-4 italic text-white text-sm sm:text-base">
            {block.content}
          </blockquote>
        );

      case 'code':
        return (
          <pre className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 overflow-x-auto">
            <code className="text-green-400 font-mono text-xs sm:text-sm">{block.content}</code>
          </pre>
        );

      case 'image':
        return (
          <div className="mb-3 sm:mb-4">
            <img
              src={block.content}
              alt="Blog image"
              className="w-full max-h-48 sm:max-h-64 object-cover rounded-lg border border-white/10"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        );

      default:
        return null;
    }
  };

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

        {/* ✅ UPDATED: Responsive content blocks */}
        <div className="space-y-3 sm:space-y-4">
          {content.blocks.map((block) => (
            <div key={block.id}>
              {renderBlock(block)}
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}