<template>
  <div class="page-container">
    <div class="sk-header">
      <h2>Axios 拦截器自测</h2>
      <el-tag type="success" size="small">WBS 4.1 验收点</el-tag>
    </div>
    <p class="text-muted">
      本页面用于现场验证「Axios 统一拦截器可用」：JWT 自动携带、统一返回体剥壳、错误提示、401 跳转。
      全部请求走 Mock 适配器，<b>后端未启动也能演示</b>。
    </p>

    <el-card shadow="never" class="mt-16">
      <template #header><b>1. Token 状态（验证请求头自动携带 JWT）</b></template>
      <el-space wrap>
        <el-tag :type="token ? 'success' : 'info'">
          当前 Token：{{ token ? token.slice(0, 28) + '...' : '(无)' }}
        </el-tag>
        <el-button size="small" @click="setFakeToken">写入测试 Token</el-button>
        <el-button size="small" @click="clearFakeToken">清除 Token</el-button>
        <el-button size="small" type="primary" @click="testEchoToken">请求 /__test/echo-token</el-button>
      </el-space>
      <p class="text-muted mt-16">点上面第三个按钮后，看返回里是否出现 <code>Authorization: Bearer ...</code>。</p>
    </el-card>

    <el-card shadow="never" class="mt-16">
      <template #header><b>2. 响应处理与统一错误提示</b></template>
      <el-space wrap>
        <el-button type="success" @click="run('success')">① 成功（自动剥壳）</el-button>
        <el-button type="danger" @click="run('biz-error')">② 业务异常提示</el-button>
        <el-button type="warning" @click="run('conflict')">③ 409 时间冲突</el-button>
        <el-button @click="run('forbidden')">④ 403 无权限</el-button>
        <el-button @click="run('server-error')">⑤ 500 服务器错误</el-button>
        <el-button @click="run('unauthorized')">⑥ 401 失效跳登录</el-button>
        <el-button @click="run('silent')">⑦ silent 静默不弹窗</el-button>
      </el-space>
      <p class="text-muted mt-16">
        ⑥ 会清空 token 并跳转登录页（属预期行为）；⑦ 使用 <code>silent: true</code>，只写日志不弹提示。
      </p>
    </el-card>

    <el-card shadow="never" class="mt-16">
      <template #header>
        <div class="log-header">
          <b>执行日志</b>
          <el-button size="small" text @click="logs = []">清空</el-button>
        </div>
      </template>
      <el-empty v-if="!logs.length" description="暂无记录，点击上面的按钮开始" :image-size="60" />
      <div v-for="(log, i) in logs" :key="i" class="log-item">
        <el-tag :type="log.type" size="small">{{ log.label }}</el-tag>
        <span class="log-time">{{ log.time }}</span>
        <pre>{{ log.text }}</pre>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import http from '@/utils/request'
import { getToken, setToken, clearToken } from '@/utils/auth'

const token = ref(getToken())
const logs = ref([])

const CASES = {
  success: { url: '/__test/success', label: '成功剥壳', type: 'success' },
  'biz-error': { url: '/__test/biz-error', label: '业务异常', type: 'danger' },
  conflict: { url: '/__test/conflict', label: '409 冲突', type: 'warning' },
  forbidden: { url: '/__test/forbidden', label: '403 无权限', type: 'danger' },
  'server-error': { url: '/__test/server-error', label: '500 服务器', type: 'danger' },
  unauthorized: { url: '/__test/unauthorized', label: '401 未授权', type: 'danger' }
}

function pushLog(label, type, text) {
  logs.value.unshift({
    label,
    type,
    text,
    time: new Date().toLocaleTimeString()
  })
}

async function run(key) {
  if (key === 'silent') {
    try {
      await http.get('/__test/biz-error', { silent: true })
    } catch (e) {
      pushLog('silent 静默', 'info', `已捕获异常但页面未弹窗：${e.message}`)
    }
    return
  }
  const c = CASES[key]
  try {
    const data = await http.get(c.url)
    pushLog(c.label, c.type, `resolved（已被响应拦截器剥壳）:\n${JSON.stringify(data, null, 2)}`)
  } catch (e) {
    pushLog(c.label, c.type, `rejected:\ncode=${e.code || e.status || '-'}\nmessage=${e.message}`)
  }
}

async function testEchoToken() {
  try {
    const data = await http.get('/__test/echo-token')
    pushLog('Token 回显', 'success', JSON.stringify(data, null, 2))
  } catch (e) {
    pushLog('Token 回显', 'danger', e.message)
  }
}

function setFakeToken() {
  setToken('eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0In0.mock-signature')
  token.value = getToken()
}
function clearFakeToken() {
  clearToken()
  token.value = ''
}
</script>

<style scoped>
.sk-header { display: flex; align-items: center; gap: 12px; }
.sk-header h2 { margin: 0; font-size: 18px; }
.log-header { display: flex; align-items: center; justify-content: space-between; }
.log-item { padding: 8px 0; border-bottom: 1px dashed #ebeef5; }
.log-time { color: #909399; font-size: 12px; margin-left: 8px; }
.log-item pre { margin: 6px 0 0; background: #f7f8fa; padding: 8px; border-radius: 4px;
  font-size: 12px; white-space: pre-wrap; word-break: break-all; }
code { background: #f2f3f5; padding: 1px 4px; border-radius: 3px; }
</style>
