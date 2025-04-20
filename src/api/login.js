import request from '@/utils/request'
import { useUserStore } from '@/stores/user'
import axios from 'axios'
export function userregister({username,password,code,sessionId}){
    const res=request.post('/user/register',{
        username,
        password,
        code,
        sessionId
    })
    return res

}
export function userlogin({username,password,code,sessionId}){
    const res=request.post('/user/login',{
        username,
        password,
        code,
        sessionId
    })
    
    
    return res
}
export function usergetcode(){
    const res=request.get('/user/captcha')
    return res
}

export function changepassword(data){
    const userStore=useUserStore()
   
    
    const res=request.put('/user/updatepwd',{
        id:'1909186124295966720',
        oldPassword:'123456',
        newPassword:'123456'
    },{
        headers:{
            token:userStore.token
        }
    })
    return res
}



// export function changepassword(data){
//     const userStore=useUserStore()
//     console.log(data);
//     console.log(userStore.user.id);
//     const res=axios.put('http://47.108.75.31:8899/user/updatepwd',{
//         id:'1909186124295966720',
//         oldPassword:'123456',
//         newPassword:'123456'
//     })
//     return res

// }

export function changemsg(data){
   
    
    const userStore=useUserStore()
    const res=request.put('/user/update',{
        id:userStore.user.id,
        phone:data.phone,
        realName:data.realName,
        nickName:data.nickName,
        email:data.email,
        sex:parseInt(data.sex),
    })
    return res
}