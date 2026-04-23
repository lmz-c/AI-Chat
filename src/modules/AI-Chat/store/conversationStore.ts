import { defineStore } from "pinia"
import { ref, computed } from "vue"
import type { Conversation } from "../types/conversation"
import type { Message } from "../types/message"
import { getConversations, getMessages, createConversationApi } from "../api/conversationApi"

export const useConversationStore = defineStore("conversation", () => {

  const conversations = ref<Conversation[]>([])

  const currentConversationId = ref<string | null>(null)
  const isReady = ref(false)

  const currentConversation = computed(() => {
    return conversations.value.find(
      c => c.id === currentConversationId.value
    )
  })

  const messages = computed(() => {
    return currentConversation.value?.messages || []
  })

  async function createConversation(){

  const newConv = await createConversationApi()

  conversations.value.unshift({
    ...newConv,
    messages:[]
  })

  currentConversationId.value = newConv.id
}

  async function switchConversation(id: string) {

    currentConversationId.value = id

    const msgs = await getMessages(id)

    const conv = conversations.value.find(c => c.id === id)

    if (conv) {
      conv.messages = msgs
    }

  }

  function addMessage(message:Message){

    if(!currentConversation.value) return

    currentConversation.value.messages.push(message)
  }
  function forceUpdate() {
  conversations.value = [...conversations.value]
}
  async function loadConversations() {
  conversations.value = await getConversations()
  isReady.value = true
}

  return {
    conversations,
    currentConversationId,
    currentConversation,
    messages,
    isReady,
    createConversation,
    switchConversation,
    addMessage,
    forceUpdate,
    loadConversations
  }

})