export interface Message {

  id: string

  role: "user" | "assistant"

  content: string
  done?:boolean
}