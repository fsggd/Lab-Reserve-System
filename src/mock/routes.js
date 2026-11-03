/**
 * Mock 路由表（后端接口就绪后整份停用即可）
 *
 * 说明：
 *  - 每个 handler 返回的对象会被 adapter 包成统一返回体 { code, message, data }
 *  - 想模拟错误，返回 { status, code, message } 即可
 */
import { mockInstruments, mockBookings, mockStats } from './data'
import { authenticate, issueToken, userFromToken } from './accounts'

/**
 * 统一分页：与契约 v1.1 一致，列表接口一律返回 { list, total }
 * 入参 pageNum 从 1 开始，pageSize 默认 10（见契约第 0 节「分页约定」）
 */
function paginate(list, query = {}) {
  const pageNum = Number(query.pageNum) || 1
  const pageSize = Number(query.pageSize) || 10
  const start = (pageNum - 1) * pageSize
  return { list: list.slice(start, start + pageSize), total: list.length }
}

export const mockRoutes = [
  // ---------- 认证 ----------
  {
    // 与契约 v1.1 一致：后端统一 HTTP 200 + code 业务码，登录失败 = HTTP 200 + code:400
    method: 'post',
    path: '/auth/login',
    handler: ({ body }) => {
      const { username, password } = body || {}
      const result = authenticate(username, password)
      if (!result.ok) {
        return { status: 200, code: 400, message: result.message }
      }
      return {
        token: issueToken(result.user.username, result.user.role),
        user: result.user
      }
    }
  },
  {
    // 按 token 返回当前登录人（与真实后端行为一致，不再固定返回一个用户）
    method: 'get',
    path: '/auth/profile',
    handler: ({ headers }) =>
      userFromToken(headers.Authorization) || {
        status: 200,
        code: 401,
        message: '登录状态已失效'
      }
  },
  { method: 'post', path: '/auth/logout', handler: () => true },

  // ---------- 仪器 ----------
  { method: 'get', path: '/instruments', handler: ({ query }) => paginate(mockInstruments, query) },
  { method: 'get', path: '/instruments/:id', handler: () => mockInstruments[0] },
  { method: 'post', path: '/instruments', handler: () => ({ id: Date.now() }) },
  { method: 'put', path: '/instruments/:id', handler: () => ({ id: 1 }) },
  { method: 'delete', path: '/instruments/:id', handler: () => true },

  // ---------- 预约 ----------
  { method: 'get', path: '/bookings', handler: ({ query }) => paginate(mockBookings, query) },
  // 与契约 v1.1 一致：返回 { list, total }；mock 同样按 token 过滤本人数据，与真实后端语义对齐
  {
    method: 'get',
    path: '/bookings/mine',
    handler: ({ query, headers }) => {
      const user = userFromToken(headers.Authorization)
      const mine = user ? mockBookings.filter((b) => b.userName === user.realName) : []
      return paginate(mine, query)
    }
  },
  { method: 'post', path: '/bookings', handler: () => ({ id: Date.now() }) },
  { method: 'post', path: '/bookings/:id/approve', handler: () => true },
  { method: 'post', path: '/bookings/:id/reject', handler: () => true },
  { method: 'delete', path: '/bookings/:id', handler: () => true },

  // ---------- 统计 ----------
  { method: 'get', path: '/stats/overview', handler: () => mockStats },

  // ---------- 拦截器自测专用（验收 Axios 封装用）----------
  { method: 'get', path: '/__test/success', handler: () => ({ hello: 'world', time: Date.now() }) },
  { method: 'get', path: '/__test/biz-error', handler: () => ({ status: 200, code: 500, message: '模拟业务异常' }) },
  { method: 'get', path: '/__test/conflict', handler: () => ({ status: 200, code: 409, message: '该仪器在所选时段已被预约' }) },
  // 以下均按契约 v1.1：HTTP 200 + code 业务码（与真实后端统一）
  { method: 'get', path: '/__test/unauthorized', handler: () => ({ status: 200, code: 401, message: '登录状态已失效' }) },
  { method: 'get', path: '/__test/forbidden', handler: () => ({ status: 200, code: 403, message: '仅管理员可操作' }) },
  { method: 'get', path: '/__test/server-error', handler: () => ({ status: 200, code: 500, message: '服务器内部错误' }) },
  {
    method: 'get',
    path: '/__test/echo-token',
    handler: ({ headers }) => ({
      authorization: headers.Authorization || headers.authorization || '(未携带)'
    })
  }
]
