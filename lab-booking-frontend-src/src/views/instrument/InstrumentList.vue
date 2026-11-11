<template>
  <PageSkeleton
    title="仪器列表"
    description="展示全部仪器台账，学生可按名称/状态筛选，点击「预约」跳转到预约表单。正常状态才可预约，维修/停用置灰。"
    planned-week="W9"
    :blocks="[
      { label: '筛选区：仪器名称 / 设备状态（正常·维修·停用） / 查询·重置', height: 64 },
      { label: '表格：名称 | 型号 | 位置 | 可用时段 | 状态标签 | 操作[预约·详情]', height: 240 },
      { label: '分页器', height: 40 }
    ]"
    :todos="[
      'el-table + fetchInstruments() 拉列表（现可用 Mock 数据自测）',
      '状态列用 el-tag：正常=success / 维修=warning / 停用=info',
      '非「正常」状态仪器的预约按钮 disabled',
      '点击预约 → router.push({ name: BookingCreate, query: { instrumentId } })',
      '加载态 el-table v-loading，空数据显示 el-empty'
    ]"
  />
</template>

<script setup>
import PageSkeleton from '@/components/PageSkeleton.vue'
</script>
