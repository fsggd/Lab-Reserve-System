<template>
  <div class="page-container">
    <div class="sk-header">
      <h2>{{ title }}</h2>
      <el-tag type="info" size="small">草图阶段 · {{ plannedWeek }} 实现</el-tag>
    </div>
    <p class="text-muted">{{ description }}</p>

    <div class="sk-blocks">
      <div
        v-for="(b, i) in blocks"
        :key="i"
        class="sk-block"
        :style="{ height: (b.height || 80) + 'px' }"
      >
        <span>{{ b.label }}</span>
      </div>
    </div>

    <el-divider content-position="left">待办清单</el-divider>
    <ul class="sk-todo">
      <li v-for="(t, i) in todos" :key="i">{{ t }}</li>
    </ul>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  plannedWeek: { type: String, default: 'W9' },
  blocks: { type: Array, default: () => [] },
  todos: { type: Array, default: () => [] }
})
</script>

<style scoped>
.sk-header { display: flex; align-items: center; gap: 12px; margin-bottom: 4px; }
.sk-header h2 { margin: 0; font-size: 18px; }
.sk-blocks { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }
.sk-block {
  background: repeating-linear-gradient(45deg, #f2f3f5, #f2f3f5 8px, #ebeef5 8px, #ebeef5 16px);
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  display: flex; align-items: center; justify-content: center;
  color: #909399; font-size: 13px;
}
.sk-todo { margin: 0; padding-left: 20px; color: #606266; font-size: 13px; line-height: 1.9; }
</style>
