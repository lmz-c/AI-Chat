<script setup lang="ts">
import type { Message } from '../types/message';
import {ref, watch, nextTick} from 'vue';
import { renderMarkdown } from '../utils/markdown';
import "highlight.js/styles/github.css"

const props = defineProps<{
  messages: Message[]
}>()

const listRef = ref<HTMLElement | null>(null)

  // 监听消息列表变化，自动滚动到底部
  watch(
    () => props.messages,
    async () => {
      await nextTick()
      if (listRef.value) {
        listRef.value.scrollTop = listRef.value.scrollHeight
      }
    },
    { deep: true }
  )

</script>

<template>

<div class="message-list" ref="listRef">

  <div
    v-for="msg in messages"
    :key="msg.id"
    class="message"
    :class="msg.role"
  >
    <div
      class="bubble"
      v-html="renderMarkdown(msg.content)"
    ></div>
  </div>

</div>

</template>

<style scoped>

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

/* 每条消息 */
.message {
  margin-bottom: 16px;
  display: flex;
}

.message.user {
  justify-content: flex-end;
}

.message.assistant {
  justify-content: flex-start;
}

/* 气泡 */
.bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 10px;
  background: #f5f5f5;

  /* ⭐ 核心修复：换行 */
  white-space: pre-wrap;
  word-break: break-word;
}

/* 用户气泡 */
.message.user .bubble {
  background: #4f46e5;
  color: white;
}

/* ===== Markdown 样式 ===== */

.bubble p {
  margin: 8px 0;
}

.bubble h1,
.bubble h2,
.bubble h3 {
  margin: 12px 0 6px;
}

/* 代码块 */
.bubble pre {
  background: #0d1117;
  color: #e6edf3;
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;

  /* ⭐ 防止一行撑爆 */
  white-space: pre;
}

/* 行内代码 */
.bubble code {
  background: #eee;
  padding: 2px 6px;
  border-radius: 4px;
}

/* 表格 */
.bubble table {
  border-collapse: collapse;
}

.bubble td,
.bubble th {
  border: 1px solid #ddd;
  padding: 6px;
}

</style>