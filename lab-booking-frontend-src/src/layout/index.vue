<template>
  <el-container class="app-layout">
    <el-aside width="220px" class="app-aside">
      <div class="logo">
        <el-icon :size="20"><Box /></el-icon>
        <span>仪器预约系统</span>
      </div>
      <el-menu :default-active="route.path" router class="app-menu">
        <el-menu-item v-for="item in menus" :key="item.path" :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.title }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="app-header">
        <div class="header-left">
          <strong>{{ route.meta.title }}</strong>
          <el-tag v-if="isDev" size="small" type="warning" style="margin-left: 8px">Mock 模式</el-tag>
        </div>
        <div class="header-right">
          <el-tag :type="roleTagType" size="small">{{ roleLabel }}</el-tag>
          <el-dropdown @command="onCommand">
            <span class="user-info">
              <el-icon><User /></el-icon>
              {{ userStore.displayName }}
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="app-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isDev = import.meta.env.DEV

const menus = computed(() => {
  const menusRoute = router.options.routes.find((r) => r.path === '/')
  return (menusRoute?.children || [])
    .filter((r) => r.meta?.icon)
    .filter((r) => (r.meta.devOnly ? isDev : true))
    .filter((r) => !r.meta.roles || r.meta.roles.includes(userStore.role))
    .map((r) => ({ path: '/' + r.path, title: r.meta.title, icon: r.meta.icon }))
})

const roleMap = {
  STUDENT: { label: '学生', type: '' },
  ADMIN: { label: '实验室管理员', type: 'success' },
  SUPER_ADMIN: { label: '超级管理员', type: 'danger' }
}
const roleLabel = computed(() => roleMap[userStore.role]?.label || '未知角色')
const roleTagType = computed(() => roleMap[userStore.role]?.type || 'info')

function onCommand(cmd) {
  if (cmd === 'logout') {
    ElMessageBox.confirm('确认退出登录？', '提示', { type: 'warning' })
      .then(() => {
        userStore.logout()
        router.replace('/login')
      })
      .catch(() => {})
  }
}
</script>

<style scoped>
.app-layout { height: 100vh; }
.app-aside { background: #fff; border-right: 1px solid #e4e7ed; display: flex; flex-direction: column; }
.logo { height: 60px; display: flex; align-items: center; justify-content: center; gap: 8px;
  font-weight: 700; font-size: 16px; color: #409eff; border-bottom: 1px solid #e4e7ed; }
.app-menu { border-right: none; flex: 1; }
.app-header { display: flex; align-items: center; justify-content: space-between;
  background: #fff; border-bottom: 1px solid #e4e7ed; }
.header-right { display: flex; align-items: center; gap: 12px; }
.user-info { display: flex; align-items: center; gap: 4px; cursor: pointer; outline: none; }
.app-main { background: #f5f7fa; overflow-y: auto; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
