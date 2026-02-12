import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { VariableSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useTheme } from 'styled-components';

export function VirtualConversation({ 
  topics, 
  contentKey, 
  topicRenderer, 
  onLoadMore,
  hasMore,
  loadingMore,
  loadingInit
}) {
  const containerRef = useRef(null);
  const listRef = useRef(null);
  const [totalHeight, setTotalHeight] = useState(600);
  const theme = useTheme();

  const itemSizeCache = useRef({});
  const [sizeMap, setSizeMap] = useState({});

  const getItemSize = useCallback((index) => {
    const topic = topics[index];
    if (!topic) return 80;

    const cachedSize = sizeMap[topic.id];
    if (cachedSize) return cachedSize;

    let height = 60;
    
    if (topic.content) {
      height += Math.min(topic.content.length * 20, 150);
    }
    
    if (topic.assets && topic.assets.length > 0) {
      height += 200;
    }
    
    const newSize = Math.max(height, 80);
    setSizeMap(prev => ({ ...prev, [topic.id]: newSize }));
    
    return newSize;
  }, [topics, sizeMap]);

  const resetSizeCache = useCallback(() => {
    setSizeMap({});
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }
  }, []);

  useEffect(() => {
    resetSizeCache();
  }, [topics.length, resetSizeCache]);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { height } = containerRef.current.getBoundingClientRect();
        setTotalHeight(height || 600);
      }
    };

    handleResize();
    
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  const handleItemsRendered = useCallback(({ visibleStartIndex, visibleStopIndex }) => {
    if (visibleStopIndex >= topics.length - 5 && hasMore && !loadingMore && onLoadMore) {
      onLoadMore();
    }
  }, [topics.length, hasMore, loadingMore, onLoadMore]);

  const Item = useCallback(({ index, style, data }) => {
    const { topics, contentKey, renderer } = data;
    const topic = topics[index];

    return (
      <div style={style}>
        {renderer(topic, index)}
      </div>
    );
  }, []);

  const itemData = useMemo(() => ({
    topics,
    contentKey,
    renderer: topicRenderer
  }), [topics, contentKey, topicRenderer]);

  if (loadingInit && topics.length === 0) {
    return null;
  }

  return (
    <div 
      ref={containerRef} 
      style={{ 
        height: '100%', 
        width: '100%',
        overflow: 'hidden' 
      }}
    >
      <AutoSizer>
        {({ height, width }) => {
          if (height === 0 || width === 0) {
            return null;
          }

          return (
            <List
              ref={listRef}
              height={height}
              width={width}
              itemCount={topics.length}
              itemSize={getItemSize}
              itemData={itemData}
              onItemsRendered={handleItemsRendered}
              overscanCount={5}
              useIsScrolling
            >
              {Item}
            </List>
          );
        }}
      </AutoSizer>
      
      {loadingMore && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px',
          display: 'flex',
          justifyContent: 'center',
          background: theme?.colors?.base || '#fff'
        }}>
          Loading more...
        </div>
      )}
    </div>
  );
}

export default VirtualConversation;
