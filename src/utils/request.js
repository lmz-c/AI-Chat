import axios from 'axios'
import {ElMessage} from 'element-plus'
import router from '@/router'
import {useUserStore} from '@/stores/user'


const baseURL = '/api'
const instance = axios.create({
    baseURL,
    timeout: 50000
})
instance.interceptors.request.use(config => {
    const userStore = useUserStore()
    const token = userStore.token
    if (token) {
        // console.log(token);

        config.headers['token'] = token
    }
    return config
}, error => {
    return Promise.reject(error)
})

instance.interceptors.response.use(response => {
        if (response.status === 200) {
            if (response.data.code == 0) {
                ElMessage.error(response.data.msg)
            }

            return response.data.data
        }
        ElMessage.error(response.data.msg)
        return Promise.reject(response.data)
    }, err => {
        if (err.response.status === 401) {
            router.push('/login')
        }
        if (err.response.status == 403) {
            //判断token过期
            const userStore = useUserStore()
            userStore.logout()
            ElMessage.error('登录过期，请重新登录')
            router.push('/login')
        }
        ElMessage.error(err.response.data.msg)
        return Promise.reject(err)
    }
)
export default instance