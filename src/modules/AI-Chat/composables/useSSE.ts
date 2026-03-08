export function startSSE(
  url: string,
  onToken: (token: string) => void
) {

  const eventSource = new EventSource(url)

  eventSource.onmessage = (event) => {

    onToken(event.data)

  }

  eventSource.onerror = () => {

    eventSource.close()

  }

}