import { defineStore } from "pinia"
import { startStream } from "../api/chatApi"
import type { Message } from "../types/message"
import { useConversationStore } from "./conversationStore"
import { log } from "console"

export const useChatStore = defineStore("chat", () => {

  const conversationStore = useConversationStore()

  async function sendMessage(text: string) {
    console.log("sendMessage调用，发送消息:", text)

    if (!text.trim()) return

    if (!conversationStore.currentConversation && conversationStore.isReady) {
      // 不加的话，执行到下一步，conversationId会是undefined，导致请求失败，直接return
      await conversationStore.createConversation()
    }

    const conversationId = conversationStore.currentConversation?.id
    if (!conversationId) return

    const current = conversationStore.currentConversation
    if (!current) return

    // 用户消息
    const userMessage: Message = {
      id: Date.now() + "-user",
      role: "user",
      content: text
    }

    current.messages.push(userMessage)

    // AI消息（占位）
    const assistantMessage: Message = {
      id: Date.now() + "-assistant",
      role: "assistant",
      content: "",
      done: false
    }

    current.messages.push(assistantMessage)

    // ====== buffer优化 ======
    let tokenBuffer = ""
    let timer: number | null = null

    startStream(
      text, 
      conversationId, 
      async (token) => {

      if (token.trim() === "[DONE]") {
        if (timer) {
          clearInterval(timer)
          timer = null
        }
        flush()
        assistantMessage.done = true
        const beforeReloadLen = conversationStore.messages.length
        await conversationStore.loadConversations()
        const afterLoadLen = conversationStore.messages.length
        // 关键：loadConversations() 只返回会话列表，不返回 messages
        // 不先 switchConversation 拉取消息，UI 会先变空白，直到用户手动切换会话。
        await conversationStore.switchConversation(conversationId)
        const afterSwitchLen = conversationStore.messages.length
        conversationStore.forceUpdate() // 强制更新，确保UI刷新
        
        console.log("DONE reload lens", {
          conversationId,
          beforeReloadLen,
          afterLoadLen,
          afterSwitchLen,
        })

        return
      }

      tokenBuffer += token

      if (!timer) {
        timer = window.setInterval(flush, 50)
      }

    }),
      (title) => {
        if (conversationStore.currentConversation) {
          conversationStore.currentConversation.title = title
          conversationStore.forceUpdate()
        }
      }

    // 关键：强制触发响应式更新
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