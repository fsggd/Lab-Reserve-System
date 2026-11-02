import { request } from '@/utils/request'

/** 预约记录（管理员看全部，可按 status / instrumentId 过滤） */
export function fetchBookings(params) {
  return request.get('/bookings', params)
}

/** 我的预约 */
export function fetchMyBookings(params) {
  return request.get('/bookings/mine', params)
}

/**
 * 提交预约
 * 后端会做时间重叠校验，冲突时返回 code: 409，
 * request.js 已对该 code 做统一提示，这里无需重复处理
 */
export function createBooking(data) {
  return request.post('/bookings', data)
}

/** 审批通过 */
export function approveBooking(id) {
  return request.post(`/bookings/${id}/approve`)
}

/** 驳回（reason 必填） */
export function rejectBooking(id, reason) {
  return request.post(`/bookings/${id}/reject`, { reason })
}

/** 取消预约 */
export function cancelBooking(id) {
  return request.delete(`/bookings/${id}`)
}
