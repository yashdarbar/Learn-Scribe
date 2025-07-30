"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  GripVertical,
  Image as ImageIcon,
  Link as LinkIcon,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditorBlock as EditorBlockType } from "@/types/blog";
import SimpleAIAssistant from "./SimpleAIAssistant";

interface EditorBlockProps {
  block: EditorBlockType;
  onUpdate: (updates: Partial<EditorBlockType>) => void;
  onDelete: () => void;
  onMove: (direction: 'up' | 'down') => void;
  onAddAfter: (type: EditorBlockType['type']) => void;
  isFirst: boolean;
  isLast: boolean;
  allBlocks?: EditorBlockType[];
}

export default function EditorBlock({
  block,
  onUpdate,
  onDelete,
  onMove,
  onAddAfter,
  isFirst,
  isLast,
  allBlocks = []
}: EditorBlockProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [block.content]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ content: e.target.value });
    // Track cursor position
    setCursorPosition(e.target.selectionStart || 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onAddAfter('paragraph');
    }
    // Track cursor position on key events
    if (e.currentTarget instanceof HTMLTextAreaElement) {
      setCursorPosition(e.currentTarget.selectionStart || 0);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(true);
    setCursorPosition(e.target.selectionStart || 0);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    setCursorPosition(e.currentTarget.selectionStart || 0);
  };

  const handleDelete = () => {
    console.log('EditorBlock handleDelete called for block:', block.id);
    onDelete();
  };

  const handleAIAccept = (content: string, mode: 'append' | 'replace' | 'insert') => {
    let newContent = block.content;

    switch (mode) {
      case 'append':
        // Add space if content doesn't end with space and isn't empty
        const needsSpace = block.content.length > 0 && !block.content.endsWith(' ') && !block.content.endsWith('\n');
        newContent = block.content + (needsSpace ? ' ' : '') + content;
        break;
      case 'replace':
        newContent = content;
        break;
      case 'insert':
        // Insert at cursor position
        const before = block.content.substring(0, cursorPosition);
        const after = block.content.substring(cursorPosition);
        newContent = before + content + after;
        break;
    }

    onUpdate({ content: newContent });
    setShowAIAssistant(false);
  };

  const getBlockStyles = () => {
    const baseStyles = "w-full p-2 sm:p-3 rounded-lg border transition-all duration-200";
    const focusStyles = isFocused
      ? "border-purple-500/50 bg-purple-500/10"
      : "border-white/10 bg-black/20 hover:border-white/20";

    return `${baseStyles} ${focusStyles}`;
  };

  const getTextStyles = () => {
    const alignment = block.attributes?.align || 'left';
    const textAlign = alignment === 'center' ? 'text-center' : alignment === 'right' ? 'text-right' : 'text-left';

    let fontSize = 'text-sm sm:text-base';
    if (block.type === 'heading') {
      const level = block.attributes?.level || 1;
      fontSize = level === 1 ? 'text-2xl sm:text-3xl' : level === 2 ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl';
    }

    return `${fontSize} ${textAlign} font-medium text-white leading-relaxed`;
  };

  const renderBlockContent = () => {
    switch (block.type) {
      case 'paragraph':
        return (
          <textarea
            ref={textareaRef}
            value={block.content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onClick={handleClick}
            placeholder="Start writing..."
            className={`${getTextStyles()} bg-transparent border-none outline-none resize-none w-full min-h-[2rem]`}
            style={{ minHeight: '2rem' }}
          />
        );

      case 'heading':
        return (
          <textarea
            ref={textareaRef}
            value={block.content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onClick={handleClick}
            placeholder="Heading..."
            className={`${getTextStyles()} bg-transparent border-none outline-none resize-none w-full min-h-[2rem]`}
            style={{ minHeight: '2rem' }}
          />
        );

      case 'list':
        return (
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="mt-2 w-2 h-2 rounded-full bg-purple-400 flex-shrink-0" />
            <textarea
              ref={textareaRef}
              value={block.content}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onClick={handleClick}
              placeholder="List item..."
              className="bg-transparent border-none outline-none resize-none w-full text-white leading-relaxed text-sm sm:text-base"
              style={{ minHeight: '2rem' }}
            />
          </div>
        );

      case 'quote':
        return (
          <div className="border-l-4 border-purple-400 pl-3 sm:pl-4">
            <textarea
              ref={textareaRef}
              value={block.content}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onClick={handleClick}
              placeholder="Quote..."
              className="bg-transparent border-none outline-none resize-none w-full text-white italic leading-relaxed text-sm sm:text-base"
              style={{ minHeight: '2rem' }}
            />
          </div>
        );

      case 'code':
        return (
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 sm:p-4">
            <textarea
              ref={textareaRef}
              value={block.content}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onClick={handleClick}
              placeholder="Code..."
              className="bg-transparent border-none outline-none resize-none w-full text-green-400 font-mono text-xs sm:text-sm leading-relaxed"
              style={{ minHeight: '2rem' }}
            />
          </div>
        );

      case 'image':
        return (
          <div className="space-y-2">
            <input
              type="url"
              value={block.content}
              onChange={(e) => onUpdate({ content: e.target.value })}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Image URL..."
              className="w-full bg-transparent border-none outline-none text-white placeholder:text-gray-400 text-sm sm:text-base"
            />
            {block.content && (
              <img
                src={block.content}
                alt="Block image"
                className="w-full max-h-48 sm:max-h-64 object-cover rounded-lg border border-white/10"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Get all block contents for context
  const allBlockContents = allBlocks.map(b => b.content).filter(content => content.trim());

  return (
    <div className="group relative">
      {/* ✅ Desktop block menu (left side) - hover visible with background */}
      <div className="absolute -left-10 sm:-left-12 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 hidden xl:flex bg-black/80 backdrop-blur-sm rounded-lg p-1 border border-white/10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMove('up')}
          disabled={isFirst}
          className="h-6 w-6 p-0 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ChevronUp className="w-3 h-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMove('down')}
          disabled={isLast}
          className="h-6 w-6 p-0 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ChevronDown className="w-3 h-3" />
        </Button>
      </div>

      {/* ✅ UPDATED: Responsive Action Buttons */}
      {/* Desktop: Show on hover only, positioned top-right */}
      <div className="absolute top-2 right-2 hidden lg:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 bg-black/80 backdrop-blur-sm rounded-lg p-1.5 border border-white/10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMove('up')}
          disabled={isFirst}
          className="h-7 w-7 p-0 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          title="Move up"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMove('down')}
          disabled={isLast}
          className="h-7 w-7 p-0 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          title="Move down"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAIAssistant(!showAIAssistant)}
          className="h-7 w-7 p-0 text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-200"
          title="AI Assistant"
        >
          <Sparkles className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 transition-all duration-200"
          title="Delete block"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* ✅ NEW: Mobile Action Buttons - Always visible, positioned at bottom */}
      <div className="lg:hidden">
        {/* Mobile buttons shown below the block */}
        <div className="flex items-center justify-center gap-2 mt-2 p-2 bg-black/60 backdrop-blur-sm rounded-lg border border-white/10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMove('up')}
            disabled={isFirst}
            className={`h-8 w-8 p-0 transition-colors ${
              isFirst
                ? 'text-gray-600 cursor-not-allowed'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
            title="Move up"
          >
            <ChevronUp className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMove('down')}
            disabled={isLast}
            className={`h-8 w-8 p-0 transition-colors ${
              isLast
                ? 'text-gray-600 cursor-not-allowed'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
            title="Move down"
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAIAssistant(!showAIAssistant)}
            className={`h-8 w-8 p-0 transition-all duration-200 ${
              showAIAssistant
                ? 'text-purple-300 bg-purple-500/30 border border-purple-500/50'
                : 'text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40'
            }`}
            title="AI Assistant"
          >
            <Sparkles className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 transition-all duration-200"
            title="Delete block"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* ✅ UPDATED: Block content with responsive spacing */}
      <div className={`${getBlockStyles()} ${showAIAssistant ? 'mb-2' : ''}`}>
        <div className="flex items-start gap-2">
          {/* ✅ Grip handle - hidden on mobile and smaller tablets */}
          <div className="flex-shrink-0 mt-2 hidden xl:block">
            <GripVertical className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
          </div>
          <div className="flex-1">
            {renderBlockContent()}
          </div>
        </div>
      </div>

      {/* Enhanced AI Assistant */}
      <SimpleAIAssistant
        currentContent={block.content}
        cursorPosition={cursorPosition}
        onAccept={handleAIAccept}
        onClose={() => setShowAIAssistant(false)}
        isVisible={showAIAssistant}
        blockType={block.type}
        allBlocks={allBlockContents}
      />

      {/* ✅ UPDATED: Responsive link input modal */}
      {showLinkInput && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-black/90 border border-white/10 rounded-lg p-3 sm:p-4 w-full max-w-sm sm:w-96">
            <h3 className="text-white font-medium mb-3 text-sm sm:text-base">Add Link</h3>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-black/40 border border-white/10 rounded text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
              autoFocus
            />
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                onClick={() => {
                  if (linkUrl) {
                    onUpdate({
                      content: block.content,
                      attributes: { ...block.attributes, link: linkUrl }
                    });
                  }
                  setShowLinkInput(false);
                  setLinkUrl("");
                }}
                className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
              >
                Add Link
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowLinkInput(false);
                  setLinkUrl("");
                }}
                className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// "use client";

// import React, { useState, useRef, useEffect } from "react";
// import {
//   ChevronUp,
//   ChevronDown,
//   Trash2,
//   GripVertical,
//   Image as ImageIcon,
//   Link as LinkIcon,
//   Sparkles
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { EditorBlock as EditorBlockType } from "@/types/blog";
// import SimpleAIAssistant from "./SimpleAIAssistant";

// interface EditorBlockProps {
//   block: EditorBlockType;
//   onUpdate: (updates: Partial<EditorBlockType>) => void;
//   onDelete: () => void;
//   onMove: (direction: 'up' | 'down') => void;
//   onAddAfter: (type: EditorBlockType['type']) => void;
//   isFirst: boolean;
//   isLast: boolean;
//   allBlocks?: EditorBlockType[];
// }

// export default function EditorBlock({
//   block,
//   onUpdate,
//   onDelete,
//   onMove,
//   onAddAfter,
//   isFirst,
//   isLast,
//   allBlocks = []
// }: EditorBlockProps) {
//   const [isFocused, setIsFocused] = useState(false);
//   const [showMenu, setShowMenu] = useState(false);
//   const textareaRef = useRef<HTMLTextAreaElement>(null);
//   const [linkUrl, setLinkUrl] = useState("");
//   const [showLinkInput, setShowLinkInput] = useState(false);
//   const [showAIAssistant, setShowAIAssistant] = useState(false);
//   const [cursorPosition, setCursorPosition] = useState(0);

//   // Auto-resize textarea
//   useEffect(() => {
//     if (textareaRef.current) {
//       textareaRef.current.style.height = 'auto';
//       textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
//     }
//   }, [block.content]);

//   const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     onUpdate({ content: e.target.value });
//     // Track cursor position
//     setCursorPosition(e.target.selectionStart || 0);
//   };

//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       onAddAfter('paragraph');
//     }
//     // Track cursor position on key events
//     if (e.currentTarget instanceof HTMLTextAreaElement) {
//       setCursorPosition(e.currentTarget.selectionStart || 0);
//     }
//   };

//   const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
//     setIsFocused(true);
//     setCursorPosition(e.target.selectionStart || 0);
//   };

//   const handleBlur = () => {
//     setIsFocused(false);
//   };

//   const handleClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
//     setCursorPosition(e.currentTarget.selectionStart || 0);
//   };

//   const handleDelete = () => {
//     console.log('EditorBlock handleDelete called for block:', block.id);
//     onDelete();
//   };

//   const handleAIAccept = (content: string, mode: 'append' | 'replace' | 'insert') => {
//     let newContent = block.content;

//     switch (mode) {
//       case 'append':
//         // Add space if content doesn't end with space and isn't empty
//         const needsSpace = block.content.length > 0 && !block.content.endsWith(' ') && !block.content.endsWith('\n');
//         newContent = block.content + (needsSpace ? ' ' : '') + content;
//         break;
//       case 'replace':
//         newContent = content;
//         break;
//       case 'insert':
//         // Insert at cursor position
//         const before = block.content.substring(0, cursorPosition);
//         const after = block.content.substring(cursorPosition);
//         newContent = before + content + after;
//         break;
//     }

//     onUpdate({ content: newContent });
//     setShowAIAssistant(false);
//   };

//   const getBlockStyles = () => {
//     const baseStyles = "w-full p-2 sm:p-3 rounded-lg border transition-all duration-200";
//     const focusStyles = isFocused
//       ? "border-purple-500/50 bg-purple-500/10"
//       : "border-white/10 bg-black/20 hover:border-white/20";

//     return `${baseStyles} ${focusStyles}`;
//   };

//   const getTextStyles = () => {
//     const alignment = block.attributes?.align || 'left';
//     const textAlign = alignment === 'center' ? 'text-center' : alignment === 'right' ? 'text-right' : 'text-left';

//     let fontSize = 'text-sm sm:text-base';
//     if (block.type === 'heading') {
//       const level = block.attributes?.level || 1;
//       fontSize = level === 1 ? 'text-2xl sm:text-3xl' : level === 2 ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl';
//     }

//     return `${fontSize} ${textAlign} font-medium text-white leading-relaxed`;
//   };

//   const renderBlockContent = () => {
//     switch (block.type) {
//       case 'paragraph':
//         return (
//           <textarea
//             ref={textareaRef}
//             value={block.content}
//             onChange={handleContentChange}
//             onKeyDown={handleKeyDown}
//             onFocus={handleFocus}
//             onBlur={handleBlur}
//             onClick={handleClick}
//             placeholder="Start writing..."
//             className={`${getTextStyles()} bg-transparent border-none outline-none resize-none w-full min-h-[2rem]`}
//             style={{ minHeight: '2rem' }}
//           />
//         );

//       case 'heading':
//         return (
//           <textarea
//             ref={textareaRef}
//             value={block.content}
//             onChange={handleContentChange}
//             onKeyDown={handleKeyDown}
//             onFocus={handleFocus}
//             onBlur={handleBlur}
//             onClick={handleClick}
//             placeholder="Heading..."
//             className={`${getTextStyles()} bg-transparent border-none outline-none resize-none w-full min-h-[2rem]`}
//             style={{ minHeight: '2rem' }}
//           />
//         );

//       case 'list':
//         return (
//           <div className="flex items-start gap-2 sm:gap-3">
//             <div className="mt-2 w-2 h-2 rounded-full bg-purple-400 flex-shrink-0" />
//             <textarea
//               ref={textareaRef}
//               value={block.content}
//               onChange={handleContentChange}
//               onKeyDown={handleKeyDown}
//               onFocus={handleFocus}
//               onBlur={handleBlur}
//               onClick={handleClick}
//               placeholder="List item..."
//               className="bg-transparent border-none outline-none resize-none w-full text-white leading-relaxed text-sm sm:text-base"
//               style={{ minHeight: '2rem' }}
//             />
//           </div>
//         );

//       case 'quote':
//         return (
//           <div className="border-l-4 border-purple-400 pl-3 sm:pl-4">
//             <textarea
//               ref={textareaRef}
//               value={block.content}
//               onChange={handleContentChange}
//               onKeyDown={handleKeyDown}
//               onFocus={handleFocus}
//               onBlur={handleBlur}
//               onClick={handleClick}
//               placeholder="Quote..."
//               className="bg-transparent border-none outline-none resize-none w-full text-white italic leading-relaxed text-sm sm:text-base"
//               style={{ minHeight: '2rem' }}
//             />
//           </div>
//         );

//       case 'code':
//         return (
//           <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 sm:p-4">
//             <textarea
//               ref={textareaRef}
//               value={block.content}
//               onChange={handleContentChange}
//               onKeyDown={handleKeyDown}
//               onFocus={handleFocus}
//               onBlur={handleBlur}
//               onClick={handleClick}
//               placeholder="Code..."
//               className="bg-transparent border-none outline-none resize-none w-full text-green-400 font-mono text-xs sm:text-sm leading-relaxed"
//               style={{ minHeight: '2rem' }}
//             />
//           </div>
//         );

//       case 'image':
//         return (
//           <div className="space-y-2">
//             <input
//               type="url"
//               value={block.content}
//               onChange={(e) => onUpdate({ content: e.target.value })}
//               onFocus={() => setIsFocused(true)}
//               onBlur={() => setIsFocused(false)}
//               placeholder="Image URL..."
//               className="w-full bg-transparent border-none outline-none text-white placeholder:text-gray-400 text-sm sm:text-base"
//             />
//             {block.content && (
//               <img
//                 src={block.content}
//                 alt="Block image"
//                 className="w-full max-h-48 sm:max-h-64 object-cover rounded-lg border border-white/10"
//                 onError={(e) => {
//                   e.currentTarget.style.display = 'none';
//                 }}
//               />
//             )}
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   // Get all block contents for context
//   const allBlockContents = allBlocks.map(b => b.content).filter(content => content.trim());

//   return (
//     <div className="group relative">
//       {/* ✅ UPDATED: Desktop block menu (left side) - hover visible with background */}
//       <div className="absolute -left-10 sm:-left-12 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 hidden lg:flex bg-black/80 backdrop-blur-sm rounded-lg p-1 border border-white/10">
//         <Button
//           variant="ghost"
//           size="sm"
//           onClick={() => onMove('up')}
//           disabled={isFirst}
//           className="h-6 w-6 p-0 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
//         >
//           <ChevronUp className="w-3 h-3" />
//         </Button>
//         <Button
//           variant="ghost"
//           size="sm"
//           onClick={() => onMove('down')}
//           disabled={isLast}
//           className="h-6 w-6 p-0 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
//         >
//           <ChevronDown className="w-3 h-3" />
//         </Button>
//       </div>

//       {/* ✅ UPDATED: All layouts - Single row with all four buttons */}
//       <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 bg-black/80 backdrop-blur-sm rounded-lg p-2 border border-white/10">
//         <Button
//           variant="ghost"
//           size="sm"
//           onClick={() => onMove('up')}
//           disabled={isFirst}
//           className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
//           title="Move up"
//         >
//           <ChevronUp className="w-4 h-4" />
//         </Button>
//         <Button
//           variant="ghost"
//           size="sm"
//           onClick={() => onMove('down')}
//           disabled={isLast}
//           className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
//           title="Move down"
//         >
//           <ChevronDown className="w-4 h-4" />
//         </Button>
//         <Button
//           variant="ghost"
//           size="sm"
//           onClick={() => setShowAIAssistant(!showAIAssistant)}
//           className="h-8 w-8 p-0 text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-200"
//           title="AI Assistant"
//         >
//           <Sparkles className="w-4 h-4" />
//         </Button>
//         <Button
//           variant="ghost"
//           size="sm"
//           onClick={handleDelete}
//           className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 transition-all duration-200"
//           title="Delete block"
//         >
//           <Trash2 className="w-4 h-4" />
//         </Button>
//       </div>

//       {/* ✅ UPDATED: Responsive block content */}
//       <div className={getBlockStyles()}>
//         <div className="flex items-start gap-2">
//           {/* ✅ UPDATED: Grip handle - hidden on mobile to save space */}
//           <div className="flex-shrink-0 mt-2 hidden lg:block">
//             <GripVertical className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
//           </div>
//           <div className="flex-1">
//             {renderBlockContent()}
//           </div>
//         </div>
//       </div>

//       {/* Enhanced AI Assistant */}
//       <SimpleAIAssistant
//         currentContent={block.content}
//         cursorPosition={cursorPosition}
//         onAccept={handleAIAccept}
//         onClose={() => setShowAIAssistant(false)}
//         isVisible={showAIAssistant}
//         blockType={block.type}
//         allBlocks={allBlockContents}
//       />

//       {/* ✅ UPDATED: Responsive link input modal */}
//       {showLinkInput && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//           <div className="bg-black/90 border border-white/10 rounded-lg p-3 sm:p-4 w-full max-w-sm sm:w-96">
//             <h3 className="text-white font-medium mb-3 text-sm sm:text-base">Add Link</h3>
//             <input
//               type="url"
//               value={linkUrl}
//               onChange={(e) => setLinkUrl(e.target.value)}
//               placeholder="https://example.com"
//               className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-black/40 border border-white/10 rounded text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
//               autoFocus
//             />
//             <div className="flex gap-2 mt-3">
//               <Button
//                 size="sm"
//                 onClick={() => {
//                   if (linkUrl) {
//                     onUpdate({
//                       content: block.content,
//                       attributes: { ...block.attributes, link: linkUrl }
//                     });
//                   }
//                   setShowLinkInput(false);
//                   setLinkUrl("");
//                 }}
//                 className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
//               >
//                 Add Link
//               </Button>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => {
//                   setShowLinkInput(false);
//                   setLinkUrl("");
//                 }}
//                 className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
//               >
//                 Cancel
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }