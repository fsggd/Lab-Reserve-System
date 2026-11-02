import { request } from '@/utils/request'

/** 仪器列表（支持 name / status 模糊筛选） */
export function fetchInstruments(params) {
  return request.get('/instruments', params)
}

export function fetchInstrument(id) {
  return request.get(`/instruments/${id}`)
}

export function createInstrument(data) {
  return request.post('/instruments', data)
}

export function updateInstrument(id, data) {
  return request.put(`/instruments/${id}`, data)
}

export function deleteInstrument(id) {
  return request.delete(`/instruments/${id}`)
}
