const { getEmbedding } = require("./embedding")
const { cosineSimilarity } = require("./vectorSimilarity")

const DEFAULT_TOP_K = 3

/**
 * 从 documents 表做向量检索，拼成 RAG 用的 context 字符串
 * @param {import("mysql2/promise").Pool} pool
 * @param {string} userMessage
 * @param {{ topK?: number }} [options]
 * @returns {Promise<string|null>} 无资料或失败时返回 null（聊天仍可继续，只是不带 RAG）
 */
async function retrieveRagContext(pool, userMessage, options = {}) {
  const topK = options.topK ?? DEFAULT_TOP_K
  const q = (userMessage || "").trim()
  if (!q) return null

  let queryVec
  try {
    queryVec = await getEmbedding(q)
  } catch (e) {
    console.error("[RAG] getEmbedding failed:", e.message)
    return null
  }

  const [rows] = await pool.query(
    "SELECT id, content, embedding FROM documents"
  )

  const scored = []
  for (const row of rows) {
    let vec
    try {
      vec = typeof row.embedding === "string"
        ? JSON.parse(row.embedding)
        : row.embedding
    } catch {
      continue
    }
    if (!Array.isArray(vec) || vec.length !== queryVec.length) continue

    const score = cosineSimilarity(queryVec, vec)
    if (Number.isFinite(score)) {
      scored.push({ content: row.content, score })
    }
  }

  if (scored.length === 0) return null

  scored.sort((a, b) => b.score - a.score)
  const picked = scored.slice(0, topK)

  return picked
    .map((item, i) => `[片段${i + 1}]（相关度 ${item.score.toFixed(4)}）\n${item.content}`)
    .join("\n\n---\n\n")
}

module.exports = { retrieveRagContext }
