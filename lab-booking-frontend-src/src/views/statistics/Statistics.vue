<template>
  <PageSkeleton
    title="统计分析"
    description="展示近期预约量与仪器利用率。骨架与 Mock 数据在 W9 六完成，W10 二只替换为真实接口数据。"
    planned-week="W9 六（骨架）"
    :blocks="[
      { label: '汇总卡片：总预约量 / 待审批 / 仪器总数 / 可用仪器', height: 88 },
      { label: '近 7 天（可切 30 天）预约量折线图', height: 200 },
      { label: '仪器利用率 Top10 横向柱状图', height: 200 },
      { label: '预约状态占比饼图', height: 200 }
    ]"
    :todos="[
      '引入 echarts，抽 useChart(compose) 统一初始化 + resize + dispose',
      '三个图表容器先在 W9 六用 Mock 数据渲染出来，不等后端',
      '空数据兜底：显示「暂无数据」而不是空白画布',
      '利用率口径已确认：已预约时长 ÷ 可用总时长 × 100%，只计 APPROVED + COMPLETED（契约 v1.0 决策 3）',
      'Y 轴固定 0-100%，Tooltip 标注口径说明，避免评审时被问百分比怎么算的',
      '窗口 resize 时调用 chart.resize()，离开路由时 dispose 防内存泄漏'
    ]"
  />
</template>

<script setup>
import PageSkeleton from '@/components/PageSkeleton.vue'
</script>
