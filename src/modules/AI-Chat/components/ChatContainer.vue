<script setup lang="ts">
import ConversationList from "./ConversationList.vue"
import MessageList from "./MessageList.vue"
import ChatInput from "./ChatInput.vue"

import { useConversationStore } from "../store/conversationStore"
import { onMounted } from "vue"
import { useChatStore } from "../store/chatStore"

const chatStore = useChatStore()

function handleSend(text: string) {
  console.log("父组件收到:", text) // 

  chatStore.sendMessage(text)
}
const conversationStore = useConversationStore()

// 初始化一个会话（防止空）
onMounted(() => {
  if (!conversationStore.currentConversationId) {
    conversationStore.createConversation()
  }
})
</script>

<template>

<div class="chat-page">

  <!-- 左侧 -->
  <ConversationList />

  <!-- 右侧 -->
  <div class="chat-main">

    <div class="messages-container">
        <MessageList :messages="conversationStore.messages" />
    </div>

    <ChatInput @send="handleSend" />

  </div>

</div>

</template>

<style scoped>
.chat-page {
  display: flex;
  height: 100vh;
  background: #f5f5f7;
  color: #111827;
  overflow: hidden; /* 整体不滚动，交给内部容器 */
}

/* 左侧会话列表区域（ConversationList 外层自己有 .conversation-list 类） */
.chat-page :deep(.sidebar) {
  width: 260px;
  border-right: 1px solid #e5e7eb;
  background: #ffffff;
  overflow-y: auto;   /* 独立滚动条 */
}

/* 右侧主区域 */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* 消息列表区域：独立滚动 */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
}

/* 让 MessageList 本身撑满容器而不是再抢滚动 */
.chat-page :deep(.message-list) {
  min-height: 100%;
}

/* 输入框区域样式（根据你 ChatInput 里的结构微调） */
.chat-page :deep(.chat-input) {
  border-top: 1px solid #e5e7eb;
  padding: 12px 16px;
  background: #f9fafb;
}

/* 略微接近 ChatGPT 的整体感觉 */
.chat-page :deep(body) {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text",
    "Segoe UI", sans-serif;
}
</style>