import { useRef, useEffect, MutableRefObject } from 'react';

/**
 * 统一的虚拟化列表Hook
 * 封装react-window的常见用法
 */
export function useVirtualList<T>(
  items: T[],
  itemSize: number,
  containerHeight: number,
  overscanCount: number = 5
): {
  listRef: MutableRefObject<any>;
  listHeight: number;
  scrollToTop: () => void;
  scrollToIndex: (index: number) => void;
} {
  const listRef = useRef<any>(null);

  useEffect(() => {
    // 当items变化时，滚动到顶部
    if (listRef.current) {
      listRef.current.scrollToItem(0, 'start');
    }
  }, [items]);

  return {
    listRef,
    // 计算列表高度
    listHeight: Math.min(containerHeight, items.length * itemSize),
    // 滚动到顶部
    scrollToTop: () => {
      if (listRef.current) {
        listRef.current.scrollToItem(0, 'start');
      }
    },
    // 滚动到指定索引
    scrollToIndex: (index: number) => {
      if (listRef.current) {
        listRef.current.scrollToItem(Math.min(index, items.length - 1), 'start');
      }
    },
  };
}