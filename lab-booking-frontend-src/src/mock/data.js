/**
 * Mock 基础数据（仅用于前端独立开发，联调后由真实接口覆盖）
 */

export const mockUser = {
  id: 1,
  username: 'student01',
  realName: '张三',
  role: 'STUDENT', // STUDENT | ADMIN | SUPER_ADMIN
  phone: '13800000001'
}

export const mockInstruments = [
  { id: 1, name: '扫描电子显微镜', model: 'SEM-2000', location: '实验楼A-301', status: 'NORMAL', availableStart: '09:00', availableEnd: '18:00', remark: '需提前培训' },
  { id: 2, name: '高效液相色谱仪', model: 'HPLC-1260', location: '实验楼A-302', status: 'NORMAL', availableStart: '08:30', availableEnd: '17:30', remark: '' },
  { id: 3, name: '原子吸收分光光度计', model: 'AAS-900', location: '实验楼B-201', status: 'REPAIRING', availableStart: '09:00', availableEnd: '18:00', remark: '光源更换中' },
  { id: 4, name: '冷冻离心机', model: 'CF-16RN', location: '实验楼B-205', status: 'NORMAL', availableStart: '00:00', availableEnd: '23:59', remark: '' },
  { id: 5, name: '傅里叶红外光谱仪', model: 'FTIR-6700', location: '实验楼A-305', status: 'NORMAL', availableStart: '09:00', availableEnd: '18:00', remark: '' },
  { id: 6, name: '精密电子天平', model: 'ME-204T', location: '实验楼B-101', status: 'DISABLED', availableStart: '09:00', availableEnd: '18:00', remark: '已报废待处理' },
  { id: 7, name: '超净工作台', model: 'SW-CJ-2D', location: '实验楼C-102', status: 'NORMAL', availableStart: '08:00', availableEnd: '20:00', remark: '' },
  { id: 8, name: '恒温恒湿培养箱', model: 'HWS-250', location: '实验楼C-105', status: 'NORMAL', availableStart: '00:00', availableEnd: '23:59', remark: '' }
]

export const mockBookings = [
  { id: 101, instrumentId: 1, instrumentName: '扫描电子显微镜', userName: '张三', startTime: '2026-10-26 09:00', endTime: '2026-10-26 11:00', purpose: '材料表面形貌观察', status: 'PENDING' },
  { id: 102, instrumentId: 2, instrumentName: '高效液相色谱仪', userName: '张三', startTime: '2026-10-24 14:00', endTime: '2026-10-24 17:00', purpose: '药物含量测定', status: 'APPROVED' },
  { id: 103, instrumentId: 4, instrumentName: '冷冻离心机', userName: '李四', startTime: '2026-10-23 10:00', endTime: '2026-10-23 11:30', purpose: '血清分离', status: 'REJECTED', rejectReason: '与课题组测试冲突' },
  { id: 104, instrumentId: 5, instrumentName: '傅里叶红外光谱仪', userName: '王五', startTime: '2026-10-22 13:00', endTime: '2026-10-22 15:00', purpose: '聚合物结构表征', status: 'APPROVED' },
  { id: 105, instrumentId: 1, instrumentName: '扫描电子显微镜', userName: '赵六', startTime: '2026-10-21 15:00', endTime: '2026-10-21 18:00', purpose: '纳米颗粒观测', status: 'COMPLETED' },
  { id: 106, instrumentId: 7, instrumentName: '超净工作台', userName: '张三', startTime: '2026-10-20 09:00', endTime: '2026-10-20 12:00', purpose: '细胞培养', status: 'CANCELLED' },
  { id: 107, instrumentId: 8, instrumentName: '恒温恒湿培养箱', userName: '孙七', startTime: '2026-10-19 08:00', endTime: '2026-10-22 08:00', purpose: '菌种培养', status: 'APPROVED' },
  { id: 108, instrumentId: 2, instrumentName: '高效液相色谱仪', userName: '周八', startTime: '2026-10-18 09:30', endTime: '2026-10-18 12:00', purpose: '毕业设计实验', status: 'COMPLETED' }
]

export const mockStats = {
  // 近 7 天预约量
  bookingTrend: [
    { date: '10-19', count: 5 },
    { date: '10-20', count: 8 },
    { date: '10-21', count: 6 },
    { date: '10-22', count: 11 },
    { date: '10-23', count: 9 },
    { date: '10-24', count: 14 },
    { date: '10-25', count: 7 }
  ],
  // 仪器利用率 Top10（百分比）
  utilization: [
    { name: '扫描电子显微镜', rate: 82 },
    { name: '高效液相色谱仪', rate: 76 },
    { name: '冷冻离心机', rate: 61 },
    { name: '傅里叶红外光谱仪', rate: 55 },
    { name: '超净工作台', rate: 43 },
    { name: '恒温恒湿培养箱', rate: 38 },
    { name: '原子吸收分光光度计', rate: 12 },
    { name: '精密电子天平', rate: 0 }
  ],
  // 预约状态占比
  statusRatio: [
    { name: '待审批', value: 12 },
    { name: '已通过', value: 35 },
    { name: '已驳回', value: 8 },
    { name: '已完成', value: 21 },
    { name: '已取消', value: 4 }
  ],
  summary: {
    totalBookings: 80,
    pendingCount: 12,
    instrumentCount: 8,
    availableCount: 6
  }
}
