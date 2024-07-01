import axios from 'axios'
import { ElMessage } from 'element-plus'

const service = axios.create({
    baseURL: import.meta.env.VITE_APP_BASE_URL,
    // headers: {
    //     'Content-Type': 'application/json',
    // },
    timeout: 5000 // request timeout
})

// request interceptor 请求拦截器
service.interceptors.request.use(
    config => {
        let token = localStorage.getItem("access_token")
        if (token !== undefined) {
            config.headers['Authorization'] = 'Bearer ' + token
        }
        return config
    },
    error => {
        console.log(error)
        return Promise.reject(error)
    }
)

// response interceptor 响应拦截器
service.interceptors.response.use(
    response => {
        const res = response.data

        if (res.code !== 200) {
            ElMessage({
                message: res.msg || 'Error',
                type: 'error',
                duration: 3 * 1000
            })
            // token 无效处理
            if (res.code === 1234) {
                setTimeout(() => {
                    localStorage.removeItem("access_token")
                    localStorage.removeItem("refresh_token")
                    window.location.href = "/login"
                }, 1200)
            }
            return Promise.reject(new Error(res.msg || 'Error'))
        } else {
            return res
        }
    },
    error => {
        console.log('err' + error) // for debug
        ElMessage({
            message: error.message,
            type: 'error',
            duration: 3 * 1000
        })
        return Promise.reject(error)
    }
)

export default service