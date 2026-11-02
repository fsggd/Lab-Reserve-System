/**
 * 角色相关常量与工具（单一来源：路由守卫、菜单、登录跳转共用）
 *
 * 已确认决策①：超级管理员不做独立用户管理页，权限等同管理员，
 * 因此 ADMIN 与 SUPER_ADMIN 的默认工作台完全相同。
 */

/** 各角色登录后的默认工作台 */
export const ROLE_HOME = {
  STUDENT: '/instruments',
  ADMIN: '/admin',
  SUPER_ADMIN: '/admin'
}

/** 兜底工作台：角色缺失或未知时给学生页 */
export const DEFAULT_HOME = '/instruments'

export function getHomePathByRole(role) {
  return ROLE_HOME[role] || DEFAULT_HOME
}

/** 角色中文名（页面标签展示） */
export const ROLE_LABEL = {
  STUDENT: { label: '学生', type: '' },
  ADMIN: { label: '实验室管理员', type: 'success' },
  SUPER_ADMIN: { label: '超级管理员', type: 'danger' }
}

/** 管理员角色集合（ADMIN 与 SUPER_ADMIN 同等放行） */
export const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN']

export function isAdminRole(role) {
  return ADMIN_ROLES.includes(role)
}
