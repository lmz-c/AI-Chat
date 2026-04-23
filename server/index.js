// express框架，用于创建 Web 服务器和 API 端点
const express = require('express');
// 导入CROS中间件，允许跨域请求
const cors = require('cors');
// 加载环境变量配置文件 .env 中的变量到 process.env 中
require('dotenv').config();
const chatRouter = require('./routes/chat');
const conversationRouter = require("./routes/conversation")

const app = express();

app.use(cors());
app.use(express.json());

// 将所有以 /chat开头的请求转发给 chatRouter处理
app.use('/', chatRouter);
app.use("/", conversationRouter)

app.listen(3000, () => {
  console.log('Server is running on port 3000');
})