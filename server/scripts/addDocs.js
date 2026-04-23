const pool = require("../db")
const { getEmbedding } = require("../utils/embedding")

async function addDoc(content) {
  const embedding = await getEmbedding(content)

  await pool.query(
    "INSERT INTO documents (id, content, embedding) VALUES (?, ?, ?)",
    [
      Date.now().toString(),
      content,
      JSON.stringify(embedding)
    ]
  )
}

// 测试数据
async function run() {
  await addDoc("Vue 是一个前端框架")
  await addDoc("React 是由 Facebook 开发的")
  await addDoc("Node.js 是后端运行环境")

  console.log("插入完成")
}

run()