import {defineStore} from 'pinia'
import {reactive, ref} from 'vue'
import {getppt, getppturl} from '@/api/ppt'

export const usePPTStore = defineStore('ai-ppt', () => {
    let pptquery = reactive({
        outline: {
            title: "",
            subtitle: "",
            chapters: []
        },
        templateId: "",
        language: "",
        query: "",
    })
    let pptList = ref({})
    let pptstatus = reactive({
        aiImageStatus: '',
        pptUrl: '',
        pptStatus: '',
        cardNoteStatus: '',
    })
    const setQuery = (data) => {
        pptquery = data
    }
    const getQuery = () => {
        console.log(getQuery);

        return pptquery
    }
    const getPPTList = async () => {
        console.log(pptquery);
        const res = await getppt(pptquery)
        console.log(res);
        pptList.value = res
        console.log(pptList.value);
        return pptList.value
    }
    const pptprogress = async () => {

        const res = await getppturl(pptList.value.sid)
        console.log(res);
        return res


    }

    return {
        pptquery,
        pptstatus,
        setQuery,
        getQuery,
        pptList,
        getPPTList,
        pptprogress
    }

}, {
    persist: true
})