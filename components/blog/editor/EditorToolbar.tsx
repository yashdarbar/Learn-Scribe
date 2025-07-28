"use client";

import React from "react";
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Image,
  Plus,
  Bold,
  Italic,
  Underline,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditorBlock } from "@/types/blog";

interface EditorToolbarProps {
  onAddBlock: (type: EditorBlock['type']) => void;
  selectedBlock?: EditorBlock;
  onFormatChange?: (format: string, value?: any) => void;
}

const blockTypes = [
  { type: 'paragraph' as const, icon: Type, label: 'Paragraph' },
  { type: 'heading' as const, icon: Heading1, label: 'Heading 1' },
  { type: 'heading' as const, icon: Heading2, label: 'Heading 2' },
  { type: 'heading' as const, icon: Heading3, label: 'Heading 3' },
  { type: 'list' as const, icon: List, label: 'Bullet List' },
  { type: 'list' as const, icon: ListOrdered, label: 'Numbered List' },
  { type: 'quote' as const, icon: Quote, label: 'Quote' },
  { type: 'code' as const, icon: Code, label: 'Code Block' },
  { type: 'image' as const, icon: Image, label: 'Image' },
];

const textFormats = [
  { format: 'bold', icon: Bold, label: 'Bold' },
  { format: 'italic', icon: Italic, label: 'Italic' },
  { format: 'underline', icon: Underline, label: 'Underline' },
  { format: 'link', icon: Link, label: 'Link' },
];

const alignments = [
  { value: 'left', icon: AlignLeft, label: 'Align Left' },
  { value: 'center', icon: AlignCenter, label: 'Align Center' },
  { value: 'right', icon: AlignRight, label: 'Align Right' },
];

export default function EditorToolbar({ onAddBlock, selectedBlock, onFormatChange }: EditorToolbarProps) {
  const handleAddBlock = (type: EditorBlock['type']) => {
    onAddBlock(type);
  };

  const handleFormat = (format: string, value?: any) => {
    onFormatChange?.(format, value);
  };

  const isFormatActive = (format: string) => {
    return selectedBlock?.attributes?.[format] === true;
  };

  const getAlignment = () => {
    return selectedBlock?.attributes?.align || 'left';
  };

  return (
    <div className="border-b border-white/10 bg-black/30 p-3">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Block type selector */}
        <div className="flex items-center gap-1 border-r border-white/10 pr-3">
          <span className="text-xs text-gray-400 mr-2">Blocks:</span>
          {blockTypes.map((blockType, index) => {
            const Icon = blockType.icon;
            return (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={() => handleAddBlock(blockType.type)}
                className="h-8 px-2 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                title={blockType.label}
              >
                <Icon className="w-4 h-4" />
              </Button>
            );
          })}
        </div>

        {/* Text formatting */}
        {selectedBlock && selectedBlock.type === 'paragraph' && (
          <div className="flex items-center gap-1 border-r border-white/10 pr-3">
            <span className="text-xs text-gray-400 mr-2">Format:</span>
            {textFormats.map((format) => {
              const Icon = format.icon;
              return (
                <Button
                  key={format.format}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFormat(format.format)}
                  className={`h-8 px-2 transition-colors ${
                    isFormatActive(format.format)
                      ? 'text-purple-400 bg-purple-500/20 border border-purple-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                  title={format.label}
                >
                  <Icon className="w-4 h-4" />
                </Button>
              );
            })}
          </div>
        )}

        {/* Alignment */}
        {selectedBlock && ['paragraph', 'heading'].includes(selectedBlock.type) && (
          <div className="flex items-center gap-1 border-r border-white/10 pr-3">
            <span className="text-xs text-gray-400 mr-2">Align:</span>
            {alignments.map((alignment) => {
              const Icon = alignment.icon;
              return (
                <Button
                  key={alignment.value}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFormat('align', alignment.value)}
                  className={`h-8 px-2 transition-colors ${
                    getAlignment() === alignment.value
                      ? 'text-purple-400 bg-purple-500/20 border border-purple-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                  title={alignment.label}
                >
                  <Icon className="w-4 h-4" />
                </Button>
              );
            })}
          </div>
        )}

        {/* Quick add button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleAddBlock('paragraph')}
          className="h-8 px-3 text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 transition-colors border border-purple-500/30 hover:border-purple-500/50"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Block
        </Button>
      </div>
    </div>
  );
}