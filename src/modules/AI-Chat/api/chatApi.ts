export async function startStream(
  message: string,
  conversationId: string,
  onToken: (token: string) => void,
  onTitle?: (title: string) => void
) {
  console.log("fetch stream start")

  const res = await fetch("http://localhost:3000/chat-stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message,
      conversationId
    })
  })

  const reader = res.body?.getReader()
  const decoder = new TextDecoder("utf-8")

  if (!reader) return

  let buffer = "" // 用来拼接半包数据

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })

    //按 SSE 格式拆分（\n\n）
    const parts = buffer.split("\n\n")

    // 最后一段可能不完整，留着
    buffer = parts.pop() || ""

    for (const part of parts) {

      // 解析 event
      let event = "message"
      let data = ""

      const lines = part.split("\n")

      for (const line of lines) {
        if (line.startsWith("event:")) {
          event = line.replace("event:", "").trim()
        }
        if (line.startsWith("data:")) {
          data += line.replace("data:", "").trim()
        }
      }

      //分发事件
      if (event === "title") {
        console.log("title:", data)
        onTitle && onTitle(data)
      } else {
        if (data === "[DONE]") {
          onToken("[DONE]")
          return
        }

        onToken(data)
      }
    }
  }
} 