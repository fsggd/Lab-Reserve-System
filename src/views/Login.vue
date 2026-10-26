<template>
  <div class="login-page">
    <el-card class="login-card">
      <h2 class="login-title">实验室仪器预约系统</h2>
      <p class="text-muted login-sub">WBS 4.1 阶段：本页为草图占位，表单与校验在 W8 交付</p>

      <!-- 草图占位区 -->
      <div class="sk-form">
        <div class="sk-field"><span>用户名输入框</span></div>
        <div class="sk-field"><span>密码输入框</span></div>
        <div class="sk-field sm"><span>记住我 + 登录按钮</span></div>
      </div>

      <el-divider>开发调试入口（Mock）</el-divider>
      <div class="dev-login">
        <el-button type="primary" :loading="loading" @click="quickLogin('student01')">
          以学生身份登录
        </el-button>
        <el-button type="success" :loading="loading" @click="quickLogin('admin01')">
          以管理员登录
        </el-button>
        <el-button type="danger" :loading="loading" @click="quickLogin('root')">
          以超管登录
        </el-button>
      </div>
      <p class="text-muted">该入口直接调用 <code>POST /auth/login</code>（Mock），用于验证 Axios 封装与路由鉴权，W8 完成后删除。</p>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const loading = ref(false)

async function quickLogin(username) {
  loading.value = true
  try {
    await userStore.login({ username, password: '123456' })
    ElMessage.success(`登录成功：${userStore.displayName}`)
    router.replace(route.query.redirect || '/instruments')
  } catch (e) {
    ElMessage.error(e.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page { height: 100vh; display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #e8f1ff 0%, #f5f7fa 100%); }
.login-card { width: 420px; }
.login-title { margin: 0 0 4px; text-align: center; font-size: 20px; }
.login-sub { text-align: center; margin: 0 0 16px; }
.sk-form { display: flex; flex-direction: column; gap: 12px; }
.sk-field { height: 52px; border: 1px dashed #dcdfe6; border-radius: 4px; background: #fafafa;
  display: flex; align-items: center; justify-content: center; color: #909399; font-size: 13px; }
.sk-field.sm { height: 40px; }
.dev-login { display: flex; flex-direction: column; gap: 8px; }
.dev-login .el-button { width: 100%; margin-left: 0; }
code { background: #f2f3f5; padding: 1px 4px; border-radius: 3px; }
</style>
