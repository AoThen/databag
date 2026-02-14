import { useRef, useEffect, RefObject } from 'react'

interface VirtualListRef {
  scrollToItem: (index: number, align: 'auto' | 'start' | 'center' | 'end') => void
}

export function useVirtualList<T>(
  items: T[],
  itemSize: number,
  containerHeight: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  overscanCount: number = 5
): {
  listRef: RefObject<VirtualListRef>
  listHeight: number
  scrollToTop: () => void
  scrollToIndex: (index: number) => void
} {
  const listRef = useRef<VirtualListRef>(null)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollToItem(0, 'start')
    }
  }, [items])

  return {
    listRef,
    listHeight: Math.min(containerHeight, items.length * itemSize),
    scrollToTop: () => {
      if (listRef.current) {
        listRef.current.scrollToItem(0, 'start')
      }
    },
    scrollToIndex: (index: number) => {
      if (listRef.current) {
        listRef.current.scrollToItem(Math.min(index, items.length - 1), 'start')
      }
    },
  }
}