export function startStream(
  message: string, 
  conversationId: string, 
  onToken: (token: string) => void,
  onTitle?: (title: string) => void 
) {
  console.log("Starting stream调用")
  const es = new EventSource(
    `http://localhost:3000/chat-stream?message=${message}&conversationId=${conversationId}`
  )

  
  // 默认消息（token流）
  es.addEventListener("message", (event) => {
    const data = event.data

    console.log("SSE message:", data)

    if (data === "[DONE]") {
      es.close()
      return
    }

    onToken(data)
  })

  // 新增：标题事件
  es.addEventListener("title", (event) => {
    const title = event.data
    console.log("SSE title:", title)

    if (onTitle) {
      onTitle(title)
    }
  })

  //  错误处理
  es.onerror = (err) => {
    console.error("SSE error:", err)
    es.close()
  }
}