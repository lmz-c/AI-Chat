<script setup lang="ts">
import { onMounted } from "vue"
import { useConversationStore } from "../store/conversationStore"

const conversationStore = useConversationStore()

onMounted(() => {
  conversationStore.loadConversations()
})
</script>

<template>
  <div class="sidebar">
    
    <button @click="conversationStore.createConversation()">+ 新对话</button>

    <div
      v-for="c in conversationStore.conversations"
      :key="c.id"
      @click="conversationStore.switchConversation(c.id)"
    >
  {{ c.title }}
</div>

  </div>
</template>

<style scoped>
.sidebar {
  width: 240px;
  border-right: 1px solid #eee;
  padding: 10px;
  cursor: pointer;
}

.item {
  padding: 10px;
  cursor: pointer;
}

.item:hover {
  background: #f5f5f5;
}
</style>