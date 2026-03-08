import { defineStore } from "pinia"
import { ref } from "vue"
import { Message } from "../types/message"
import { startStream } from "../api/chatApi"

export const useChatStore = defineStore("chat", () => {

  const messages = ref<Message[]>([])

  const loading = ref(false)

  const sendMessage = async (text: string) => {

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text
    }

    messages.value.push(userMessage)

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: ""
    }

    messages.value.push(assistantMessage)

    loading.value = true

    startStream(text, (token) => {

      assistantMessage.content += token

    })

  }

  return {

    messages,
    loading,
    sendMessage

  }

})