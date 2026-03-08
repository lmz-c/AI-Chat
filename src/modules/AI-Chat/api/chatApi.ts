export function startStream(
  message: string,
  onToken: (token: string) => void
) {

  const url =
    "http://localhost:3000/chat-stream?message=" +
    encodeURIComponent(message)

  const eventSource = new EventSource(url)

  eventSource.onmessage = (event) => {

    onToken(event.data)

  }

}