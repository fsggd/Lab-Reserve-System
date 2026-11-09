<template>
  <div class="page">
    <!-- 汇总卡片 -->
    <el-row :gutter="16">
      <el-col v-for="card in summaryCards" :key="card.label" :xs="12" :sm="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value" :style="{ color: card.color }">{{ card.value }}</div>
          <div class="stat-label">{{ card.label }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 近 7 天预约量趋势 -->
    <el-card shadow="never">
      <template #header><span>近 7 天预约量趋势</span></template>
      <div ref="trendRef" class="chart chart-line" />
    </el-card>

    <!-- 仪器利用率 Top -->
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>仪器利用率</span>
          <el-tooltip placement="top" content="口径：已预约时长 ÷ 可用总时长 × 100%，仅统计已通过 + 已完成的预约（契约 v1.0 决策 3）">
            <el-icon class="tip-icon"><QuestionFilled /></el-icon>
          </el-tooltip>
        </div>
      </template>
      <div ref="utilRef" class="chart chart-bar" />
    </el-card>

    <!-- 预约状态占比 -->
    <el-card shadow="never">
      <template #header><span>预约状态占比</span></template>
      <div ref="ratioRef" class="chart chart-pie" />
    </el-card>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import { QuestionFilled } from '@element-plus/icons-vue'
import { fetchStatsOverview } from '@/api/stats'
import { BOOKING_STATUS } from '@/utils/dict'

const trendRef = ref(null)
const utilRef = ref(null)
const ratioRef = ref(null)

const stats = ref(null)
const charts = []

const summaryCards = computed(() => [
  { label: '总预约量', value: stats.value?.summary?.totalBookings ?? '—', color: '#409eff' },
  { label: '待审批', value: stats.value?.summary?.pendingCount ?? '—', color: '#e6a23c' },
  { label: '仪器总数', value: stats.value?.summary?.instrumentCount ?? '—', color: '#67c23a' },
  { label: '可用仪器', value: stats.value?.summary?.availableCount ?? '—', color: '#909399' }
])

/** 统一创建图表实例并登记（resize/dispose 统一管理） */
function mountChart(el, option) {
  if (!el) return
  const chart = echarts.init(el)
  chart.setOption(option)
  charts.push(chart)
}

function buildTrendOption(trend) {
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 24, top: 30, bottom: 30 },
    xAxis: {
      type: 'category',
      data: trend.map((t) => t.date),
      axisTick: { alignWithLabel: true }
    },
    yAxis: { type: 'value', minInterval: 1 },
    series: [
      {
        name: '预约量',
        type: 'line',
        smooth: true,
        data: trend.map((t) => t.count),
        itemStyle: { color: '#409eff' },
        areaStyle: { color: 'rgba(64, 158, 255, 0.15)' }
      }
    ]
  }
}

function buildUtilOption(util) {
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const p = params[0]
        return `${p.name}<br/>利用率：${p.value}%`
      }
    },
    grid: { left: 140, right: 40, top: 10, bottom: 24 },
    xAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
    yAxis: {
      type: 'category',
      // echarts 横向柱状图自下而上绘制，反转使高利用率排在最上面
      data: util.map((u) => u.name).reverse()
    },
    series: [
      {
        name: '利用率',
        type: 'bar',
        barMaxWidth: 18,
        data: util.map((u) => u.rate).reverse(),
        itemStyle: { color: '#67c23a' },
        label: { show: true, position: 'right', formatter: '{c}%' }
      }
    ]
  }
}

function buildRatioOption(ratio) {
  // 饼图颜色与预约状态标签色保持一致
  const colorMap = {
    待审批: '#e6a23c',
    已通过: '#67c23a',
    已驳回: '#f56c6c',
    已完成: '#409eff',
    已取消: '#909399'
  }
  return {
    tooltip: { trigger: 'item', formatter: '{b}：{c} 条（{d}%）' },
    legend: { bottom: 0 },
    series: [
      {
        name: '预约状态',
        type: 'pie',
        radius: ['38%', '62%'],
        center: ['50%', '44%'],
        label: { formatter: '{b}\n{d}%' },
        data: ratio.map((r) => ({
          name: r.name,
          value: r.value,
          itemStyle: { color: colorMap[r.name] || '#909399' }
        }))
      }
    ]
  }
}

/** 空数据兜底：显示「暂无数据」而不是空白画布 */
function buildEmptyOption() {
  return {
    title: {
      text: '暂无数据',
      left: 'center',
      top: 'middle',
      textStyle: { color: '#909399', fontSize: 14, fontWeight: 'normal' }
    }
  }
}

async function loadStats() {
  try {
    const data = await fetchStatsOverview()
    stats.value = data
  } catch {
    // 接口失败已由拦截器统一提示，图表保持「暂无数据」
    stats.value = null
  }

  const trend = stats.value?.bookingTrend || []
  const util = stats.value?.utilization || []
  const ratio = stats.value?.statusRatio || []

  mountChart(trendRef.value, trend.length ? buildTrendOption(trend) : buildEmptyOption())
  mountChart(utilRef.value, util.length ? buildUtilOption(util) : buildEmptyOption())
  mountChart(ratioRef.value, ratio.length ? buildRatioOption(ratio) : buildEmptyOption())
}

function onResize() {
  charts.forEach((c) => c.resize())
}

onMounted(async () => {
  window.addEventListener('resize', onResize)
  await loadStats()
})

onBeforeUnmount(() => {
  // 离开路由时销毁实例，防止内存泄漏
  window.removeEventListener('resize', onResize)
  charts.forEach((c) => c.dispose())
})
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }
.stat-card { text-align: center; }
.stat-value { font-size: 28px; font-weight: 600; line-height: 1.4; }
.stat-label { font-size: 13px; color: var(--el-text-color-secondary); margin-top: 4px; }
.card-header { display: flex; align-items: center; gap: 6px; }
.tip-icon { color: var(--el-text-color-secondary); cursor: help; }
.chart { width: 100%; }
.chart-line { height: 280px; }
.chart-bar { height: 320px; }
.chart-pie { height: 320px; }
</style>
