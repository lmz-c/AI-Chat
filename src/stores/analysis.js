import { defineStore } from 'pinia'
import { getAnalysis,getAnalysislist,delAnalysis } from '@/api/analysis.js'
import { ref } from 'vue'
import { useUserStore } from './user'


export const useAnalysisStore = defineStore('analysis', () => {
  const analysisData = ref([])
  const userStore = useUserStore()
  let total=0;
  let  analysisList=ref([])
  const getAnalysisData = async (file) => {
   
      // 1. 创建新的 FormData 实例
      const formData = new FormData()
      
      // 2. 确保文件存在
      if (!file) {
        throw new Error('文件对象不存在')
      }
      
      // 3. 打印调试信息
      console.log('原始文件对象:', file)
      console.log('用户ID:', userStore.user.id)
      
      // 4. 正确添加字段到 FormData
      formData.append('id', userStore.user.id)
      formData.append('file', file) // 添加文件名作为第三个参数
      
      // 5. 验证 FormData 内容
      console.log('FormData 内容:')
      for (let [key, value] of formData.entries()) {
        console.log(key, value)
      }
      
      // 6. 发送请求
      const response = await getAnalysis(formData)
      console.log(response);
      let data=ref({})
      data.value = response;
      analysisData.value.push(data.value)
        console.log(analysisData.value);
        
        return response.data
  }
  const getAnalysisList=async(data)=>{
    
    
    const res=await getAnalysislist(data)
    console.log(res);
    
    total=res.total;
    analysisList.value=res.records;
  }
  const delanalysis=async(id)=>{
        const res=await delAnalysis(id)
        console.log(res);
        getAnalysisList()
        
    }

  return {
    analysisData,
    getAnalysisData,
    getAnalysisList,
    analysisList,
    total,
    delanalysis
  }
})