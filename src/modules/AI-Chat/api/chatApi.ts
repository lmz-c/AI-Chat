export function startStream(
  message: string, 
  conversationId: string, 
  onToken: (token: string) => void
) {
  const es = new EventSource(
    `http://localhost:3000/chat-stream?message=${message}&conversationId=${conversationId}`
  )

  es.onmessage = (event) => {
      console.log("SSE:", event.data)
    if (event.data === "[DONE]") {
      es.close()
      return
    }

    onToken(event.data)

  }

}