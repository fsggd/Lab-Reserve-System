<template>
  <div class="login-page">
    <el-card class="login-card" shadow="always">
      <div class="brand">
        <el-icon :size="22"><Box /></el-icon>
        <h2>实验室仪器预约系统</h2>
      </div>
      <p class="login-sub">请使用统一身份账号登录</p>

      <!-- 服务端返回的错误信息（登录接口为 silent，交由本页自行展示） -->
      <el-alert
        v-if="errorMsg"
        :title="errorMsg"
        type="error"
        show-icon
        :closable="false"
        class="login-alert"
      />

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        size="large"
        @keyup.enter="onSubmit"
      >
        <el-form-item label="账号" prop="username">
          <el-input
            v-model.trim="form.username"
            :prefix-icon="User"
            placeholder="请输入学号或工号"
            maxlength="20"
            clearable
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            :prefix-icon="Lock"
            placeholder="请输入密码"
            maxlength="20"
            show-password
            clearable
          />
        </el-form-item>

        <div class="login-extra">
          <el-checkbox v-model="form.remember">记住我</el-checkbox>
          <el-link type="primary" :underline="false" @click="onForgot">忘记密码</el-link>
        </div>

        <el-button type="primary" size="large" class="login-btn" :loading="loading" @click="onSubmit">
          {{ loading ? '登录中' : '登 录' }}
        </el-button>
      </el-form>

      <!-- 仅本地 Mock 模式下展示，联调后自动隐藏 -->
      <div v-if="showMockTip" class="mock-tip">
        <el-divider>Mock 自测账号</el-divider>
        <div class="mock-accounts">
          <el-button
            v-for="acc in mockAccounts"
            :key="acc.username"
            size="small"
            text
            type="info"
            @click="fillAccount(acc)"
          >
            {{ acc.username }} / {{ acc.password }}（{{ roleName(acc.user.role) }}）
          </el-button>
        </div>
        <p class="mock-hint">点击填充账号密码后再登录，用于验证 TC-01 / TC-02</p>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed, ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Box, Lock, User } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { ROLE_LABEL } from '@/utils/role'
import { mockAccounts } from '@/mock/accounts'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const showMockTip = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true'

const formRef = ref()
const errorMsg = ref('')
const form = reactive({ username: '', password: '', remember: true })

const rules = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 3, max: 20, message: '账号长度需为 3-20 位', trigger: 'blur' },
    { pattern: /^[A-Za-z0-9_]+$/, message: '账号只能包含字母、数字或下划线', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 位', trigger: 'blur' }
  ]
}

const loading = computed(() => userStore.loading)

function roleName(role) {
  return ROLE_LABEL[role]?.label || role
}

function fillAccount(acc) {
  form.username = acc.username
  form.password = acc.password
  errorMsg.value = ''
  formRef.value?.clearValidate()
}

function onForgot() {
  ElMessage.info('请联系实验室管理员重置密码')
}

/** 只接受站内路径，避免开放重定向 */
function targetPath() {
  const redirect = route.query.redirect
  if (typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')) {
    return redirect
  }
  return userStore.homePath
}

async function onSubmit() {
  errorMsg.value = ''
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  try {
    const user = await userStore.login({ ...form })
    ElMessage.success(`登录成功，欢迎 ${user?.realName || user?.username || '回来'}`.trim())
    router.replace(targetPath())
  } catch (e) {
    // 优先展示后端返回的中文 message，其次给兜底文案
    errorMsg.value = e?.response?.data?.message || e?.message || '登录失败，请稍后重试'
  }
}
</script>

<style scoped>
.login-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e8f1ff 0%, #f5f7fa 100%);
}
.login-card { width: 420px; }
.brand { display: flex; align-items: center; justify-content: center; gap: 8px; color: #409eff; }
.brand h2 { margin: 0; font-size: 20px; color: #303133; }
.login-sub { text-align: center; color: #909399; font-size: 13px; margin: 6px 0 18px; }
.login-alert { margin-bottom: 16px; }
.login-extra { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.login-btn { width: 100%; }
.mock-tip { margin-top: 8px; }
.mock-accounts { display: flex; flex-wrap: wrap; gap: 4px; }
.mock-hint { color: #909399; font-size: 12px; margin: 6px 0 0; }
</style>
