"use client";

import { useState, useEffect } from "react";
import { getBlogById } from "@/lib/actions/blog-actions";

export default function TestDBPage() {
  const [blogData, setBlogData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testBlogId = "your-blog-id-here"; // Replace with actual blog ID

  const loadBlog = async () => {
    if (!testBlogId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getBlogById(testBlogId);

      if (result.success && result.data) {
        setBlogData(result.data);
        console.log('🔍 Test page - Blog data:', result.data);
        console.log('📄 Content type:', typeof result.data.content);
        console.log('📄 Content:', result.data.content);
      } else {
        setError(result.error || 'Failed to load blog');
      }
    } catch (error) {
      console.error('Error loading blog:', error);
      setError('Failed to load blog');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Database Test Page</h1>

      <button
        onClick={loadBlog}
        disabled={loading}
        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Load Test Blog'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-900/20 border border-red-500/20 text-red-400 rounded">
          {error}
        </div>
      )}

      {blogData && (
        <div className="mt-4 p-4 bg-gray-900/20 border border-gray-500/20 rounded">
          <h2 className="text-lg font-semibold mb-2">Blog Data:</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(blogData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}