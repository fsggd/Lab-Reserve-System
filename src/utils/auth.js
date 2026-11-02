/**
 * Token / 用户信息本地存取
 * 需求：JWT 无状态鉴权，前端只负责"存 token、每次请求带上、过期清除"
 */

const TOKEN_KEY = 'lab_token'
const USER_KEY = 'lab_user'

/**
 * 存储策略由 setToken / setUser 的 remember 参数直接决定：
 * remember=true → localStorage（记住我）；false → sessionStorage（关掉浏览器即失效）。
 * 读取时两个 storage 都查，清除时两个都清，因此不需要额外的模式开关。
 */

export function getToken() {
  return (
    window.localStorage.getItem(TOKEN_KEY) ||
    window.sessionStorage.getItem(TOKEN_KEY) ||
    ''
  )
}

export function setToken(token, remember = true) {
  clearToken()
  const s = remember ? window.localStorage : window.sessionStorage
  s.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY)
  window.sessionStorage.removeItem(TOKEN_KEY)
  window.localStorage.removeItem(USER_KEY)
  window.sessionStorage.removeItem(USER_KEY)
}

export function getUser() {
  const raw =
    window.localStorage.getItem(USER_KEY) ||
    window.sessionStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setUser(user, remember = true) {
  const s = remember ? window.localStorage : window.sessionStorage
  s.setItem(USER_KEY, JSON.stringify(user))
}

/**
 * 极简 JWT 解析（只取 payload，用于前端判断过期与角色，不用于安全校验）
 */
export function parseJwt(token) {
  if (!token) return null
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    // 补齐 padding：JWT payload 的 base64 通常省略 "="，长度非 4 的倍数时
    // atob 会抛异常，导致有效 token 被误判为非法
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    return JSON.parse(window.atob(padded))
  } catch {
    return null
  }
}

export function isTokenExpired(token) {
  const payload = parseJwt(token)
  if (!payload || !payload.exp) return true
  // exp 单位秒
  return payload.exp * 1000 < Date.now()
}
