<template>
  <PageSkeleton
    title="我的预约"
    description="学生查看个人预约历史与审批状态，对待审/已通过的预约可取消；被驳回时展示驳回理由。"
    planned-week="W9"
    :blocks="[
      { label: '状态筛选：全部 / 待审批 / 已通过 / 已驳回 / 已完成 / 已取消', height: 56 },
      { label: '表格：仪器 | 起止时间 | 用途 | 状态 | 驳回理由 | 操作[取消·详情]', height: 260 },
      { label: '分页器', height: 40 }
    ]"
    :todos="[
      'fetchMyBookings() 拉数据，状态用 el-tag 区分颜色',
      '驳回行用 el-tooltip 展示 rejectReason',
      '取消操作前置 ElMessageBox.confirm 二次确认',
      '已结束（完成/取消/驳回）的记录不显示取消按钮',
      '空状态引导：按钮跳转「仪器列表」发起首次预约'
    ]"
  />
</template>

<script setup>
import PageSkeleton from '@/components/PageSkeleton.vue'
</script>
