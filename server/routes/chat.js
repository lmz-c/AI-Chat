const express = require("express")
const OpenAI = require("openai")
const pool = require("../db");
const router = express.Router()
const { buildPrompt } = require("../utils/promptBuilder")


const client = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY
})
// 历史消息
async function getHistoryMessages(conversationId) {
  const [rows] = await pool.query(
    "SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT 10",
    [conversationId]
  )

  return rows.map(row => ({
    role: row.role,
    content: row.content
  }))
}

// 生成标题（RAG预留）
async function generateTitle(message) {

  const completion = await client.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      {
        role: "system",
        content: "请用10个字以内总结用户问题作为标题"
      },
      {
        role: "user",
        content: message
      }
    ]
  })

  return completion.choices[0].message.content
}

router.get("/chat-stream", async (req, res) => {
  const message = req.query.message
  const conversationId = req.query.conversationId;

  console.log("conversationId:", conversationId);

  res.setHeader("Content-Type", "text/event-stream")
  res.setHeader("Cache-Control", "no-cache")
  res.setHeader("Connection", "keep-alive")

  res.flushHeaders()

  try {
    // 👉 1. 存用户消息  
    await pool.query(
      "INSERT INTO messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)",
      [Date.now() + "-user", conversationId, "user", message]
    );

    // 👉 2️⃣ 查历史对话
    const history = await getHistoryMessages(conversationId)

    // 👉 3️⃣ 构建 Prompt
    const messages = buildPrompt({
      message,
      history,
      context: null
    })

    const [rows] = await pool.query(
      "SELECT COUNT(*) as count FROM messages WHERE conversation_id = ?",
      [conversationId]
    )
    const isFirstMessage = rows[0].count === 1
    if (isFirstMessage) {
      const title = await generateTitle(message)

      await pool.query(
        "UPDATE conversations SET title = ? WHERE id = ?",
        [title, conversationId]
      )
      // 后端主动把标题推送给前端
      res.write(`event: title\ndata: ${title}\n\n`)
    }

    // 2. 调AI
    const completion = await client.chat.completions.create({
      model: "deepseek-chat",
      messages, 
      stream: true
    });

    let fullAnswer = "";

    // 3. 流式返回 + 拼接
    for await (const chunk of completion) {
      const token = chunk.choices[0]?.delta?.content;

      if (token) {
        fullAnswer += token;

        res.write(`data: ${token}\n\n`);
      }
    }

    // 4. 存AI回复
    await pool.query(
      "INSERT INTO messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)",
      [Date.now() + "-assistant", conversationId, "assistant", fullAnswer]
    );

    res.write("data: [DONE]\n\n");
    res.end();

  } catch (err) {
    console.error(err);
    res.write(`data: error\n\n`);
    res.end();
  }

})

module.exports = router