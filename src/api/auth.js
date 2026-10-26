import { request } from '@/utils/request'

/** 登录：返回 { token, user } */
export function login(data) {
  return request.post('/auth/login', data, { silent: true })
}

/** 获取当前登录用户信息 */
export function getProfile() {
  return request.get('/auth/profile', null, { silent: true })
}

/** 退出登录（后端如需失效 token 则调用） */
export function logout() {
  return request.post('/auth/logout', null, { silent: true })
}
