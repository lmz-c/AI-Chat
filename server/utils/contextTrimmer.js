// 上下文修剪，限制最大token数，避免token爆炸
function trimMessages(messages, maxTokens = 3000) {

    let total = 0
    const result = []
  
    // 从后往前保留（最近优先）
    for (let i = messages.length - 1; i >= 0; i--) {
  
      const msg = messages[i]
      const tokens = estimateTokens(msg.content)
  
      if (total + tokens > maxTokens) break
  
      total += tokens
      result.unshift(msg)
    }
  
    return result
  }
  
  function estimateTokens(text) {
    return Math.ceil(text.length / 4)
  }
  
  module.exports = {
    trimMessages
  }