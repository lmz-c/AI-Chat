<script setup lang="ts">
import { ref } from 'vue'
// 子传父
const emit = defineEmits<{
  (e:"send",text:string):void
}>()
// 响应式数据
const input = ref("")

const send = () =>{
  console.log(111);
  
  if(!input.value.trim()) return //非空

  emit("send", input.value)

  input.value = ""
}
const handleKey = (e:KeyboardEvent) => {
  // 按下Enter键且没有按下Shift键时发送消息
  if(e.key === "Enter" && !e.shiftKey){
    e.preventDefault()
    send()
  }
}
</script> 

<template>
  <div class="chat-input">
    <textarea
      v-model="input"
      placeholder="请输入你的问题..."
      @keydown="handleKey"
    >
    <button @click="send">
      发送
    </button>
    </textarea>
  </div>
  
</template>

<style scoped>
  .chat-input {
  display: flex;
  padding: 10px;
  border-top: 1px solid #eee;
}

textarea {
  flex: 1;
  resize: none;
  padding: 8px;
}

button {
  margin-left: 10px;
}
</style>