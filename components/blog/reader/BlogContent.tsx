"use client";

import React from "react";
import { BlogContent as BlogContentType, EditorBlock } from "@/types/blog";

interface BlogContentProps {
  content: BlogContentType;
}

export default function BlogContent({ content }: BlogContentProps) {
  const renderBlock = (block: EditorBlock, index: number) => {
    const key = `${block.id}-${index}`;

    switch (block.type) {
      case 'paragraph':
        return (
          <p key={key} className="text-gray-300 leading-relaxed mb-6">
            {block.content}
          </p>
        );

      case 'heading':
        const level = block.attributes?.level || 1;
        const HeadingTag = `h${level}` as keyof React.JSX.IntrinsicElements;
        const headingClasses = {
          1: 'text-3xl font-bold text-white mb-6 mt-8',
          2: 'text-2xl font-semibold text-white mb-4 mt-6',
          3: 'text-xl font-medium text-white mb-3 mt-5'
        };

        return (
          <HeadingTag key={key} className={headingClasses[level as keyof typeof headingClasses]}>
            {block.content}
          </HeadingTag>
        );

      case 'list':
        const isOrdered = block.attributes?.ordered === true;
        const ListTag = isOrdered ? 'ol' : 'ul';
        const listClasses = isOrdered
          ? 'list-decimal list-inside space-y-2 mb-6'
          : 'list-disc list-inside space-y-2 mb-6';

        return (
          <ListTag key={key} className={`${listClasses} text-gray-300`}>
            <li>{block.content}</li>
          </ListTag>
        );

      case 'quote':
        return (
          <blockquote key={key} className="border-l-4 border-purple-400 pl-6 py-4 mb-6 bg-purple-500/10 rounded-r-lg">
            <p className="text-gray-300 italic text-lg leading-relaxed">
              "{block.content}"
            </p>
          </blockquote>
        );

      case 'code':
        return (
          <pre key={key} className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 mb-6 overflow-x-auto">
            <code className="text-green-400 font-mono text-sm">
              {block.content}
            </code>
          </pre>
        );

      case 'image':
        return (
          <figure key={key} className="mb-6">
            <img
              src={block.content}
              alt="Blog image"
              className="w-full h-auto rounded-lg border border-white/10"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            {block.attributes?.caption && (
              <figcaption className="text-center text-sm text-gray-400 mt-2">
                {block.attributes.caption}
              </figcaption>
            )}
          </figure>
        );

      default:
        return (
          <p key={key} className="text-gray-300 leading-relaxed mb-6">
            {block.content}
          </p>
        );
    }
  };

  // Group consecutive list items
  const renderBlocks = () => {
    const renderedBlocks: React.ReactNode[] = [];
    let currentList: EditorBlock[] = [];
    let currentListType: 'ordered' | 'unordered' | null = null;

    content.blocks.forEach((block, index) => {
      if (block.type === 'list') {
        const isOrdered = block.attributes?.ordered === true;
        const listType = isOrdered ? 'ordered' : 'unordered';

        if (currentListType === listType) {
          // Continue current list
          currentList.push(block);
        } else {
          // Render previous list if exists
          if (currentList.length > 0) {
            renderedBlocks.push(renderListGroup(currentList, renderedBlocks.length));
          }
          // Start new list
          currentList = [block];
          currentListType = listType;
        }
      } else {
        // Render previous list if exists
        if (currentList.length > 0) {
          renderedBlocks.push(renderListGroup(currentList, renderedBlocks.length));
          currentList = [];
          currentListType = null;
        }
        // Render current block
        renderedBlocks.push(renderBlock(block, index));
      }
    });

    // Render any remaining list
    if (currentList.length > 0) {
      renderedBlocks.push(renderListGroup(currentList, renderedBlocks.length));
    }

    return renderedBlocks;
  };

  const renderListGroup = (listBlocks: EditorBlock[], keyIndex: number) => {
    const isOrdered = listBlocks[0].attributes?.ordered === true;
    const ListTag = isOrdered ? 'ol' : 'ul';
    const listClasses = isOrdered
      ? 'list-decimal list-inside space-y-2 mb-6'
      : 'list-disc list-inside space-y-2 mb-6';

    return (
      <ListTag key={`list-${keyIndex}`} className={`${listClasses} text-gray-300`}>
        {listBlocks.map((block, index) => (
          <li key={`${block.id}-${index}`}>
            {block.content}
          </li>
        ))}
      </ListTag>
    );
  };

  return (
    <div className="space-y-6">
      {renderBlocks()}
    </div>
  );
}