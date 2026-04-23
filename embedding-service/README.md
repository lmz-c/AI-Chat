# Embedding 服务（方案 A）

使用 SentenceTransformers 的 `all-MiniLM-L6-v2`（384 维），与 Node 侧 `server/utils/embedding.js` 通过 HTTP 对接。

## 一次性环境

```powershell
cd embedding-service
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

## 国内网络 / SSL 报错（`UNEXPECTED_EOF_WHILE_READING`）

首次启动要从 HuggingFace 拉模型；若直连 `huggingface.co` 不稳定，任选其一：

### 方式 1：镜像（推荐）

在 **同一终端** 里先设置再启动（或写入本目录 `.env`，已支持 `python-dotenv` 自动加载）：

```powershell
# PowerShell 当前会话
$env:HF_ENDPOINT = "https://hf-mirror.com"
uvicorn main:app --host 127.0.0.1 --port 8765
```

或复制 `.env.example` 为 `.env`，保留 `HF_ENDPOINT=https://hf-mirror.com`。

### 方式 2：本地模型目录

从镜像站浏览器下载 `sentence-transformers/all-MiniLM-L6-v2` 到本地文件夹后：

```env
EMBEDDING_MODEL_PATH=D:\你的路径\all-MiniLM-L6-v2
```

（不要加引号；路径用反斜杠或正斜杠均可。）

## 启动

```powershell
.\.venv\Scripts\activate
uvicorn main:app --host 127.0.0.1 --port 8765
```

健康检查：<http://127.0.0.1:8765/health>

## Node 侧

在 `server/.env` 中设置（可选，默认即该地址）：

```env
EMBEDDING_SERVICE_URL=http://127.0.0.1:8765
```

然后再运行 `node server/scripts/addDocs.js` 或启动 Express。
