"use client";

import React from "react";

interface BlogContentProps {
  content: string; // Changed from BlogContentType to string for HTML content
}

export default function BlogContent({ content }: BlogContentProps) {
  return (
    <>
      <div
        className="prose prose-invert max-w-none text-white"
        dangerouslySetInnerHTML={{ __html: content }}
      />
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
    </>
  );
}