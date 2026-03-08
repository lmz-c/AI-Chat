<script setup lang="ts">

import { useChatStore } from "../store/chatStore"
import MessageList from "./MessageList.vue"
import ChatInput from "./ChatInput.vue"

const store = useChatStore()

const handleSend = (text: string) => {
  store.sendMessage(text)
}

</script>

<template>

<div class="chat-container">

  <MessageList :messages="store.messages" />

  <ChatInput @send="handleSend" />

</div>

</template>