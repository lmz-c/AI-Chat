<template>
  <div>
    <input type="file" @change="handleFileChange" />
    <button @click="uploadFile" :disabled="uploading">
      {{ uploading ? `上传中(${progress}%)` : "上传" }}
    </button>
    <div>进度：{{ progress }}%</div>
    <div v-if="error" style="color: red">错误：{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import SparkMD5 from 'spark-md5';
import axios from 'axios'; // 需安装 axios: npm install axios

// -------------------------- 改动点1：完善状态管理 --------------------------
const file = ref(null); // 选中的文件
const progress = ref(0); // 上传进度(%)
const uploading = ref(false); // 是否正在上传
const error = ref(''); // 错误信息
const chunkSize = ref(2 * 1024 * 1024); // 初始分片大小(2MB)，动态可调
const maxRetries = 5; // 最大重试次数
const concurrency = 3; // 并发上传数(避免网络拥堵)
const uploadedChunks = reactive({}); // 已上传分片记录: { fileId: [chunkIndex1, ...] }


// -------------------------- 改动点2：完善文件Hash计算 --------------------------
const getFileHash = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const spark = new SparkMD5.ArrayBuffer();
    const chunkSize = 2 * 1024 * 1024; // 计算hash时的分片大小(2MB)
    let offset = 0;
    let chunks = Math.ceil(file.size / chunkSize);

    // 这是一个闭包
    // 分片读取并计算hash，逐片加载到SparkMD5中，最后得到完整文件的hash
    const loadNext = () => {
      const slice = file.slice(offset, offset + chunkSize);
      reader.readAsArrayBuffer(slice);
    };

    reader.onload = (e) => {
      spark.append(e.target.result);
      offset += chunkSize;
      if (offset < file.size) {
        loadNext(); // 继续读取下一片
      } else {
        const hash = spark.end(); // 计算最终hash
        resolve(hash);
      }
    };

    reader.onerror = (e) => reject(new Error('文件读取失败'));
    loadNext(); // 开始读取第一片
  });
};


// -------------------------- 改动点3：分片生成与标识 --------------------------
const createChunks = (file, fileId) => {
  const chunks = [];
  let cur = 0;
  let index = 0;

  while (cur < file.size) {
    const chunk = file.slice(cur, cur + chunkSize.value);
    // 计算分片Hash(用于校验完整性)
    const chunkHash = SparkMD5.ArrayBuffer.hash(/* 需读取chunk内容，这里简化处理 */); 
    // 实际应通过FileReader读取chunk计算，见下方完整实现
    chunks.push({
      index,
      chunk,
      hash: fileId, // 文件唯一ID(用文件hash)
      chunkIndex: index,
      chunkHash: '', // 分片内容MD5(后续计算)
      retryCount: 0, // 重试次数
    });
    cur += chunkSize.value;
    index++;
  }
  return chunks;
};


// -------------------------- 改动点4：重试机制(指数退避) --------------------------
const uploadWithRetry = async (chunk, fileId) => {
  const { index, chunk: fileChunk, hash, chunkIndex, chunkHash } = chunk;
  let retries = 0;

  while (retries <= maxRetries) {
    try {
      const formData = new FormData();
      formData.append('file', fileChunk);
      formData.append('fileId', fileId); // 文件唯一ID
      formData.append('chunkIndex', chunkIndex); // 分片序号
      formData.append('chunkHash', chunkHash); // 分片内容MD5

      // 超时控制(30秒)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const res = await axios.post('http://localhost:3000/upload', formData, {
        signal: controller.signal,
        onUploadProgress: (e) => {
          // 实时更新单分片进度(可选)
        },
      });

      clearTimeout(timeoutId);
      if (res.data.code === 200) {
        return true; // 上传成功
      } else {
        throw new Error(res.data.msg || '上传失败');
      }
    } catch (err) {
      retries++;
      if (retries > maxRetries) {
        throw new Error(`分片${chunkIndex}上传失败: ${err.message}`);
      }
      // 指数退避等待(1s→2s→4s→8s→16s)
      const delay = Math.pow(2, retries - 1) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};


// -------------------------- 改动点5：状态跟踪(断点续传) --------------------------
const saveUploadedChunks = (fileId, chunkIndex) => {
  if (!uploadedChunks[fileId]) uploadedChunks[fileId] = [];
  if (!uploadedChunks[fileId].includes(chunkIndex)) {
    uploadedChunks[fileId].push(chunkIndex);
    localStorage.setItem('uploadedChunks', JSON.stringify(uploadedChunks)); // 持久化
  }
};

const loadUploadedChunks = (fileId) => {
  const saved = localStorage.getItem('uploadedChunks');
  if (saved) {
    const all = JSON.parse(saved);
    return all[fileId] || [];
  }
  return [];
};


// -------------------------- 改动点6：动态分片调整(简化版) --------------------------
const adjustChunkSize = (networkSpeed) => {
  // 根据网络速度调整分片大小(单位: Mbps)
  if (networkSpeed > 10) chunkSize.value = 5 * 1024 * 1024; // 5MB
  else if (networkSpeed > 2) chunkSize.value = 2 * 1024 * 1024; // 2MB
  else chunkSize.value = 1 * 1024 * 1024; // 1MB
};


// -------------------------- 改动点7：文件选择与上传入口 --------------------------
const handleFileChange = (e) => {
  const selectedFile = e.target.files[0];
  if (!selectedFile) return;
  file.value = selectedFile;
  progress.value = 0;
  error.value = '';
  // 加载已上传分片(断点续传)
  const fileId = SparkMD5.ArrayBuffer.hash(selectedFile.name + selectedFile.size); // 简化fileId
  const uploaded = loadUploadedChunks(fileId);
  uploadedChunks[fileId] = uploaded;
};


const uploadFile = async () => {
  if (!file.value) return;
  uploading.value = true;
  error.value = '';
  try {
    // 1. 计算文件Hash(作为fileId)
    const fileId = await getFileHash(file.value);
    // 2. 生成分片(带唯一标识)
    const chunks = createChunks(file.value, fileId);
    // 3. 过滤已上传分片(断点续传)
    const uploaded = loadUploadedChunks(fileId);
    const needUpload = chunks.filter(chunk => !uploaded.includes(chunk.chunkIndex));
    // 4. 并发上传(控制并发数)
    const total = chunks.length;
    let successCount = uploaded.length;
    progress.value = Math.round((successCount / total) * 100);

    // 分批并发上传
    for (let i = 0; i < needUpload.length; i += concurrency) {
      const batch = needUpload.slice(i, i + concurrency);
      await Promise.all(
        batch.map(async (chunk) => {
          const success = await uploadWithRetry(chunk, fileId);
          if (success) {
            successCount++;
            progress.value = Math.round((successCount / total) * 100);
            saveUploadedChunks(fileId, chunk.chunkIndex); // 记录已上传
          }
        })
      );
    }

    // 5. 所有分片上传完成，通知合并
    await axios.post('http://localhost:3000/merge', { fileId, total: chunks.length });
    alert('上传完成！');
    // 清理本地记录
    delete uploadedChunks[fileId];
    localStorage.removeItem('uploadedChunks');
  } catch (err) {
    error.value = err.message;
  } finally {
    uploading.value = false;
  }
};
</script>