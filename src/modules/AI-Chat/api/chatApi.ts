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
      // 先进入chatstore的onToken回调，再关闭SSE连接,及时刷新UI，不然会直接关闭连接，UI不会刷新
      onToken("[DONE]")
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