<template>
  <PageSkeleton
    title="预约申请"
    description="选择仪器与时间区间、填写实验用途后提交。409 冲突由 request.js 统一提示，无需页面额外处理。"
    planned-week="W9"
    :blocks="[
      { label: '仪器选择（从列表页带入 instrumentId，支持返回重选）', height: 56 },
      { label: '时间区间：el-date-picker datetimerange，禁用过去时间', height: 56 },
      { label: '实验用途：el-textarea，必填，5-200 字', height: 96 },
      { label: '提交 / 重置 按钮', height: 48 }
    ]"
    :todos="[
      'el-form + rules 校验：仪器必选、结束时间必须晚于开始时间、用途必填且长度校验',
      '时间选择器根据仪器 availableStart / availableEnd 限制可选范围',
      '（加分）按已占用时段置灰不可选时间 —— 依赖后端 availableSlots 结构，见 api-contract.md 待确认问题 2',
      '提交成功 → 提示 + 跳转我的预约；409 由拦截器统一提示时间冲突',
      '离开页面前二次确认（未保存的填写内容）'
    ]"
  />
</template>

<script setup>
import PageSkeleton from '@/components/PageSkeleton.vue'
</script>
