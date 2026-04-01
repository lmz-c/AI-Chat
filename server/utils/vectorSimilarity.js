/**
 * 向量相似度工具（与 Python 侧 normalize_embeddings=True 配合时，点积≈余弦相似度）
 */

function dotProduct(a, b) {
  if (!a.length || a.length !== b.length) return null
  let s = 0
  for (let i = 0; i < a.length; i++) s += a[i] * b[i]
  return s
}

function norm(vec) {
  let s = 0
  for (let i = 0; i < vec.length; i++) s += vec[i] * vec[i]
  return Math.sqrt(s)
}

/**
 * 余弦相似度，范围约 [-1, 1]
 */
function cosineSimilarity(a, b) {
  if (!a.length || a.length !== b.length) return -Infinity
  const na = norm(a)
  const nb = norm(b)
  if (na === 0 || nb === 0) return 0
  return dotProduct(a, b) / (na * nb)
}

module.exports = { dotProduct, cosineSimilarity }
