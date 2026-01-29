import React, { useState, useEffect, useCallback } from 'react';
import { Card, Statistic, Progress, Button, Space, Tag } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, ClearOutlined, DatabaseOutlined, CloudOutlined, ClusterOutlined } from '@ant-design/icons';
import memoryManager from 'utils/memoryManager';
import streamingAsset from 'utils/streamingAsset';
import mediaCache from 'utils/indexedDBUtil';

export function PerformanceMonitor() {
  const [stats, setStats] = useState({
    memory: { usedHeap: 0, totalHeap: 0, usagePercent: 0 },
    blob: { usedMemory: 0, count: 0, maxMemory: 0, usagePercent: 0 },
    storage: { quota: 0, usage: 0, usagePercent: 0 },
    worker: { totalWorkers: 0, idleWorkers: 0, busyWorkers: 0, queuedTasks: 0, initialized: false }
  });
  const [visible, setVisible] = useState(false);

  const refreshStats = useCallback(async () => {
    const memoryStats = memoryManager.getStats();
    const streamingStats = streamingAsset.getMemoryStats();
    const cacheStats = await mediaCache.getStats();
    const workerStats = streamingStats.workerStats || { totalWorkers: 0, idleWorkers: 0, busyWorkers: 0, queuedTasks: 0, initialized: false };

    setStats({
      memory: {
        usedHeap: memoryStats.memory?.usedHeap || 0,
        totalHeap: memoryStats.memory?.totalHeap || 0,
        usagePercent: parseFloat(memoryStats.memory?.usagePercent || 0)
      },
      blob: {
        usedMemory: streamingStats.usedMemory,
        count: streamingStats.blobCount,
        maxMemory: streamingStats.maxMemory,
        usagePercent: parseFloat(streamingStats.usagePercent)
      },
      storage: {
        quota: cacheStats.quota || memoryStats.storage?.quota || 0,
        usage: cacheStats.totalSize || memoryStats.storage?.usage || 0,
        usagePercent: parseFloat(cacheStats.usagePercent || memoryStats.storage?.usagePercent || 0)
      },
      worker: {
        totalWorkers: workerStats.totalWorkers || 0,
        idleWorkers: workerStats.idleWorkers || 0,
        busyWorkers: workerStats.busyWorkers || 0,
        queuedTasks: workerStats.queuedTasks || 0,
        initialized: workerStats.initialized || false
      }
    });
  }, []);

  useEffect(() => {
    if (!visible) return;

    refreshStats();
    const interval = setInterval(refreshStats, 2000);
    return () => clearInterval(interval);
  }, [visible, refreshStats]);

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleCleanup = async () => {
    memoryManager.cleanupAll();
    await mediaCache.cleanupExpired();
    refreshStats();
  };

  if (!visible) {
    return (
      <Button
        type="text"
        icon={<DatabaseOutlined />}
        onClick={() => setVisible(true)}
        style={{ position: 'fixed', bottom: 80, right: 16, zIndex: 1000 }}
      >
        Monitor
      </Button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 80,
      right: 16,
      zIndex: 1000,
      width: 340
    }}>
      <Card
        title="Performance Monitor"
        extra={
          <Space>
            <Button size="small" onClick={refreshStats} icon={<ArrowDownOutlined />}>
              Refresh
            </Button>
            <Button size="small" danger onClick={handleCleanup} icon={<ClearOutlined />}>
              Cleanup
            </Button>
            <Button size="small" onClick={() => setVisible(false)}>
              Close
            </Button>
          </Space>
        }
        size="small"
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span>JS Heap</span>
            <span>{formatSize(stats.memory.usedHeap)} / {formatSize(stats.memory.totalHeap)}</span>
          </div>
          <Progress
            percent={Math.min(100, stats.memory.usagePercent)}
            size="small"
            status={stats.memory.usagePercent > 80 ? 'exception' : 'normal'}
            showInfo={false}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span>Blob URLs</span>
            <span>{formatSize(stats.blob.usedMemory)} ({stats.blob.count})</span>
          </div>
          <Progress
            percent={Math.min(100, stats.blob.usagePercent)}
            size="small"
            status={stats.blob.usagePercent > 80 ? 'exception' : 'normal'}
            showInfo={false}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span><CloudOutlined /> IndexedDB Cache</span>
            <span>{formatSize(stats.storage.usage)}</span>
          </div>
          <Progress
            percent={Math.min(100, stats.storage.usagePercent)}
            size="small"
            showInfo={false}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span><ClusterOutlined /> Decrypt Workers</span>
            <span>{stats.worker.idleWorkers}/{stats.worker.totalWorkers} idle</span>
          </div>
          {stats.worker.initialized ? (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Tag color="blue">Workers: {stats.worker.totalWorkers}</Tag>
              <Tag color="green">Idle: {stats.worker.idleWorkers}</Tag>
              <Tag color="orange">Busy: {stats.worker.busyWorkers}</Tag>
              <Tag color="purple">Queue: {stats.worker.queuedTasks}</Tag>
            </div>
          ) : (
            <Tag color="red">Workers: Not Available</Tag>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Tag color={streamingAsset.featureSupport.mse ? 'green' : 'red'}>
            MSE: {streamingAsset.featureSupport.mse ? '✓' : '✗'}
          </Tag>
          <Tag color={streamingAsset.featureSupport.stream ? 'green' : 'red'}>
            Stream: {streamingAsset.featureSupport.stream ? '✓' : '✗'}
          </Tag>
          <Tag color={streamingAsset.featureSupport.indexedDB ? 'green' : 'red'}>
            IDB: {streamingAsset.featureSupport.indexedDB ? '✓' : '✗'}
          </Tag>
          <Tag color={streamingAsset.featureSupport.worker ? 'green' : 'red'}>
            Worker: {streamingAsset.featureSupport.worker ? '✓' : '✗'}
          </Tag>
        </div>
      </Card>
    </div>
  );
}

export default PerformanceMonitor;
