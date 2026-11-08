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
  {
    // 契约 v1.1：支持 name 模糊匹配 + status 精确筛选，返回 { list, total }
    method: 'get',
    path: '/instruments',
    handler: ({ query }) => {
      let data = mockInstruments
      if (query.name) {
        const kw = String(query.name).trim().toLowerCase()
        data = data.filter(
          (i) => i.name.toLowerCase().includes(kw) || i.model.toLowerCase().includes(kw)
        )
      }
      if (query.status) {
        data = data.filter((i) => i.status === query.status)
      }
      return paginate(data, query)
    }
  },
  {
    method: 'get',
    path: '/instruments/:id',
    handler: ({ params }) => {
      const item = mockInstruments.find((i) => i.id === Number(params.id))
      if (!item) {
        return { status: 200, code: 404, message: '仪器不存在' }
      }
      return item
    }
  },
  {
    // 新增仪器：名称/型号/位置必填（管理员台账用）
    method: 'post',
    path: '/instruments',
    handler: ({ body }) => {
      const { name, model, location, availableStart, availableEnd, status, remark } = body || {}
      if (!name?.trim() || !model?.trim() || !location?.trim()) {
        return { status: 200, code: 400, message: '名称、型号、位置为必填项' }
      }
      const record = {
        id: Math.max(...mockInstruments.map((i) => i.id)) + 1,
        name: name.trim(),
        model: model.trim(),
        location: location.trim(),
        availableStart: availableStart || '09:00',
        availableEnd: availableEnd || '18:00',
        status: status || 'NORMAL',
        remark: remark || ''
      }
      mockInstruments.push(record)
      return { id: record.id }
    }
  },
  {
    // 编辑仪器：按 id 部分更新
    method: 'put',
    path: '/instruments/:id',
    handler: ({ params, body }) => {
      const item = mockInstruments.find((i) => i.id === Number(params.id))
      if (!item) {
        return { status: 200, code: 404, message: '仪器不存在' }
      }
      const { id: _ignored, ...changes } = body || {}
      Object.assign(item, changes)
      return { id: item.id }
    }
  },
  {
    // 删除仪器：历史预约记录保留（仅移除台账）
    method: 'delete',
    path: '/instruments/:id',
    handler: ({ params }) => {
      const idx = mockInstruments.findIndex((i) => i.id === Number(params.id))
      if (idx === -1) {
        return { status: 200, code: 404, message: '仪器不存在' }
      }
      mockInstruments.splice(idx, 1)
      return true
    }
  },

  // ---------- 预约 ----------
  {
    // 管理员看全部：支持 status / instrumentId 过滤，返回 { list, total }
    method: 'get',
    path: '/bookings',
    handler: ({ query }) => {
      let data = mockBookings
      if (query.status) {
        data = data.filter((b) => b.status === query.status)
      }
      if (query.instrumentId) {
        data = data.filter((b) => b.instrumentId === Number(query.instrumentId))
      }
      return paginate(data, query)
    }
  },
  {
    // 我的预约：按 token 过滤本人数据（契约 v1.1，{ list, total }）
    method: 'get',
    path: '/bookings/mine',
    handler: ({ query, headers }) => {
      const user = userFromToken(headers.Authorization)
      const mine = user ? mockBookings.filter((b) => b.userName === user.realName) : []
      return paginate(mine, query)
    }
  },
  {
    // 提交预约：校验仪器状态与时间，冲突返回 code:409（契约 v1.1 约定）
    method: 'post',
    path: '/bookings',
    handler: ({ body, headers }) => {
      const { instrumentId, startTime, endTime, purpose } = body || {}
      const inst = mockInstruments.find((i) => i.id === Number(instrumentId))
      if (!inst) {
        return { status: 200, code: 404, message: '仪器不存在' }
      }
      if (inst.status !== 'NORMAL') {
        return { status: 200, code: 400, message: '维修/停用仪器不可预约' }
      }
      if (!startTime || !endTime) {
        return { status: 200, code: 400, message: '预约起止时间不能为空' }
      }
      if (endTime <= startTime) {
        return { status: 200, code: 400, message: '结束时间必须晚于开始时间' }
      }
      // 时间冲突：与未取消的既有预约重叠即 409，前端拦截器统一提示
      const conflict = mockBookings.some(
        (b) =>
          b.instrumentId === inst.id &&
          ['PENDING', 'APPROVED', 'COMPLETED'].includes(b.status) &&
          startTime < b.endTime &&
          endTime > b.startTime
      )
      if (conflict) {
        return { status: 200, code: 409, message: '该仪器在所选时段已被预约' }
      }
      const user = userFromToken(headers.Authorization)
      const record = {
        id: Math.max(...mockBookings.map((b) => b.id)) + 1,
        instrumentId: inst.id,
        instrumentName: inst.name,
        userName: user?.realName || '张三',
        startTime,
        endTime,
        purpose: (purpose || '').trim(),
        status: 'PENDING'
      }
      mockBookings.push(record)
      return { id: record.id }
    }
  },
  {
    // 审批通过：仅待审批记录可操作
    method: 'post',
    path: '/bookings/:id/approve',
    handler: ({ params }) => {
      const b = mockBookings.find((x) => x.id === Number(params.id))
      if (!b) {
        return { status: 200, code: 404, message: '预约记录不存在' }
      }
      if (b.status !== 'PENDING') {
        return { status: 200, code: 400, message: '仅待审批记录可执行审批操作' }
      }
      b.status = 'APPROVED'
      return true
    }
  },
  {
    // 驳回：reason 必填（WBS 4.5 验收点），成功后记录驳回理由
    method: 'post',
    path: '/bookings/:id/reject',
    handler: ({ params, body }) => {
      const b = mockBookings.find((x) => x.id === Number(params.id))
      if (!b) {
        return { status: 200, code: 404, message: '预约记录不存在' }
      }
      if (b.status !== 'PENDING') {
        return { status: 200, code: 400, message: '仅待审批记录可执行审批操作' }
      }
      const reason = (body?.reason || '').trim()
      if (!reason) {
        return { status: 200, code: 400, message: '驳回理由不能为空' }
      }
      b.status = 'REJECTED'
      b.rejectReason = reason
      return true
    }
  },
  {
    // 取消预约：仅待审批/已通过可取消，取消后保留记录（状态置 CANCELLED）
    method: 'delete',
    path: '/bookings/:id',
    handler: ({ params }) => {
      const b = mockBookings.find((x) => x.id === Number(params.id))
      if (!b) {
        return { status: 200, code: 404, message: '预约记录不存在' }
      }
      if (!['PENDING', 'APPROVED'].includes(b.status)) {
        return { status: 200, code: 400, message: '当前状态不可取消' }
      }
      b.status = 'CANCELLED'
      return true
    }
  },

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
