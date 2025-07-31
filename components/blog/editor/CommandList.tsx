import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react'

export interface CommandListProps {
  items: any[]
  command: (item: any) => void
  editor: any
  range: any
}

export interface CommandListRef {
  onKeyDown: ({ event }: { event: KeyboardEvent }) => boolean
}

export const CommandList = forwardRef<CommandListRef, CommandListProps>(
  ({ items, command, editor, range }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0)

    const selectItem = (index: number) => {
      const item = items[index]
      if (item) {
        command(item)
      }
    }

    const upHandler = () => {
      setSelectedIndex((selectedIndex + items.length - 1) % items.length)
    }

    const downHandler = () => {
      setSelectedIndex((selectedIndex + 1) % items.length)
    }

    const enterHandler = () => {
      selectItem(selectedIndex)
    }

    useEffect(() => setSelectedIndex(0), [items])

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === 'ArrowUp') {
          upHandler()
          return true
        }

        if (event.key === 'ArrowDown') {
          downHandler()
          return true
        }

        if (event.key === 'Enter') {
          enterHandler()
          return true
        }

        return false
      },
    }))

    return (
      <div className="z-50 min-w-[8rem] overflow-hidden rounded-md border border-white/10 bg-black/95 p-1 shadow-md">
        {items.length ? (
          items.map((item: any, index: number) => {
            const Icon = item.icon
            return (
              <button
                className={`flex w-full items-center space-x-2 rounded-sm px-2 py-1 text-sm text-white hover:bg-purple-600/50 ${
                  index === selectedIndex ? 'bg-purple-600/50' : ''
                }`}
                key={index}
                onClick={() => selectItem(index)}
              >
                <Icon className="h-4 w-4" />
                <div className="flex flex-col">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-gray-400">{item.description}</p>
                </div>
              </button>
            )
          })
        ) : (
          <div className="px-2 py-1 text-sm text-gray-400">No results</div>
        )}
      </div>
    )
  }
)

CommandList.displayName = 'CommandList'