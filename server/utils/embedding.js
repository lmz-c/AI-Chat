const axios = require("axios")
const path = require("path")

require("dotenv").config({
  path: path.resolve(__dirname, "../.env")
})

const DEFAULT_URL = "http://127.0.0.1:8765"

function baseUrl() {
  const u = process.env.EMBEDDING_SERVICE_URL || DEFAULT_URL
  return u.replace(/\/$/, "")
}

/**
 * 调用本地 Python embedding 服务（见项目根目录 embedding-service/）
 * @param {string} text
 * @returns {Promise<number[]>}
 */
async function getEmbedding(text) {
  const url = `${baseUrl()}/embed`
  const res = await axios.post(
    url,
    { text },
    {
      timeout: 120000,
      validateStatus: () => true
    }
  )

  if (res.status >= 400) {
    const msg = res.data && typeof res.data === "object"
      ? JSON.stringify(res.data)
      : String(res.data)
    throw new Error(`Embedding service ${res.status}: ${msg}`)
  }

  const emb = res.data && res.data.embedding
  if (!Array.isArray(emb)) {
    throw new Error("Embedding service returned invalid body (missing embedding array)")
  }

  return emb
}

module.exports = { getEmbedding }
