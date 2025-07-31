import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import { ReactRenderer } from '@tiptap/react'
import { CommandList } from './CommandList'
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Image,
  Type,
  SeparatorHorizontal
} from 'lucide-react'

export const SlashCommand = Extension.create({
  name: 'slash-command',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({
          editor,
          range,
          props,
        }: {
          editor: any
          range: any
          props: any
        }) => {
          props.command({ editor, range })
        },
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})

const getSuggestionItems = ({ query }: { query: string }) => {
  return [
    {
      title: 'Text',
      description: 'Just start typing with plain text.',
      icon: Type,
      command: ({ editor, range }: { editor: any; range: any }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode('paragraph')
          .run()
      },
    },
    {
      title: 'Heading 1',
      description: 'Large section heading.',
      icon: Heading1,
      command: ({ editor, range }: { editor: any; range: any }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode('heading', { level: 1 })
          .run()
      },
    },
    {
      title: 'Heading 2',
      description: 'Medium section heading.',
      icon: Heading2,
      command: ({ editor, range }: { editor: any; range: any }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode('heading', { level: 2 })
          .run()
      },
    },
    {
      title: 'Heading 3',
      description: 'Small section heading.',
      icon: Heading3,
      command: ({ editor, range }: { editor: any; range: any }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode('heading', { level: 3 })
          .run()
      },
    },
    {
      title: 'Bullet List',
      description: 'Create a simple bullet list.',
      icon: List,
      command: ({ editor, range }: { editor: any; range: any }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .toggleBulletList()
          .run()
      },
    },
    {
      title: 'Numbered List',
      description: 'Create a numbered list.',
      icon: ListOrdered,
      command: ({ editor, range }: { editor: any; range: any }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .toggleOrderedList()
          .run()
      },
    },
    {
      title: 'Quote',
      description: 'Capture a quote.',
      icon: Quote,
      command: ({ editor, range }: { editor: any; range: any }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .toggleBlockquote()
          .run()
      },
    },
    {
      title: 'Code',
      description: 'Capture a code snippet.',
      icon: Code,
      command: ({ editor, range }: { editor: any; range: any }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .toggleCodeBlock()
          .run()
      },
    },
    {
      title: 'Divider',
      description: 'Add a horizontal line.',
      icon: SeparatorHorizontal,
      command: ({ editor, range }: { editor: any; range: any }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setHorizontalRule()
          .run()
      },
    },
  ].filter((item) => {
    if (typeof query === 'string' && query.length > 0) {
      return item.title.toLowerCase().includes(query.toLowerCase())
    }
    return true
  })
}

const renderItems = () => {
  return getSuggestionItems({ query: '' })
}

const SlashCommandList = ({
  items,
  command,
  editor,
  range,
}: {
  items: any[]
  command: any
  editor: any
  range: any
}) => {
  return new ReactRenderer(CommandList, {
    editor,
    props: {
      items,
      command,
      editor,
      range,
    },
  })
}

export { SlashCommandList, renderItems, getSuggestionItems }