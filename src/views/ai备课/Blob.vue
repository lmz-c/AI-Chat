<template>
  <div>
    <input type="file" @change="handleFileChange" />
    <button @click="uploadFile">上传</button>
    <div>进度：{{ progress }}%</div>
  </div>
</template>

<script setup>
import {ref} from 'vue';
import SparkMD5 from 'spark-md5';  //用于生成文件hash
const file = ref(null);
const progress = ref(0);
const chunkSize = 2 * 1024 * 1024; // 每个分片大小 2MB

const handleFileChange = (event) => {
  // files 是一个 FileList 对象，包含所有选中的文件,和length属性
  console.log(event.target.files[0]);
  console.log(event.target.files);
  
  file.value = event.target.files[0];
};

// const getFileHash = (file)=>{
//   return new Promise((resolve)=>{
//     const reader = new FileReader()
//     const spark = new SparkMD5.ArrayBuffer()
//     reader.onload = (e)=>{
//       // 把读取到的二进制内容加到 spark 里
//       spark.append(e.target.result)
//       const hash = spark.end()
//       resolve(hash)
//     }
//   })
// }

// const uploadFile = async ()=>{
//   if(!file.value)return
// // 生成文件的独有hash值
//   const hash = await getFileHash(file.value)
// // 切片
//   const chunks = []
//   let cur = 0
//   while(cur<file.value.size){
//     chunks.push(file.value.slice(cur,cur+chunkSize))
//     cur+= chunkSize
//   }
// 上传切片
let uploaded = 0
//   await Promise.all(
//     chunks.map((chunk, index) => {
//       const form = new FormData()
//       form.append("file", chunk)
//       form.append("hash", hash)
//       form.append("index", index)

//       return axios.post("http://localhost:3000/upload", form).then(() => {
//         uploaded++
//         progress.value = Math.round((uploaded / chunks.length) * 100)
//       })
//     })
//   )
//   // 通知后端合并
//   await axios.post("http://localhost:3000/merge", { hash, total: chunks.length })
//   alert("上传完成！")
// }
                        
</script>