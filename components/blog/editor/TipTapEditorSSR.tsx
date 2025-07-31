"use client";

import React, { useCallback, useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { SlashCommand, getSuggestionItems } from './SlashCommand'
import { CommandList } from './CommandList'
import { Placeholder } from '@tiptap/extension-placeholder'
import { Link } from '@tiptap/extension-link'
import { Image } from '@tiptap/extension-image'
import { TextAlign } from '@tiptap/extension-text-align'
import { Typography } from '@tiptap/extension-typography'
import { HorizontalRule } from '@tiptap/extension-horizontal-rule'
import { ReactRenderer } from '@tiptap/react'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Code as CodeIcon,
  Image as ImageIcon,
  SeparatorHorizontal
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TipTapEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null
  }

  return (
    <div className="border-b border-white/10 bg-black/40 p-3 flex flex-wrap gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`text-gray-300 hover:text-white hover:bg-purple-600/30 ${
          editor.isActive('bold') ? 'bg-purple-600/50 text-white' : ''
        }`}
      >
        <Bold className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`text-gray-300 hover:text-white hover:bg-purple-600/30 ${
          editor.isActive('italic') ? 'bg-purple-600/50 text-white' : ''
        }`}
      >
        <Italic className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`text-gray-300 hover:text-white hover:bg-purple-600/30 ${
          editor.isActive('strike') ? 'bg-purple-600/50 text-white' : ''
        }`}
      >
        <Strikethrough className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`text-gray-300 hover:text-white hover:bg-purple-600/30 ${
          editor.isActive('code') ? 'bg-purple-600/50 text-white' : ''
        }`}
      >
        <Code className="w-4 h-4" />
      </Button>

      <div className="w-px bg-white/20 mx-2" />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`text-gray-300 hover:text-white hover:bg-purple-600/30 ${
          editor.isActive('heading', { level: 1 }) ? 'bg-purple-600/50 text-white' : ''
        }`}
      >
        <Heading1 className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`text-gray-300 hover:text-white hover:bg-purple-600/30 ${
          editor.isActive('heading', { level: 2 }) ? 'bg-purple-600/50 text-white' : ''
        }`}
      >
        <Heading2 className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`text-gray-300 hover:text-white hover:bg-purple-600/30 ${
          editor.isActive('heading', { level: 3 }) ? 'bg-purple-600/50 text-white' : ''
        }`}
      >
        <Heading3 className="w-4 h-4" />
      </Button>

      <div className="w-px bg-white/20 mx-2" />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`text-gray-300 hover:text-white hover:bg-purple-600/30 ${
          editor.isActive('bulletList') ? 'bg-purple-600/50 text-white' : ''
        }`}
      >
        <List className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`text-gray-300 hover:text-white hover:bg-purple-600/30 ${
          editor.isActive('orderedList') ? 'bg-purple-600/50 text-white' : ''
        }`}
      >
        <ListOrdered className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`text-gray-300 hover:text-white hover:bg-purple-600/30 ${
          editor.isActive('blockquote') ? 'bg-purple-600/50 text-white' : ''
        }`}
      >
        <Quote className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`text-gray-300 hover:text-white hover:bg-purple-600/30 ${
          editor.isActive('codeBlock') ? 'bg-purple-600/50 text-white' : ''
        }`}
      >
        <CodeIcon className="w-4 h-4" />
      </Button>

      <div className="w-px bg-white/20 mx-2" />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`text-gray-300 hover:text-white hover:bg-purple-600/30 ${
          editor.isActive({ textAlign: 'left' }) ? 'bg-purple-600/50 text-white' : ''
        }`}
      >
        <AlignLeft className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`text-gray-300 hover:text-white hover:bg-purple-600/30 ${
          editor.isActive({ textAlign: 'center' }) ? 'bg-purple-600/50 text-white' : ''
        }`}
      >
        <AlignCenter className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`text-gray-300 hover:text-white hover:bg-purple-600/30 ${
          editor.isActive({ textAlign: 'right' }) ? 'bg-purple-600/50 text-white' : ''
        }`}
      >
        <AlignRight className="w-4 h-4" />
      </Button>
    </div>
  )
}

function TipTapEditorContent({ content, onChange, placeholder }: TipTapEditorProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || 'Type "/" for commands...',
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Typography,
      HorizontalRule,
      SlashCommand.configure({
        suggestion: {
          items: getSuggestionItems,
          render: () => {
            let component: any
            let popup: any

            return {
              onStart: (props: any) => {
                component = new ReactRenderer(CommandList, {
                  props,
                  editor: props.editor,
                })

                popup = document.createElement('div')
                popup.className = 'slash-command-popup'
                document.body.appendChild(popup)
                popup.appendChild(component.element)
              },
              onUpdate(props: any) {
                component.updateProps(props)

                if (!props.clientRect) {
                  return
                }

                const rect = props.clientRect()
                // Move popup right and down for better positioning
                popup.style.left = `${rect.left + 20}px`
                popup.style.top = `${rect.bottom + 10}px`
              },
              onKeyDown(props: any) {
                if (props.event.key === 'Escape') {
                  popup.remove()
                  return true
                }

                return component.ref?.onKeyDown(props)
              },
              onExit() {
                popup.remove()
                component.destroy()
              },
            }
          },
        },
      }),
    ],
    content: content || '', // Ensure content is never undefined
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    immediatelyRender: false, // Fix SSR error
  })

  // Update editor content when content prop changes - simplified
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  // Initialize editor with content when it's first created
  useEffect(() => {
    if (editor && content && editor.isEmpty) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  if (!isMounted) {
    return (
      <div className="min-h-[200px] bg-black/20 border border-white/10 rounded-lg p-4">
        <div className="text-gray-400 text-sm">Loading editor...</div>
      </div>
    )
  }

  if (!editor) {
    return null
  }

  return (
    <div className="relative">
      <MenuBar editor={editor} />
      <EditorContent
        editor={editor}
        className="prose prose-invert max-w-none focus:outline-none min-h-[400px] p-4"
      />
    </div>
  )
}

// Export with dynamic import to prevent SSR issues
export default function TipTapEditor(props: TipTapEditorProps) {
  return (
    <>
      <TipTapEditorContent {...props} />
      <style jsx global>{`
        .slash-command-popup {
          position: absolute;
          z-index: 50;
          background: rgba(0, 0, 0, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
          min-width: 200px;
          max-width: 300px;
        }
      `}</style>
    </>
  )
}