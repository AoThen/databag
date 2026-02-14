# 已读功能禁用说明

## 概述

本文档记录了已读功能（read receipts）的禁用改动，用于未来重新启用时的参考。

## 禁用原因

1. 一对一聊天和群组聊天中，已读回执 API 返回 403 Forbidden 错误
2. 后端 `api_getTopicReads.go` 限制只有 topic 作者可以查看已读回执
3. 非作者用户（包括聊天接收方）无法获取已读状态，导致功能不可用

## 禁用时间

2026-02-14

## 修改的文件

### 1. SDK (app/sdk/src/focus.ts)

**修改内容**: `getUnfetchedReadReceiptTopics` 方法直接返回空数组

**修改前**:
```typescript
private getUnfetchedReadReceiptTopics(offset: number, limit: number): string[] {
  const myTopics: Array<{ topicId: string; created: number }> = [];

  for (const [topicId, entry] of this.topicEntries.entries()) {
    if (entry.item.detail.guid === this.guid && !entry.item.readByFetched) {
      myTopics.push({ topicId, created: entry.item.detail.created });
    }
  }

  myTopics.sort((a, b) => b.created - a.created);

  return myTopics.slice(offset, offset + limit).map(t => t.topicId);
}
```

**修改后**:
```typescript
private getUnfetchedReadReceiptTopics(offset: number, limit: number): string[] {
  return [];
}
```

**影响**: 完全停止请求已读回执数据

---

### 2. Web 客户端 (app/client/web/src/conversation/useConversation.hook.ts)

**修改内容**: 移除 `markTopicRead` 调用

#### 2.1 自动已读标记 (useEffect)

**修改前**:
```typescript
if (unreadTopics.length > 0) {
  unreadTopics.forEach(topic => {
    state.markedReadTopics.add(topic.topicId)
    focus.markTopicRead(topic.topicId)
      .then(() => {
        errorCounter.clearRetrySchedule('markTopicRead', topic.topicId)
      })
      .catch((err: unknown) => {
        // 错误处理逻辑
      })
  })
}
```

**修改后**:
```typescript
if (unreadTopics.length > 0) {
  unreadTopics.forEach(topic => {
    state.markedReadTopics.add(topic.topicId)
  })
}
```

#### 2.2 手动已读标记 (actions.markAsRead)

**修改前**:
```typescript
markAsRead: async (topicId: string) => {
  const focus = app.state.focus
  if (focus) {
    await focus.markTopicRead(topicId)
  }
},
```

**修改后**:
```typescript
markAsRead: async (topicId: string) => {
  // 已读功能已禁用
},
```

---

### 3. Mobile 客户端 (app/client/mobile/src/message/useMessage.hook.ts)

**修改内容**: 移除 `markTopicRead` 调用

**修改前**:
```typescript
markAsRead: async (topicId: string) => {
  const focus = app.state.focus;
  if (focus) {
    try {
      await focus.markTopicRead(topicId);
    } catch (err) {
      errorHandler.handle(err, {
        component: 'useMessage',
        action: 'markTopicRead',
        topicId,
      });
    }
  }
},
```

**修改后**:
```typescript
markAsRead: async (topicId: string) => {
  // 已读功能已禁用
},
```

---

## 保留的功能（未修改）

以下功能保持不变：

1. **后端已读状态存储**: `SetTopicRead` API 仍然可用
2. **SDK 导出**: `getTopicReadReceipts` 和 `markTopicRead` 方法仍然导出（但不再被调用）
3. **Web 端已读回执获取**: `focus.fetchMoreReadReceipts()` 和 `focus.getTopicReadReceipts()` 保留（SDK 已禁用调用）

## 重新启用步骤

如需重新启用已读功能，请按以下步骤操作：

### 后端修复 (推荐先执行)

修改 `net/server/internal/api_getTopicReads.go`:

```go
// 当前代码 (line 51-55) - 只允许作者查看
if topic.GUID != act.GUID {
    ErrResponse(w, http.StatusForbidden, errors.New("only topic author can view read receipts"))
    return
}

// 修改为 - 允许频道成员查看（群组）或双方查看（一对一）
// 需要添加逻辑判断 channel 类型
```

具体修复方案：
1. 判断 topic 所属的 channel 类型
2. 如果是 superbasic (一对一聊天): 允许任何参与者查看
3. 如果是 sealed (群组): 保持当前逻辑或允许所有成员查看

### 前端恢复

#### 1. SDK 恢复
恢复 `app/sdk/src/focus.ts` 中 `getUnfetchedReadReceiptTopics` 方法的原始逻辑

#### 2. Web 客户端恢复
恢复以下文件中的调用：
- `app/client/web/src/conversation/useConversation.hook.ts`

#### 3. Mobile 客户端恢复
恢复以下文件中的调用：
- `app/client/mobile/src/message/useMessage.hook.ts`

## 相关日志

### 错误日志示例
```
/internal/api_getTopicReads.go:53 only topic author can view read receipts
GET /content/channels/245aa320-c635-4709-b4fd-6e1c5df99e37/topics/591ea32d-81b2-49a8-a289-cbd894138490/reads 403 (Forbidden)
```

### 成功日志（已读状态设置）
```
PUT /content/channels/245aa320-c635-4709-b4fd-6e1c5df99e37/topics/351d48ff-d432-4b07-9884-0c15e728a5c5/read SetTopicRead 13.980672ms
```

## 附录：相关代码位置

| 文件 | 说明 |
|------|------|
| `net/server/internal/api_getTopicReads.go` | 后端获取已读回执 API |
| `net/server/internal/api_setTopicRead.go` | 后端设置已读状态 API |
| `app/sdk/src/focus.ts` | SDK 已读功能实现 |
| `app/sdk/src/net/setChannelTopicRead.ts` | SDK 网络请求 |
| `app/client/web/src/conversation/useConversation.hook.ts` | Web 客户端已读逻辑 |
| `app/client/mobile/src/message/useMessage.hook.ts` | Mobile 客户端已读逻辑 |
