import './assets/main.scss'
// 1. 基础导入
import VMdPreview from '@kangc/v-md-editor/lib/preview'
import '@kangc/v-md-editor/lib/style/preview.css'
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js'

// 2. 必需依赖
import hljs from 'highlight.js'
import Prism from 'prismjs'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './stores/index.js'

VMdPreview.use(githubTheme, {
    Hljs: hljs,  // 必须传递 highlight.js 实例
    Prism: Prism // 部分主题需要 prismjs
  })
const app = createApp(App)
app.use(VMdPreview)
app.use(pinia)
app.use(router)

app.mount('#app')
