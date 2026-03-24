export async function getConversations() {
  const res = await fetch("http://localhost:3000/conversations")
  return res.json()
}

export async function getMessages(conversationId: string) {
  const res = await fetch(
    `http://localhost:3000/messages?conversationId=${conversationId}`
  )
  return res.json()
}

export async function createConversationApi() {
  const res = await fetch("http://localhost:3000/conversation", {
    method: "POST"
  })
  return res.json()
}