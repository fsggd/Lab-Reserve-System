/**
 * Mock 路由表（后端接口就绪后整份停用即可）
 *
 * 说明：
 *  - 每个 handler 返回的对象会被 adapter 包成统一返回体 { code, message, data }
 *  - 想模拟错误，返回 { status, code, message } 即可
 */
import { mockUser, mockInstruments, mockBookings, mockStats } from './data'

export const mockRoutes = [
  // ---------- 认证 ----------
  {
    method: 'post',
    path: '/auth/login',
    handler: ({ body }) => {
      const { username, password } = body || {}
      if (!username || !password) {
        return { status: 400, code: 400, message: '用户名与密码不能为空' }
      }
      if (password === 'wrong') {
        return { status: 400, code: 400, message: '用户名或密码错误' }
      }
      const role = username.startsWith('admin')
        ? 'ADMIN'
        : username.startsWith('root')
          ? 'SUPER_ADMIN'
          : 'STUDENT'
      return {
        token: `mock-jwt-token.${btoa(unescape(encodeURIComponent(username)))}.${Date.now()}`,
        user: { ...mockUser, username, role }
      }
    }
  },
  { method: 'get', path: '/auth/profile', handler: () => mockUser },

  // ---------- 仪器 ----------
  { method: 'get', path: '/instruments', handler: () => ({ list: mockInstruments, total: mockInstruments.length }) },
  { method: 'get', path: '/instruments/:id', handler: () => mockInstruments[0] },
  { method: 'post', path: '/instruments', handler: () => ({ id: Date.now() }) },
  { method: 'put', path: '/instruments/:id', handler: () => ({ id: 1 }) },
  { method: 'delete', path: '/instruments/:id', handler: () => true },

  // ---------- 预约 ----------
  { method: 'get', path: '/bookings', handler: () => ({ list: mockBookings, total: mockBookings.length }) },
  { method: 'get', path: '/bookings/mine', handler: () => mockBookings.slice(0, 5) },
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
  { method: 'get', path: '/__test/unauthorized', handler: () => ({ status: 401, code: 401, message: '登录状态已失效' }) },
  { method: 'get', path: '/__test/forbidden', handler: () => ({ status: 403, code: 403, message: '仅管理员可操作' }) },
  { method: 'get', path: '/__test/server-error', handler: () => ({ status: 500, code: 500, message: 'Internal Server Error' }) },
  {
    method: 'get',
    path: '/__test/echo-token',
    handler: ({ headers }) => ({
      authorization: headers.Authorization || headers.authorization || '(未携带)'
    })
  }
]
