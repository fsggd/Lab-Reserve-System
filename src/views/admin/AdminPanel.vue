<template>
  <div class="page">
    <el-tabs v-model="activeTab" type="card">
      <!-- ================= Tab 1：预约审批 ================= -->
      <el-tab-pane label="预约审批" name="approval">
        <el-card shadow="never" class="filter-card">
          <el-form inline @submit.prevent="loadBookings">
            <el-form-item label="审批状态">
              <el-select v-model="bookingQuery.status" style="width: 160px" @change="onBookingSearch">
                <el-option label="全部状态" value="" />
                <el-option
                  v-for="(item, key) in BOOKING_STATUS"
                  :key="key"
                  :label="item.label"
                  :value="key"
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :icon="Search" @click="onBookingSearch">查询</el-button>
              <el-button
                type="success"
                :disabled="!selectedPendingIds.length"
                :loading="batchLoading"
                @click="onBatchApprove"
              >
                批量通过（{{ selectedPendingIds.length }}）
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card shadow="never">
          <el-table
            v-loading="bookingLoading"
            :data="bookingList"
            empty-text="暂无预约记录"
            @selection-change="onSelectionChange"
          >
            <el-table-column type="selection" width="44" :selectable="(row) => row.status === 'PENDING'" />
            <el-table-column prop="id" label="单号" width="70" />
            <el-table-column prop="instrumentName" label="仪器" min-width="150" show-overflow-tooltip />
            <el-table-column prop="userName" label="预约人" width="90" />
            <el-table-column label="起止时间" width="250">
              <template #default="{ row }">
                {{ row.startTime }}<br />至 {{ row.endTime }}
              </template>
            </el-table-column>
            <el-table-column prop="purpose" label="用途" min-width="130" show-overflow-tooltip />
            <el-table-column label="状态" width="90" align="center">
              <template #default="{ row }">
                <el-tag :type="BOOKING_STATUS[row.status]?.tag || 'info'">
                  {{ BOOKING_STATUS[row.status]?.label || row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right" align="center">
              <template #default="{ row }">
                <template v-if="row.status === 'PENDING'">
                  <el-button type="success" size="small" @click="onApprove(row)">通过</el-button>
                  <el-button type="danger" size="small" plain @click="openRejectDialog(row)">驳回</el-button>
                </template>
                <el-button v-else size="small" @click="viewBookingDetail(row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pager">
            <el-pagination
              v-model:current-page="bookingQuery.pageNum"
              v-model:page-size="bookingQuery.pageSize"
              :total="bookingTotal"
              :page-sizes="[5, 10, 20]"
              layout="total, sizes, prev, pager, next, jumper"
              background
              @size-change="loadBookings"
              @current-change="loadBookings"
            />
          </div>
        </el-card>
      </el-tab-pane>

      <!-- ================= Tab 2：仪器台账 ================= -->
      <el-tab-pane label="仪器台账" name="ledger">
        <el-card shadow="never" class="filter-card">
          <el-form inline @submit.prevent="loadInstruments">
            <el-form-item label="仪器名称">
              <el-input
                v-model="instrumentQuery.name"
                placeholder="按名称/型号搜索"
                clearable
                style="width: 200px"
                @keyup.enter="loadInstruments"
                @clear="loadInstruments"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :icon="Search" @click="loadInstruments">查询</el-button>
              <el-button type="success" :icon="Plus" @click="openInstrumentDialog()">新增仪器</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card shadow="never">
          <el-table v-loading="instrumentLoading" :data="instrumentList" empty-text="暂无仪器">
            <el-table-column prop="id" label="ID" width="60" />
            <el-table-column prop="name" label="名称" min-width="160" show-overflow-tooltip />
            <el-table-column prop="model" label="型号" width="130" show-overflow-tooltip />
            <el-table-column prop="location" label="位置" width="140" show-overflow-tooltip />
            <el-table-column label="可用时段" width="130" align="center">
              <template #default="{ row }">{{ row.availableStart }} – {{ row.availableEnd }}</template>
            </el-table-column>
            <el-table-column label="状态" width="90" align="center">
              <template #default="{ row }">
                <el-tag :type="INSTRUMENT_STATUS[row.status]?.tag || 'info'">
                  {{ INSTRUMENT_STATUS[row.status]?.label || row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="140" fixed="right" align="center">
              <template #default="{ row }">
                <el-button size="small" @click="openInstrumentDialog(row)">编辑</el-button>
                <el-button type="danger" size="small" plain @click="onDeleteInstrument(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pager">
            <el-pagination
              v-model:current-page="instrumentQuery.pageNum"
              v-model:page-size="instrumentQuery.pageSize"
              :total="instrumentTotal"
              :page-sizes="[5, 10, 20]"
              layout="total, sizes, prev, pager, next, jumper"
              background
              @size-change="loadInstruments"
              @current-change="loadInstruments"
            />
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 驳回理由弹窗：理由必填（WBS 4.5 验收点） -->
    <el-dialog v-model="rejectVisible" title="驳回预约" width="440px" :close-on-click-modal="false">
      <el-form ref="rejectFormRef" :model="rejectForm" :rules="rejectRules">
        <el-form-item label="预约单号">
          <span>#{{ rejectForm.id }}（{{ rejectForm.instrumentName }}）</span>
        </el-form-item>
        <el-form-item label="驳回理由" prop="reason">
          <el-input
            v-model="rejectForm.reason"
            type="textarea"
            :rows="4"
            maxlength="200"
            show-word-limit
            placeholder="请填写驳回理由（必填），学生可在「我的预约」中查看"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectVisible = false">取消</el-button>
        <el-button type="danger" :loading="rejectSubmitting" @click="onReject">确认驳回</el-button>
      </template>
    </el-dialog>

    <!-- 预约详情弹窗 -->
    <el-dialog v-model="bookingDetailVisible" title="预约详情" width="520px">
      <el-descriptions v-if="bookingDetailRow" :column="1" border>
        <el-descriptions-item label="单号">#{{ bookingDetailRow.id }}</el-descriptions-item>
        <el-descriptions-item label="仪器名称">{{ bookingDetailRow.instrumentName }}</el-descriptions-item>
        <el-descriptions-item label="预约人">{{ bookingDetailRow.userName }}</el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ bookingDetailRow.startTime }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ bookingDetailRow.endTime }}</el-descriptions-item>
        <el-descriptions-item label="实验用途">{{ bookingDetailRow.purpose }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="BOOKING_STATUS[bookingDetailRow.status]?.tag || 'info'">
            {{ BOOKING_STATUS[bookingDetailRow.status]?.label || bookingDetailRow.status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item v-if="bookingDetailRow.status === 'REJECTED'" label="驳回理由">
          {{ bookingDetailRow.rejectReason || '（未填写）' }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="bookingDetailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 仪器新增/编辑弹窗（同一表单两种模式） -->
    <el-dialog
      v-model="instrumentDialogVisible"
      :title="instrumentForm.id ? '编辑仪器' : '新增仪器'"
      width="520px"
      :close-on-click-modal="false"
    >
      <el-form ref="instrumentFormRef" :model="instrumentForm" :rules="instrumentRules" label-width="90px">
        <el-form-item label="仪器名称" prop="name">
          <el-input v-model="instrumentForm.name" maxlength="50" placeholder="如：扫描电子显微镜" />
        </el-form-item>
        <el-form-item label="型号" prop="model">
          <el-input v-model="instrumentForm.model" maxlength="50" placeholder="如：SEM-2000" />
        </el-form-item>
        <el-form-item label="位置" prop="location">
          <el-input v-model="instrumentForm.location" maxlength="50" placeholder="如：实验楼A-301" />
        </el-form-item>
        <el-form-item label="可用时段" required>
          <el-time-picker
            v-model="instrumentForm.availableStart"
            format="HH:mm"
            value-format="HH:mm"
            placeholder="开始时间"
            style="width: 46%"
          />
          <span style="margin: 0 6px">至</span>
          <el-time-picker
            v-model="instrumentForm.availableEnd"
            format="HH:mm"
            value-format="HH:mm"
            placeholder="结束时间"
            style="width: 46%"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="instrumentForm.status">
            <el-radio
              v-for="(item, key) in INSTRUMENT_STATUS"
              :key="key"
              :value="key"
            >{{ item.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="instrumentForm.remark" type="textarea" :rows="2" maxlength="100" placeholder="选填" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="instrumentDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="instrumentSubmitting" @click="onSaveInstrument">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import { fetchBookings, approveBooking, rejectBooking } from '@/api/booking'
import {
  fetchInstruments,
  createInstrument,
  updateInstrument,
  deleteInstrument
} from '@/api/instrument'
import { INSTRUMENT_STATUS, BOOKING_STATUS } from '@/utils/dict'

// ================= 审批 =================
const activeTab = ref('approval')

const bookingQuery = reactive({ status: 'PENDING', pageNum: 1, pageSize: 10 })
const bookingList = ref([])
const bookingTotal = ref(0)
const bookingLoading = ref(false)
const selectedRows = ref([])
const batchLoading = ref(false)

const bookingDetailVisible = ref(false)
const bookingDetailRow = ref(null)

// 驳回弹窗
const rejectVisible = ref(false)
const rejectSubmitting = ref(false)
const rejectFormRef = ref(null)
const rejectForm = reactive({ id: null, instrumentName: '', reason: '' })
const rejectRules = {
  reason: [
    { required: true, message: '驳回理由不能为空', trigger: 'blur' },
    { min: 2, max: 200, message: '驳回理由需 2-200 字', trigger: 'blur' }
  ]
}

const selectedPendingIds = computed(
  () => selectedRows.value.filter((r) => r.status === 'PENDING').map((r) => r.id)
)

function onSelectionChange(rows) {
  selectedRows.value = rows
}

async function loadBookings() {
  bookingLoading.value = true
  try {
    const data = await fetchBookings({
      status: bookingQuery.status || undefined,
      pageNum: bookingQuery.pageNum,
      pageSize: bookingQuery.pageSize
    })
    bookingList.value = data.list || []
    bookingTotal.value = data.total || 0
  } catch {
    // 错误已由拦截器统一提示
  } finally {
    bookingLoading.value = false
  }
}

function onBookingSearch() {
  bookingQuery.pageNum = 1
  loadBookings()
}

async function onApprove(row) {
  try {
    await ElMessageBox.confirm(
      `通过「${row.userName}」对 ${row.instrumentName}（${row.startTime}）的预约吗？`,
      '审批通过',
      { confirmButtonText: '通过', cancelButtonText: '再想想', type: 'success' }
    )
  } catch {
    return
  }
  try {
    await approveBooking(row.id)
    ElMessage.success(`预约 #${row.id} 已通过`)
    loadBookings()
  } catch {
    // 错误已由拦截器统一提示
  }
}

function openRejectDialog(row) {
  rejectForm.id = row.id
  rejectForm.instrumentName = row.instrumentName
  rejectForm.reason = ''
  rejectVisible.value = true
}

async function onReject() {
  try {
    await rejectFormRef.value.validate()
  } catch {
    return // 理由为空不允许提交（验收点）
  }
  rejectSubmitting.value = true
  try {
    await rejectBooking(rejectForm.id, rejectForm.reason.trim())
    ElMessage.success(`预约 #${rejectForm.id} 已驳回`)
    rejectVisible.value = false
    loadBookings()
  } catch {
    // 400（理由为空等）已由拦截器统一提示
  } finally {
    rejectSubmitting.value = false
  }
}

async function onBatchApprove() {
  const ids = selectedPendingIds.value
  if (!ids.length) return
  try {
    await ElMessageBox.confirm(`确定批量通过选中的 ${ids.length} 条预约吗？`, '批量通过', {
      confirmButtonText: '全部通过',
      cancelButtonText: '取消',
      type: 'success'
    })
  } catch {
    return
  }
  batchLoading.value = true
  try {
    let ok = 0
    for (const id of ids) {
      try {
        await approveBooking(id)
        ok++
      } catch {
        // 单条失败已由拦截器提示，继续处理其余条目
      }
    }
    if (ok > 0) {
      ElMessage.success(`已批量通过 ${ok}/${ids.length} 条预约`)
    }
    loadBookings()
  } finally {
    batchLoading.value = false
  }
}

function viewBookingDetail(row) {
  bookingDetailRow.value = row
  bookingDetailVisible.value = true
}

// ================= 仪器台账 =================
const instrumentQuery = reactive({ name: '', pageNum: 1, pageSize: 10 })
const instrumentList = ref([])
const instrumentTotal = ref(0)
const instrumentLoading = ref(false)

const instrumentDialogVisible = ref(false)
const instrumentSubmitting = ref(false)
const instrumentFormRef = ref(null)
const instrumentForm = reactive({
  id: null,
  name: '',
  model: '',
  location: '',
  availableStart: '09:00',
  availableEnd: '18:00',
  status: 'NORMAL',
  remark: ''
})
const instrumentRules = {
  name: [{ required: true, message: '请填写仪器名称', trigger: 'blur' }],
  model: [{ required: true, message: '请填写型号', trigger: 'blur' }],
  location: [{ required: true, message: '请填写位置', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

async function loadInstruments() {
  instrumentLoading.value = true
  try {
    const data = await fetchInstruments({
      name: instrumentQuery.name || undefined,
      pageNum: instrumentQuery.pageNum,
      pageSize: instrumentQuery.pageSize
    })
    instrumentList.value = data.list || []
    instrumentTotal.value = data.total || 0
  } catch {
    // 错误已由拦截器统一提示
  } finally {
    instrumentLoading.value = false
  }
}

/** 新增（row 为空）与编辑（传 row）复用同一弹窗 */
function openInstrumentDialog(row = null) {
  if (row) {
    Object.assign(instrumentForm, row)
  } else {
    Object.assign(instrumentForm, {
      id: null,
      name: '',
      model: '',
      location: '',
      availableStart: '09:00',
      availableEnd: '18:00',
      status: 'NORMAL',
      remark: ''
    })
  }
  instrumentDialogVisible.value = true
}

async function onSaveInstrument() {
  try {
    await instrumentFormRef.value.validate()
  } catch {
    return
  }
  // 可用时段手动校验（time-picker 不再由 rules 绑定）
  if (!instrumentForm.availableStart || !instrumentForm.availableEnd) {
    ElMessage.error('请选择可用时段')
    return
  }
  if (instrumentForm.availableEnd <= instrumentForm.availableStart) {
    ElMessage.error('结束时间必须晚于开始时间')
    return
  }
  instrumentSubmitting.value = true
  try {
    const payload = { ...instrumentForm }
    if (payload.id) {
      await updateInstrument(payload.id, payload)
      ElMessage.success('仪器信息已更新')
    } else {
      delete payload.id
      await createInstrument(payload)
      ElMessage.success('仪器已新增')
    }
    instrumentDialogVisible.value = false
    loadInstruments()
  } catch {
    // 校验/业务错误已统一提示
  } finally {
    instrumentSubmitting.value = false
  }
}

async function onDeleteInstrument(row) {
  try {
    await ElMessageBox.confirm(
      `确定删除仪器「${row.name}」吗？该仪器的历史预约记录仍会保留，但无法再发起该仪器的预约。`,
      '删除仪器',
      { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' }
    )
  } catch {
    return
  }
  try {
    await deleteInstrument(row.id)
    ElMessage.success('仪器已删除')
    loadInstruments()
  } catch {
    // 409（存在有效预约）等错误已由拦截器统一提示
  }
}

onMounted(() => {
  loadBookings()
  loadInstruments()
})
</script>

<style scoped>
.page { display: flex; flex-direction: column; }
.filter-card :deep(.el-card__body) { padding-bottom: 2px; }
.filter-card :deep(.el-form-item) { margin-bottom: 12px; }
.pager { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
