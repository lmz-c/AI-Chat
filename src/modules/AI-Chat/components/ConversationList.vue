<script setup lang="ts">
import { onMounted ,watch} from "vue"
import { useConversationStore } from "../store/conversationStore"

const conversationStore = useConversationStore()

// 逻辑是：先加载会话列表 -> 如果有就选中第一个 -> 没有就创建一个
onMounted(async () => {

  await conversationStore.loadConversations()

  if (conversationStore.conversations.length > 0) {

    //选中第一个
    const first = conversationStore.conversations[0]

    await conversationStore.switchConversation(first.id)

  } else {

    //没有才创建
    await conversationStore.createConversation()

    }
    const savedId = localStorage.getItem("currentConversationId")

    if (savedId) {
      await conversationStore.switchConversation(savedId)
    }

})

// 记住当前会话ID（刷新后仍然选中）
watch(
  () => conversationStore.currentConversationId,
  (id) => {
    if (id) {
      localStorage.setItem("currentConversationId", id)
    }
  }
)
// 不异步的话，用户点击新建会话后，界面还停留在旧会话，直到新会话创建完成并切换过去，体验不好
async function handleCreate() {
  await conversationStore.createConversation()
}

async function handleSwitch(id: string) {
  await conversationStore.switchConversation(id)
}
</script>

<template>
  <div class="sidebar">
    
    <button @click="handleCreate()">+ 新对话</button>

    <div
      v-for="c in conversationStore.conversations"
      :key="c.id"
      @click="handleSwitch(c.id)"
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