import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Spin } from 'antd';

export function LazyConversation({ 
  topics, 
  topicRenderer, 
  onLoadMore,
  hasMore,
  loadingMore,
  loadingInit,
  contentKey
}) {
  const containerRef = useRef(null);
  const observerRef = useRef(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });
  const [containerHeight, setContainerHeight] = useState(0);

  const itemHeights = useRef({});
  const totalHeightRef = useRef(0);
  const positionsRef = useRef([]);

  const ITEM_ESTIMATE = 120;
  const OVERSCAN = 10;

  const getItemHeight = useCallback((index) => {
    if (itemHeights.current[index] !== undefined) {
      return itemHeights.current[index];
    }
    return ITEM_ESTIMATE;
  }, []);

  const calculatePositions = useCallback(() => {
    let currentPos = 0;
    positionsRef.current = [];
    
    topics.forEach((topic, index) => {
      const height = getItemHeight(index);
      positionsRef.current.push({
        start: currentPos,
        end: currentPos + height,
        index
      });
      currentPos += height;
    });
    
    totalHeightRef.current = currentPos;
    return currentPos;
  }, [topics, getItemHeight]);

  const updateVisibleRange = useCallback((scrollTop) => {
    const totalHeight = calculatePositions();
    const visibleStart = Math.max(0, Math.floor(scrollTop / ITEM_ESTIMATE) - OVERSCAN);
    const visibleEnd = Math.min(topics.length, Math.ceil((scrollTop + containerHeight) / ITEM_ESTIMATE) + OVERSCAN);
    
    setVisibleRange({
      start: Math.max(0, visibleStart),
      end: Math.min(topics.length, visibleEnd)
    });

    if (visibleEnd >= topics.length - 3 && hasMore && !loadingMore && onLoadMore) {
      onLoadMore();
    }
  }, [topics.length, containerHeight, hasMore, loadingMore, onLoadMore, calculatePositions]);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.borderBoxSize) {
          const height = entry.borderBoxSize[0]?.blockSize || entry.contentRect.height;
          setContainerHeight(height);
        }
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      updateVisibleRange(container.scrollTop);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [updateVisibleRange]);

  useEffect(() => {
    calculatePositions();
  }, [topics.length, calculatePositions]);

  const visibleTopics = useMemo(() => {
    const items = [];
    for (let i = visibleRange.start; i < visibleRange.end && i < topics.length; i++) {
      items.push({ topic: topics[i], index: i });
    }
    return items;
  }, [topics, visibleRange]);

  const handleItemMount = useCallback((index, height) => {
    if (itemHeights.current[index] !== height) {
      itemHeights.current[index] = height;
      calculatePositions();
    }
  }, [calculatePositions]);

  if (loadingInit && topics.length === 0) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" delay={250} />
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="empty">This Topic Has No Messages</div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      style={{ 
        height: '100%', 
        overflowY: 'auto',
        position: 'relative'
      }}
    >
      <div style={{ 
        height: totalHeightRef.current || topics.length * ITEM_ESTIMATE,
        position: 'relative'
      }}>
        <div style={{ 
          position: 'absolute',
          top: visibleRange.start * ITEM_ESTIMATE,
          transform: `translateY(0)`
        }}>
          {visibleTopics.map(({ topic, index }) => (
            <div 
              key={topic.id || index}
              data-index={index}
              style={{ 
                position: 'absolute',
                top: positionsRef.current[index]?.start ?? (index * ITEM_ESTIMATE),
                width: '100%'
              }}
            >
              <TopicWrapper 
                topic={topic} 
                index={index}
                contentKey={contentKey}
                topicRenderer={topicRenderer}
                onHeightChange={handleItemMount}
              />
            </div>
          ))}
        </div>
      </div>
      
      {loadingMore && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px',
          display: 'flex',
          justifyContent: 'center',
          background: 'inherit'
        }}>
          <Spin size="small" delay={250} />
        </div>
      )}
    </div>
  );
}

function TopicWrapper({ topic, index, contentKey, topicRenderer, onHeightChange }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        if (entries.length > 0) {
          const entry = entries[0];
          onHeightChange(index, entry.borderBoxSize?.[0]?.blockSize || entry.contentRect.height);
        }
      });
      
      resizeObserver.observe(ref.current);
      return () => resizeObserver.disconnect();
    }
  }, [index, onHeightChange]);

  return (
    <div ref={ref}>
      {topicRenderer(topic, index)}
    </div>
  );
}

export default LazyConversation;
