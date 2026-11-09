/**
 * 业务状态字典（单一来源，页面与 Mock 共用）
 * 需求来源：docs/api-contract.md v1.1
 */

/** 仪器状态 */
export const INSTRUMENT_STATUS = {
  NORMAL: { label: '正常', tag: 'success' },
  REPAIRING: { label: '维修', tag: 'warning' },
  DISABLED: { label: '停用', tag: 'info' }
}

/** 预约状态 */
export const BOOKING_STATUS = {
  PENDING: { label: '待审批', tag: 'warning' },
  APPROVED: { label: '已通过', tag: 'success' },
  REJECTED: { label: '已驳回', tag: 'danger' },
  COMPLETED: { label: '已完成', tag: 'primary' },
  CANCELLED: { label: '已取消', tag: 'info' }
}

/**
 * 仪器是否可发起预约：仅「正常」状态可预约
 * 维修 / 停用一律禁用预约入口（WBS 4.3 验收点）
 */
export function isBookable(instrument) {
  return instrument?.status === 'NORMAL'
}
