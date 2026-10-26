<template>
  <PageSkeleton
    title="管理员面板"
    description="实验室管理员与超级管理员使用：审批待审预约（通过/驳回并填写理由），维护仪器台账。"
    planned-week="W9"
    :blocks="[
      { label: 'Tabs：① 预约审批  ② 仪器台账', height: 48 },
      { label: '① 审批：状态筛选 + 表格 + 操作[通过·驳回] + 批量通过', height: 220 },
      { label: '② 台账：新增/编辑弹窗表单（名称·型号·位置·可用时段·状态）', height: 220 }
    ]"
    :todos="[
      '驳回必须弹窗填写理由，空理由不允许提交（需求明确要求）',
      '操作成功后原地刷新列表并 ElMessage 反馈',
      '台账弹窗复用同一 el-form（新增/编辑模式），带必填校验',
      '删除仪器需二次确认，且提示会影响历史预约记录',
      '（待确认）超管是否需要独立的用户管理页 —— 见 api-contract.md 待确认问题 1'
    ]"
  />
</template>

<script setup>
import PageSkeleton from '@/components/PageSkeleton.vue'
</script>
