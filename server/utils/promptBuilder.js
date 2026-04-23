function buildPrompt({ message, history, context }) {

  // 1️⃣ system（角色）
  const systemPrompt = `
你是一个专业AI助手，请遵守：
- 使用 Markdown 格式回答
- 结构清晰（标题 + 列表）
- 不输出 HTML 标签
- 代码必须使用 \`\`\`
`

  // 2️⃣ context（RAG预留）
  let contextPrompt = ""
  if (context) {
    contextPrompt = `参考资料：\n${context}\n\n`
  }

  // 3️⃣ user prompt（动态拼接）
  const userPrompt = `
${contextPrompt}
用户问题：
${message}
`

  // 4️⃣ history（限制长度，防止token爆炸）
  const limitedHistory = history.slice(-6)

  return [
    { role: "system", content: systemPrompt },
    ...limitedHistory,
    { role: "user", content: userPrompt }
  ]
}

module.exports = { buildPrompt }