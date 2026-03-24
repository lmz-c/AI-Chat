import { defineStore } from "pinia"
import { startStream } from "../api/chatApi"
import type { Message } from "../types/message"
import { useConversationStore } from "./conversationStore"

export const useChatStore = defineStore("chat", () => {

  const conversationStore = useConversationStore()

  function sendMessage(text: string) {
    console.log("发送消息:", text)

    if (!text.trim()) return

    if (!conversationStore.currentConversation) {
      conversationStore.createConversation()
    }

    const conversationId = conversationStore.currentConversation?.id
    if (!conversationId) return

    const current = conversationStore.currentConversation
    if (!current) return

    // ✅ 用户消息
    const userMessage: Message = {
      id: Date.now() + "-user",
      role: "user",
      content: text
    }

    current.messages.push(userMessage)

    // ✅ AI消息（占位）
    const assistantMessage: Message = {
      id: Date.now() + "-assistant",
      role: "assistant",
      content: ""
    }

    current.messages.push(assistantMessage)

    // ====== buffer优化 ======
    let tokenBuffer = ""
    let timer: number | null = null

    startStream(text, conversationId, async (token) => {

      if (token === "[DONE]") {

        if (timer) {
          clearInterval(timer)
          timer = null
        }

        flush()
        await conversationStore.loadConversations()
        return
      }

      tokenBuffer += token

      if (!timer) {
        timer = window.setInterval(flush, 50)
      }

    })

    // 🔥 关键：强制触发响应式更新
    function flush() {

      if (!tokenBuffer) return

      const index = current.messages.findIndex(
        m => m.id === assistantMessage.id
      )

      if (index !== -1) {

        current.messages[index] = {
          ...current.messages[index],
          content: current.messages[index].content + tokenBuffer
        }

      }

      tokenBuffer = ""
    }

  }

  return {
    sendMessage
  }

})