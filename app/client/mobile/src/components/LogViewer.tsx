import React, { useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, Alert, StyleSheet, Dimensions } from 'react-native';
import { useTheme, Surface, IconButton } from 'react-native-paper';
import { LogEntry, LogLevel } from '../types/LogTypes';
import { useLogContext } from '../context/useLogContext.hook';
import Clipboard from '@react-native-clipboard/clipboard';

const { height } = Dimensions.get('window');

export function LogViewer({ onClose }: { onClose: () => void }) {
  const { state, actions } = useLogContext();
  const theme = useTheme();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case LogLevel.ERROR: return theme.colors.error || '#B22626';
      case LogLevel.WARN: return '#EDB612';
      case LogLevel.INFO: return theme.colors.primary || '#224433';
      case LogLevel.DEBUG: return theme.colors.outline || '#888888';
    }
  };
  
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };
  
  const clearLogs = () => {
    Alert.alert(
      'Clear Logs',
      'Are you sure you want to clear all logs?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => actions.clearLogs()
        }
      ]
    );
  };
  
  const copyToClipboard = async () => {
    const formattedText = actions.getFormattedText();
    await Clipboard.setString(formattedText);
    Alert.alert('Copied', 'Logs copied to clipboard');
  };
  
  const renderLogEntry = ({ item }: { item: LogEntry }) => (
    <TouchableOpacity 
      onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}
      style={styles.logEntryContainer}
    >
      <View style={[styles.logEntry, { 
        borderLeftColor: getLevelColor(item.level),
        backgroundColor: theme.colors.surface 
      }]}>
        <Text style={[styles.timestamp, { color: theme.colors.outline }]}>
          {formatTime(item.timestamp)}
        </Text>
        <View style={styles.levelContainer}>
          <Text style={[styles.level, { color: getLevelColor(item.level) }]}>
            [{item.level}]
          </Text>
          <Text style={[styles.tag, { color: theme.colors.primary }]}>
            {item.tag}
          </Text>
        </View>
        <Text style={[styles.message, { color: theme.colors.onSurface }]}>
          {item.message}
        </Text>
        
        {expandedId === item.id && (
          <View style={[styles.expanded, { backgroundColor: theme.colors.elevation.level1 }]}>
            {item.context && (
              <Text style={[styles.context, { color: theme.colors.onSurfaceVariant }]}>
                Context: {JSON.stringify(item.context, null, 2)}
              </Text>
            )}
            {item.stack && (
              <Text style={[styles.stack, { color: getLevelColor(item.level) }]}>
                Stack: {item.stack}
              </Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
  
  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {/* 顶部工具栏 */}
      <View style={[styles.header, { backgroundColor: theme.colors.elevation.level2 }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            Application Logs ({state.entries.length})
          </Text>
        </View>
        <View style={styles.actions}>
          <IconButton
            icon="trash-can-outline"
            size={20}
            onPress={clearLogs}
          />
          <IconButton
            icon="content-copy"
            size={20}
            onPress={copyToClipboard}
          />
          <IconButton
            icon="close"
            size={20}
            onPress={onClose}
          />
        </View>
      </View>
      
      {/* 日志列表 */}
      <FlatList
        data={state.entries}
        renderItem={renderLogEntry}
        keyExtractor={item => item.id}
        style={styles.list}
        inverted // 最新消息在顶部
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.listContent}
      />
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: height,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 8,
  },
  logEntryContainer: {
    marginBottom: 8,
  },
  logEntry: {
    padding: 12,
    borderLeftWidth: 4,
    borderRadius: 4,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  timestamp: {
    fontSize: 12,
    marginBottom: 4,
  },
  levelContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  level: {
    fontSize: 10,
    fontWeight: 'bold',
    marginRight: 8,
  },
  tag: {
    fontSize: 12,
    fontWeight: '500',
  },
  message: {
    fontSize: 14,
    lineHeight: 18,
  },
  expanded: {
    marginTop: 8,
    padding: 12,
    borderRadius: 4,
  },
  context: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  stack: {
    fontSize: 11,
    fontFamily: 'monospace',
    lineHeight: 14,
  },
});