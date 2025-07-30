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
    <div className="border-b border-white/10 bg-black/30">
      {/* ✅ UPDATED: Mobile-first responsive design */}
      <div className="p-2 sm:p-3">
        {/* ✅ Main toolbar row */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-hide">
          {/* ✅ UPDATED: Compact block type selector for mobile */}
          <div className="flex items-center gap-1 border-r border-white/10 pr-2 sm:pr-3 flex-shrink-0">
            <span className="text-xs text-gray-400 mr-1 hidden xs:inline">Blocks</span>
            <span className="text-xs text-gray-400 mr-1 xs:hidden">B</span>
            <div className="flex items-center gap-0.5 sm:gap-1">
              {blockTypes.slice(0, 6).map((blockType, index) => {
                const Icon = blockType.icon;
                return (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddBlock(blockType.type)}
                    className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
                    title={blockType.label}
                  >
                    <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                );
              })}
              {/* ✅ Show remaining block types in a compact way */}
              {blockTypes.slice(6).map((blockType, index) => {
                const Icon = blockType.icon;
                return (
                  <Button
                    key={index + 6}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddBlock(blockType.type)}
                    className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0 hidden sm:flex"
                    title={blockType.label}
                  >
                    <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                );
              })}
            </div>
          </div>

          {/* ✅ UPDATED: Text formatting - only show when paragraph is selected */}
          {selectedBlock && selectedBlock.type === 'paragraph' && (
            <div className="flex items-center gap-1 border-r border-white/10 pr-2 sm:pr-3 flex-shrink-0">
              <span className="text-xs text-gray-400 mr-1 hidden xs:inline">Format</span>
              <span className="text-xs text-gray-400 mr-1 xs:hidden">F</span>
              <div className="flex items-center gap-0.5 sm:gap-1">
                {textFormats.map((format) => {
                  const Icon = format.icon;
                  return (
                    <Button
                      key={format.format}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFormat(format.format)}
                      className={`h-6 w-6 sm:h-8 sm:w-8 p-0 transition-colors flex-shrink-0 ${
                        isFormatActive(format.format)
                          ? 'text-purple-400 bg-purple-500/20 border border-purple-500/30'
                          : 'text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                      title={format.label}
                    >
                      <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ✅ UPDATED: Alignment - compact design */}
          {selectedBlock && ['paragraph', 'heading'].includes(selectedBlock.type) && (
            <div className="flex items-center gap-1 border-r border-white/10 pr-2 sm:pr-3 flex-shrink-0">
              <span className="text-xs text-gray-400 mr-1 hidden xs:inline">Align</span>
              <span className="text-xs text-gray-400 mr-1 xs:hidden">A</span>
              <div className="flex items-center gap-0.5 sm:gap-1">
                {alignments.map((alignment) => {
                  const Icon = alignment.icon;
                  return (
                    <Button
                      key={alignment.value}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFormat('align', alignment.value)}
                      className={`h-6 w-6 sm:h-8 sm:w-8 p-0 transition-colors flex-shrink-0 ${
                        getAlignment() === alignment.value
                          ? 'text-purple-400 bg-purple-500/20 border border-purple-500/30'
                          : 'text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                      title={alignment.label}
                    >
                      <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ✅ UPDATED: Quick add button - always visible and properly sized */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAddBlock('paragraph')}
            className="h-6 sm:h-8 px-2 sm:px-3 text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 transition-colors border border-purple-500/30 hover:border-purple-500/50 flex-shrink-0 ml-auto"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span className="text-xs sm:text-sm font-medium">Add</span>
          </Button>
        </div>

        {/* ✅ NEW: Secondary toolbar for additional block types on mobile */}
        <div className="sm:hidden mt-2 pt-2 border-t border-white/10">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            <span className="text-xs text-gray-400 mr-2 flex-shrink-0">More:</span>
            {blockTypes.slice(6).map((blockType, index) => {
              const Icon = blockType.icon;
              return (
                <Button
                  key={index + 6}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAddBlock(blockType.type)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
                  title={blockType.label}
                >
                  <Icon className="w-3 h-3" />
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ✅ Custom scrollbar styles */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

// "use client";

// import React from "react";
// import {
//   Type,
//   Heading1,
//   Heading2,
//   Heading3,
//   List,
//   ListOrdered,
//   Quote,
//   Code,
//   Image,
//   Plus,
//   Bold,
//   Italic,
//   Underline,
//   Link,
//   AlignLeft,
//   AlignCenter,
//   AlignRight
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { EditorBlock } from "@/types/blog";

// interface EditorToolbarProps {
//   onAddBlock: (type: EditorBlock['type']) => void;
//   selectedBlock?: EditorBlock;
//   onFormatChange?: (format: string, value?: any) => void;
// }

// const blockTypes = [
//   { type: 'paragraph' as const, icon: Type, label: 'Paragraph' },
//   { type: 'heading' as const, icon: Heading1, label: 'Heading 1' },
//   { type: 'heading' as const, icon: Heading2, label: 'Heading 2' },
//   { type: 'heading' as const, icon: Heading3, label: 'Heading 3' },
//   { type: 'list' as const, icon: List, label: 'Bullet List' },
//   { type: 'list' as const, icon: ListOrdered, label: 'Numbered List' },
//   { type: 'quote' as const, icon: Quote, label: 'Quote' },
//   { type: 'code' as const, icon: Code, label: 'Code Block' },
//   { type: 'image' as const, icon: Image, label: 'Image' },
// ];

// const textFormats = [
//   { format: 'bold', icon: Bold, label: 'Bold' },
//   { format: 'italic', icon: Italic, label: 'Italic' },
//   { format: 'underline', icon: Underline, label: 'Underline' },
//   { format: 'link', icon: Link, label: 'Link' },
// ];

// const alignments = [
//   { value: 'left', icon: AlignLeft, label: 'Align Left' },
//   { value: 'center', icon: AlignCenter, label: 'Align Center' },
//   { value: 'right', icon: AlignRight, label: 'Align Right' },
// ];

// export default function EditorToolbar({ onAddBlock, selectedBlock, onFormatChange }: EditorToolbarProps) {
//   const handleAddBlock = (type: EditorBlock['type']) => {
//     onAddBlock(type);
//   };

//   const handleFormat = (format: string, value?: any) => {
//     onFormatChange?.(format, value);
//   };

//   const isFormatActive = (format: string) => {
//     return selectedBlock?.attributes?.[format] === true;
//   };

//   const getAlignment = () => {
//     return selectedBlock?.attributes?.align || 'left';
//   };

//   return (
//     <div className="border-b border-white/10 bg-black/30 p-2 sm:p-3">
//       {/* ✅ UPDATED: Responsive toolbar container */}
//       <div className="flex items-center gap-1 sm:gap-2 flex-wrap overflow-x-auto">
//         {/* ✅ UPDATED: Block type selector */}
//         <div className="flex items-center gap-1 border-r border-white/10 pr-2 sm:pr-3 flex-shrink-0">
//           <span className="text-xs text-gray-400 mr-1 sm:mr-2 hidden sm:inline">Blocks:</span>
//           <span className="text-xs text-gray-400 mr-1 sm:mr-2 sm:hidden">B:</span>
//           {blockTypes.map((blockType, index) => {
//             const Icon = blockType.icon;
//             return (
//               <Button
//                 key={index}
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => handleAddBlock(blockType.type)}
//                 className="h-7 sm:h-8 px-1.5 sm:px-2 text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
//                 title={blockType.label}
//               >
//                 <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
//               </Button>
//             );
//           })}
//         </div>

//         {/* ✅ UPDATED: Text formatting */}
//         {selectedBlock && selectedBlock.type === 'paragraph' && (
//           <div className="flex items-center gap-1 border-r border-white/10 pr-2 sm:pr-3 flex-shrink-0">
//             <span className="text-xs text-gray-400 mr-1 sm:mr-2 hidden sm:inline">Format:</span>
//             <span className="text-xs text-gray-400 mr-1 sm:mr-2 sm:hidden">F:</span>
//             {textFormats.map((format) => {
//               const Icon = format.icon;
//               return (
//                 <Button
//                   key={format.format}
//                   variant="ghost"
//                   size="sm"
//                   onClick={() => handleFormat(format.format)}
//                   className={`h-7 sm:h-8 px-1.5 sm:px-2 transition-colors flex-shrink-0 ${
//                     isFormatActive(format.format)
//                       ? 'text-purple-400 bg-purple-500/20 border border-purple-500/30'
//                       : 'text-gray-400 hover:text-white hover:bg-white/10'
//                   }`}
//                   title={format.label}
//                 >
//                   <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
//                 </Button>
//               );
//             })}
//           </div>
//         )}

//         {/* ✅ UPDATED: Alignment */}
//         {selectedBlock && ['paragraph', 'heading'].includes(selectedBlock.type) && (
//           <div className="flex items-center gap-1 border-r border-white/10 pr-2 sm:pr-3 flex-shrink-0">
//             <span className="text-xs text-gray-400 mr-1 sm:mr-2 hidden sm:inline">Align:</span>
//             <span className="text-xs text-gray-400 mr-1 sm:mr-2 sm:hidden">A:</span>
//             {alignments.map((alignment) => {
//               const Icon = alignment.icon;
//               return (
//                 <Button
//                   key={alignment.value}
//                   variant="ghost"
//                   size="sm"
//                   onClick={() => handleFormat('align', alignment.value)}
//                   className={`h-7 sm:h-8 px-1.5 sm:px-2 transition-colors flex-shrink-0 ${
//                     getAlignment() === alignment.value
//                       ? 'text-purple-400 bg-purple-500/20 border border-purple-500/30'
//                       : 'text-gray-400 hover:text-white hover:bg-white/10'
//                   }`}
//                   title={alignment.label}
//                 >
//                   <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
//                 </Button>
//               );
//             })}
//           </div>
//         )}

//         {/* ✅ UPDATED: Quick add button */}
//         <Button
//           variant="ghost"
//           size="sm"
//           onClick={() => handleAddBlock('paragraph')}
//           className="h-7 sm:h-8 px-2 sm:px-3 text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 transition-colors border border-purple-500/30 hover:border-purple-500/50 flex-shrink-0"
//         >
//           <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
//           <span className="hidden sm:inline">Add Block</span>
//           <span className="sm:hidden">Add</span>
//         </Button>
//       </div>
//     </div>
//   );
// }