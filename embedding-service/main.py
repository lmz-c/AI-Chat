"""
本地 Embedding 服务（方案 A）：SentenceTransformers，供 Node 通过 HTTP 调用。
启动：uvicorn main:app --host 127.0.0.1 --port 8765

若访问 HuggingFace 出现 SSL / 超时，请先设置 HF_ENDPOINT（见 README）或使用本地模型目录 EMBEDDING_MODEL_PATH。
"""

from __future__ import annotations

import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional

# 必须在 import sentence_transformers 之前加载环境变量（HF_ENDPOINT 等）
try:
    from dotenv import load_dotenv

    load_dotenv(Path(__file__).resolve().parent / ".env")
except ImportError:
    pass

from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

# 默认与 sentence-transformers 文档一致；也可用 EMBEDDING_MODEL_PATH 指向已下载目录
DEFAULT_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
MODEL_LABEL = os.environ.get("EMBEDDING_MODEL_PATH") or os.environ.get(
    "EMBEDDING_MODEL", DEFAULT_MODEL
)
model: Optional[SentenceTransformer] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global model
    local_path = os.environ.get("EMBEDDING_MODEL_PATH")
    try:
        if local_path:
            model = SentenceTransformer(local_path)
        else:
            model = SentenceTransformer(os.environ.get("EMBEDDING_MODEL", DEFAULT_MODEL))
    except Exception as e:
        raise RuntimeError(
            "加载 SentenceTransformer 失败。若无法访问 huggingface.co，请：\n"
            "1) 在 PowerShell 中先执行: $env:HF_ENDPOINT='https://hf-mirror.com'\n"
            "   或在 embedding-service/.env 中设置 HF_ENDPOINT=https://hf-mirror.com\n"
            "2) 或从镜像站手动下载模型到本地文件夹，设置 EMBEDDING_MODEL_PATH=绝对路径\n"
            f"原始错误: {e}"
        ) from e
    yield


app = FastAPI(title="Embedding Service", lifespan=lifespan)


class EmbedRequest(BaseModel):
    text: str


@app.get("/health")
def health():
    return {"ok": True, "model": MODEL_LABEL}


@app.post("/embed")
def embed(req: EmbedRequest):
    if model is None:
        raise RuntimeError("Model not loaded")
    vec = model.encode(req.text, normalize_embeddings=True)
    return {"embedding": vec.tolist(), "dim": len(vec)}
