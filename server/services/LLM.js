const axios = require("axios")

async function chatWithLLM(messages) {

  const res = await axios.post(
    "https://api.deepseek.com/v1/chat/completions",
    {
      model: "deepseek-chat",
      messages
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`
      }
    }
  )

  return res.data.choices[0].message.content
}

module.exports = { chatWithLLM }