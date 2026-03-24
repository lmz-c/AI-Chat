<script setup lang="ts">
import type { Message } from "../types/message";

// 声明一个message属性，类型为Message
defineProps<{
  message: Message
}>()
</script>

<template>
  <div 
    class="message"
    :class="message.role"
  >
    <div class="bublle">
      {{ message.content }}
    </div>
  </div>
</template>

<style>
.message {
  display: flex;
  margin-bottom: 12px;
}

/* 角色不同，消息位置不同 */
.message.user {
  justify-content: flex-end;
}

.message.assistant {
  justify-content: flex-start;
}

.bubble {
  max-width: 70%;
  padding: 10px;
  border-radius: 8px;
  background: #f2f2f2;
}

.message.user .bubble {
  background: #007aff;
  color: white;
}
</style>