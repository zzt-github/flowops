import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // 登录状态失效
    if (error.response?.status === 401) {
      localStorage.removeItem('token')

      window.location.href = '/login'
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      '请求失败'

    ElMessage.error(message)

    return Promise.reject(error)
  }
)

export default request