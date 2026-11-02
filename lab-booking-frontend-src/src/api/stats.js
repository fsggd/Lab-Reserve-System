import { request } from '@/utils/request'

/** 统计概览：预约量趋势 / 仪器利用率 / 状态占比 / 汇总卡片 */
export function fetchStatsOverview(params) {
  return request.get('/stats/overview', params, { silent: true })
}
