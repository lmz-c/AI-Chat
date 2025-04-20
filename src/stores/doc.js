import { defineStore } from 'pinia'
import {getWordList,getWordListById} from '@/api/word.js'
import {ref} from 'vue'
import { delDoc } from '@/api/word.js'
export const useDocStore=defineStore(
    'ai-doc',
    ()=>{
    let total=ref(0)
    let docList=ref([])
    let currentDoc=ref({})
    let editingMessage = ref({});
    const getDocList=async(data)=>{
        console.log(data);
        
        const res=await getWordList(data)
        console.log(res);
        
        total.value=res.total;
        docList.value=[]
        docList.value=res.records;
        console.log(docList.value);
        
        return docList.value 
    }
    const editDoclist=(data)=>{
        
    }
    const delDoclist=async(id)=>{
        const res=await delDoc(id)
        console.log(res);
        
    }
    const getDocListById=async(id)=>{
        console.log(id);
        const res=await getWordListById(id)
        console.log(res);
        docList.value=[res]
        currentDoc.value=null
        currentDoc.value=res
        console.log(currentDoc.value);
        console.log(docList.value);
        return docList.value
    }

    return {
        docList,
        getDocList,
        total,
        currentDoc,
        getDocListById,
        editDoclist,
        delDoclist,
        editingMessage
    }
})