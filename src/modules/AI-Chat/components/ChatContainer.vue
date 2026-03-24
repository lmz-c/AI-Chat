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

    <MessageList :messages="conversationStore.messages" />

    <ChatInput @send="handleSend" />

  </div>

</div>

</template>

<style scoped>

.chat-page{
  display: flex;
  height: 100vh;
}

/* 左侧 */
.chat-page :deep(.conversation-list){
  width: 260px;
  border-right: 1px solid #eee;
}

/* 右侧 */
.chat-main{
  flex: 1;
  display: flex;
  flex-direction: column;
}

</style>