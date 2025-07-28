"use client";

import React from "react";
import { Heart, Share2, MessageCircle, Bookmark, User, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { BlogWithDetails } from "@/types/blog";
import { useState } from "react";

interface BlogEngagementProps {
  blog: BlogWithDetails;
  isLiked: boolean;
  likeCount: number;
  onLike: () => void;
  onShare: (platform: string) => void;
}

export default function BlogEngagement({
  blog,
  isLiked,
  likeCount,
  onLike,
  onShare
}: BlogEngagementProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const title = blog.title;
    const text = blog.excerpt || `Check out this blog post: ${blog.title}`;

    switch (platform) {
      case 'twitter':
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        window.open(twitterUrl, '_blank');
        break;

      case 'facebook':
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        window.open(facebookUrl, '_blank');
        break;

      case 'linkedin':
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        window.open(linkedinUrl, '_blank');
        break;

      case 'copy':
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error('Failed to copy link:', err);
        }
        break;

      default:
        // Fallback to copy
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error('Failed to copy link:', err);
        }
    }
  };

  return (
    <div className="space-y-8">
      {/* Engagement actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={onLike}
            className={`flex items-center gap-2 ${
              isLiked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likeCount} likes</span>
          </Button>

          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => handleShare('copy')}
              className="flex items-center gap-2 text-gray-400 hover:text-white"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => handleShare('twitter')}
              className="flex items-center gap-2 text-gray-400 hover:text-blue-400"
              title="Share on Twitter"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </Button>

            <Button
              variant="ghost"
              onClick={() => handleShare('facebook')}
              className="flex items-center gap-2 text-gray-400 hover:text-blue-600"
              title="Share on Facebook"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </Button>

            <Button
              variant="ghost"
              onClick={() => handleShare('linkedin')}
              className="flex items-center gap-2 text-gray-400 hover:text-blue-700"
              title="Share on LinkedIn"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </Button>
          </div>

          <Button
            variant="ghost"
            className="flex items-center gap-2 text-gray-400 hover:text-white"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Comment</span>
          </Button>

          <Button
            variant="ghost"
            className="flex items-center gap-2 text-gray-400 hover:text-white"
          >
            <Bookmark className="w-5 h-5" />
            <span>Save</span>
          </Button>
        </div>
      </div>

      {/* Author section */}
      <div className="bg-black/20 border border-white/10 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <Avatar className="w-12 h-12">
            <span className="text-lg font-semibold text-white">
              {blog.author.user_metadata?.first_name?.[0] || blog.author.email?.[0] || 'U'}
            </span>
          </Avatar>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">
              {blog.author.user_metadata?.first_name || blog.author.email}
            </h3>
            <p className="text-gray-400 text-sm mb-3">
              Author of this blog post
            </p>
            <Button variant="outline" size="sm">
              <User className="w-4 h-4 mr-2" />
              View Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Related posts placeholder */}
      <div className="bg-black/20 border border-white/10 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Related Posts</h3>
        <p className="text-gray-400 text-sm">
          Related posts feature will be implemented soon.
        </p>
      </div>

      {/* Comments placeholder */}
      <div className="bg-black/20 border border-white/10 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Comments</h3>
        <p className="text-gray-400 text-sm">
          Comments feature will be implemented soon.
        </p>
      </div>
    </div>
  );
}