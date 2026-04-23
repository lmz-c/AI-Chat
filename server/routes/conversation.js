const express = require("express")
const pool = require("../db")
const router = express.Router()

console.log("conversation router loaded")
// 获取会话列表
router.get("/conversations", async (req, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM conversations ORDER BY created_at DESC"
  )
  res.json(rows)
})

// 获取消息
router.get("/messages", async (req, res) => {
  const { conversationId } = req.query

  const [rows] = await pool.query(
    "SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC",
    [conversationId]
  )

  res.json(rows)
})

// 创建会话
router.post("/conversation", async (req, res) => {
  const id = Date.now().toString()

  await pool.query(
    "INSERT INTO conversations (id, title) VALUES (?, ?)",
    [id, "新对话"]
  )

  res.json({ id, title: "新对话" })
})

module.exports = router