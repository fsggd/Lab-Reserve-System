/**
 * Mock 账号表（仅用于前端独立开发与自测，联调后由真实后端覆盖）
 *
 * 抽成纯函数是为了能脱离浏览器单独跑校验逻辑（自检 TC-01 / TC-02）。
 */

export const mockAccounts = [
  {
    username: 'student01',
    password: '123456',
    user: { id: 1, username: 'student01', realName: '张三', role: 'STUDENT', phone: '13800000001' }
  },
  {
    username: 'admin01',
    password: '123456',
    user: { id: 2, username: 'admin01', realName: '李老师', role: 'ADMIN', phone: '13800000002' }
  },
  {
    username: 'root',
    password: '123456',
    user: { id: 3, username: 'root', realName: '王主任', role: 'SUPER_ADMIN', phone: '13800000003' }
  }
]

/**
 * 登录校验
 * @returns {{ ok: boolean, message?: string, user?: object }}
 */
export function authenticate(username, password) {
  const name = (username || '').trim()
  if (!name || !password) {
    return { ok: false, message: '账号与密码不能为空' }
  }
  const account = mockAccounts.find((a) => a.username === name)
  if (!account) {
    return { ok: false, message: '账号不存在' }
  }
  if (account.password !== password) {
    return { ok: false, message: '用户名或密码错误' }
  }
  return { ok: true, user: { ...account.user } }
}

/** 生成形似 JWT 的 mock token：payload 中含 exp，便于前端演示过期判断 */
export function issueToken(username, role) {
  const iat = Math.floor(Date.now() / 1000)
  const payload = { sub: username, role, iat, exp: iat + 7200 } // 有效期 2 小时
  const encode = (obj) =>
    btoa(unescape(encodeURIComponent(JSON.stringify(obj))))
      .replace(/=+$/, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
  return `mock.${encode(payload)}.mock-signature`
}

/**
 * 从 Authorization 头解析 mock token，返回对应账号的用户信息。
 * 找不到有效 token（缺失/损坏/账号不存在）时返回 null。
 * 供 /auth/profile、/bookings/mine 等"按当前登录人取数据"的接口使用。
 */
export function userFromToken(authorization) {
  const token = (authorization || '').replace(/^Bearer\s+/i, '')
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const payload = JSON.parse(atob(padded))
    const account = mockAccounts.find((a) => a.username === payload.sub)
    return account ? { ...account.user } : null
  } catch {
    return null
  }
}
