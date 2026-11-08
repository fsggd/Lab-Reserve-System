<template>
  <div class="page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>预约申请</span>
          <el-tag v-if="instrument" :type="INSTRUMENT_STATUS[instrument.status]?.tag || 'info'" size="small">
            {{ instrument.name }}（{{ instrument.model }}）· 开放时段 {{ instrument.availableStart }} – {{ instrument.availableEnd }}
          </el-tag>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="90px"
        style="max-width: 640px"
        @submit.prevent="onSubmit"
      >
        <el-form-item label="预约仪器" prop="instrumentId">
          <el-select
            v-model="form.instrumentId"
            placeholder="请选择仪器"
            filterable
            style="width: 100%"
            @change="onInstrumentChange"
          >
            <el-option
              v-for="item in instruments"
              :key="item.id"
              :label="`${item.name}（${item.model}）`"
              :value="item.id"
              :disabled="!isBookable(item)"
            >
              <span style="float: left">{{ item.name }}（{{ item.model }}）</span>
              <el-tag
                style="float: right; margin-top: 4px"
                size="small"
                :type="INSTRUMENT_STATUS[item.status]?.tag || 'info'"
              >
                {{ INSTRUMENT_STATUS[item.status]?.label || item.status }}
              </el-tag>
            </el-option>
          </el-select>
          <div class="form-tip">维修、停用状态的仪器不可预约（灰色选项）</div>
        </el-form-item>

        <el-form-item label="起止时间" prop="timeRange">
          <el-date-picker
            v-model="form.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm"
            format="YYYY-MM-DD HH:mm"
            :disabled-date="disabledDate"
            style="width: 100%"
          />
          <div class="form-tip">
            需落在仪器开放时段内且不跨天；若所选时段与他人冲突，提交时后端返回 409 统一提示
          </div>
        </el-form-item>

        <el-form-item label="实验用途" prop="purpose">
          <el-input
            v-model="form.purpose"
            type="textarea"
            :rows="4"
            maxlength="200"
            show-word-limit
            placeholder="请简述实验内容（5-200 字）"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="onSubmit">提交预约</el-button>
          <el-button @click="onReset">重置</el-button>
          <el-button text @click="goBack">返回仪器列表</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { fetchInstruments } from '@/api/instrument'
import { createBooking } from '@/api/booking'
import { INSTRUMENT_STATUS, isBookable } from '@/utils/dict'

const route = useRoute()
const router = useRouter()

const formRef = ref(null)
const instruments = ref([])
const submitting = ref(false)
/** 记录初始表单快照，用于判断是否有未保存内容 */
let initialSnapshot = ''

const form = reactive({
  instrumentId: null,
  timeRange: null,
  purpose: ''
})

const instrument = computed(() =>
  instruments.value.find((i) => i.id === form.instrumentId) || null
)

const rules = {
  instrumentId: [{ required: true, message: '请选择预约仪器', trigger: 'change' }],
  timeRange: [{ validator: validateTimeRange, trigger: 'change' }],
  purpose: [
    { required: true, message: '请填写实验用途', trigger: 'blur' },
    { min: 5, max: 200, message: '实验用途需 5-200 字', trigger: 'blur' }
  ]
}

/** 起止时间合法性：顺序、不早于当前、不跨天、落在仪器开放时段内 */
function validateTimeRange(rule, value, callback) {
  if (!value || value.length !== 2) {
    return callback(new Error('请选择预约起止时间'))
  }
  const [s, e] = value
  const start = new Date(s.replace(' ', 'T'))
  const end = new Date(e.replace(' ', 'T'))
  if (!(start < end)) {
    return callback(new Error('结束时间必须晚于开始时间'))
  }
  if (start.getTime() < Date.now()) {
    return callback(new Error('开始时间不能早于当前时间'))
  }
  if (s.slice(0, 10) !== e.slice(0, 10)) {
    return callback(new Error('预约不支持跨天，请在同一天内选择'))
  }
  const inst = instrument.value
  if (inst) {
    const sh = s.slice(11, 16)
    const eh = e.slice(11, 16)
    if (sh < inst.availableStart || eh > inst.availableEnd) {
      return callback(
        new Error(`请选择在开放时段 ${inst.availableStart} – ${inst.availableEnd} 内的时间`)
      )
    }
  }
  callback()
}

/** 禁用今天之前的日期（时分限制交给校验器） */
function disabledDate(date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date.getTime() < today.getTime()
}

function onInstrumentChange() {
  // 换仪器后开放时段可能变化，重新校验时间
  if (form.timeRange) {
    formRef.value?.validateField('timeRange').catch(() => {})
  }
}

/** 拉仪器列表供选择；支持从仪器列表页 ?instrumentId=xxx 带入预选 */
async function loadInstruments() {
  const data = await fetchInstruments({ pageNum: 1, pageSize: 100 })
  instruments.value = data.list || []
  const preset = Number(route.query.instrumentId)
  if (preset && instruments.value.some((i) => i.id === preset && isBookable(i))) {
    form.instrumentId = preset
  }
}

async function onSubmit() {
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  submitting.value = true
  try {
    await createBooking({
      instrumentId: form.instrumentId,
      startTime: form.timeRange[0],
      endTime: form.timeRange[1],
      purpose: form.purpose.trim()
    })
    ElMessage.success('预约提交成功，等待管理员审批')
    initialSnapshot = '' // 已提交，离开不再拦截
    router.push({ name: 'MyBookings' })
  } catch {
    // 409 时间冲突 / 400 参数错误等已由拦截器统一提示
  } finally {
    submitting.value = false
  }
}

function onReset() {
  formRef.value?.resetFields()
  form.timeRange = null
}

function goBack() {
  router.push({ name: 'InstrumentList' })
}

/** 有未提交内容时离开页面需二次确认 */
onBeforeRouteLeave(async () => {
  const snapshot = JSON.stringify([form.instrumentId, form.timeRange, form.purpose])
  if (!initialSnapshot) initialSnapshot = snapshot
  if (snapshot === initialSnapshot || !form.instrumentId) return true
  try {
    await ElMessageBox.confirm('当前填写内容尚未提交，确定离开吗？', '提示', {
      confirmButtonText: '离开',
      cancelButtonText: '继续填写',
      type: 'warning'
    })
    return true
  } catch {
    return false
  }
})

onMounted(loadInstruments)
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }
.card-header { display: flex; align-items: center; gap: 12px; }
.form-tip { font-size: 12px; color: var(--el-text-color-secondary); line-height: 1.6; margin-top: 4px; }
</style>
