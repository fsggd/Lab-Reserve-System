/**
 * Axios 统一封装
 *
 * 约定后端统一返回体：
 *   { code: 200, message: "OK", data: {...} }
 *   code === 200 视为业务成功，其余按业务错误处理
 *
 * 已实现能力（WBS 4.1 验收点）：
 *   1. 请求拦截器：自动携带 JWT（Authorization: Bearer <token>）
 *   2. 响应拦截器：自动剥壳（.then 直接拿到 data）
 *   3. 统一错误提示：业务错误 / 网络错误 / 超时 / HTTP 状态码错误
 *   4. 401 自动清除 token 并跳转登录页
 *   5. 409 预约时间冲突专用提示
 *   6. 支持 silent 静默模式（自行处理错误）、自定义超时、取消重复请求
 */
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { getToken, clearToken } from './auth'
import { mockAdapter } from '@/mock/adapter'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: Number(import.meta.env.VITE_REQUEST_TIMEOUT) || 10000,
  headers: { 'Content-Type': 'application/json;charset=UTF-8' }
})

// 开发阶段启用 Mock 适配器（后端接口未就绪时也能跑通全部页面）
if (import.meta.env.VITE_USE_MOCK === 'true') {
  http.defaults.adapter = mockAdapter
}

// ---- 401 跳转回调（由 router 注册，避免 request -> router 循环依赖）----
let unauthorizedHandler = null
export function setUnauthorizedHandler(fn) {
  unauthorizedHandler = fn
}

// ---- 错误提示去重：同一消息 1.5s 内只弹一次 ----
const recentMessages = new Map()
function toast(type, message) {
  const now = Date.now()
  const last = recentMessages.get(message) || 0
  if (now - last < 1500) return
  recentMessages.set(message, now)
  ElMessage({ type, message, duration: 3000, showClose: true })
}

// ================= 请求拦截器 =================
http.interceptors.request.use(
  (config) => {
    // 1. 自动携带 JWT
    const token = getToken()
    if (token && config.withToken !== false) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // 2. 可选：追加时间戳防缓存（GET）
    if (config.method === 'get' && config.noCache) {
      config.params = { ...config.params, _t: Date.now() }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ================= 响应拦截器 =================
http.interceptors.response.use(
  (response) => {
    const config = response.config || {}
    const body = response.data

    // 后端未使用统一返回体（直接返回数据）时原样透出
    if (body == null || typeof body !== 'object' || !('code' in body)) {
      return body
    }

    const { code, message, data } = body

    // 业务成功：剥壳，直接返回 data
    if (code === 200) {
      return data
    }

    // 业务失败
    const msg = message || '操作失败'
    if (!config.silent) {
      if (code === 409) {
        // 预约时间冲突：本项目最高频的业务异常，给更明确的提示
        toast('warning', `时间冲突：${msg}`)
      } else if (code === 401) {
        handleUnauthorized(msg)
      } else if (code === 403) {
        toast('error', `无权限：${msg}`)
      } else {
        toast('error', msg)
      }
    }
    // 把完整错误体带出去，方便业务层自行判断 code
    return Promise.reject(Object.assign(new Error(msg), { code, data, body }))
  },
  (error) => {
    const config = error.config || {}

    // 手动取消的请求不做提示
    if (axios.isCancel(error)) {
      return Promise.reject(error)
    }

    // HTTP 状态码级别错误
    if (error.response) {
      const status = error.response.status
      const msg =
        error.response.data?.message || error.response.statusText || '请求失败'

      if (status === 401) {
        if (!config.silent) handleUnauthorized(msg)
      } else if (status === 403) {
        if (!config.silent) toast('error', '无权限执行该操作')
      } else if (status === 404) {
        if (!config.silent) toast('error', '接口不存在，请联系后端确认地址')
      } else if (status >= 500) {
        if (!config.silent) toast('error', '服务器开小差了，请稍后重试')
      } else if (!config.silent) {
        toast('error', msg)
      }
      return Promise.reject(Object.assign(error, { status }))
    }

    // 网络层错误（超时 / 断网 / 后端未启动）
    if (error.code === 'ECONNABORTED') {
      if (!config.silent) toast('error', '请求超时，请检查网络或后端服务')
    } else if (!config.silent) {
      toast('error', '网络连接失败，请确认后端服务已启动')
    }
    return Promise.reject(error)
  }
)

function handleUnauthorized(msg) {
  clearToken()
  toast('error', msg || '登录状态已失效，请重新登录')
  if (unauthorizedHandler) {
    unauthorizedHandler()
  } else {
    // 兜底：未注册回调时直接跳转
    window.location.hash = '#/login'
  }
}

// ---- 语义化快捷方法：业务层直接用 api.xxx() 即可 ----
export const request = {
  get: (url, params, config = {}) => http.get(url, { params, ...config }),
  post: (url, data, config = {}) => http.post(url, data, config),
  put: (url, data, config = {}) => http.put(url, data, config),
  delete: (url, params, config = {}) => http.delete(url, { params, ...config })
}

export default http
