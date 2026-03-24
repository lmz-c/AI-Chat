import MarkdownIt from "markdown-it"
import hljs from "highlight.js"

const md = new MarkdownIt({
  html: false, // ❗禁止 HTML，防止 AI 插入 style/script
  linkify: true,
  breaks: true,
  highlight(code, lang) {

    if (lang && hljs.getLanguage(lang)) {

      const highlighted = hljs.highlight(code, {
        language: lang
      }).value

      return `<pre class="hljs"><code>${highlighted}</code></pre>`

    }

    return `<pre class="hljs"><code>${md.utils.escapeHtml(code)}</code></pre>`
  }
})

  // 修复AI生成的Markdown格式问题
  function fixMarkdown(text:string){

    // 1 修复 ##1 -> ## 1
    text = text.replace(/(#+)(\d)/g,"$1 $2")

    // 2 修复 javascriptfunction
    // text = text.replace(
    //   /(javascript|js|ts|html|css)(function|const|let)/g,
    //   "```$1\n$2"
    // )

    // 3 修复标题后没换行
    text = text.replace(/(#+ .*?)(javascript|js)/g,"$1\n\n```$2")

    // 4 自动补结束代码块
    const codeCount = (text.match(/```/g)||[]).length
    if(codeCount % 2 !== 0){
      text += "\n```"
    }

    return text
  }
export function renderMarkdown(content: string) {
  const fixed = fixMarkdown(content)
  return md.render(fixed)
}