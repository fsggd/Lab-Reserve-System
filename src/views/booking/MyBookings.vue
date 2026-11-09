<template>
  <div class="page">
    <el-card shadow="never" class="filter-card">
      <el-form inline @submit.prevent="onSearch">
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部状态" clearable style="width: 160px" @change="onSearch">
            <el-option
              v-for="(item, key) in BOOKING_STATUS"
              :key="key"
              :label="item.label"
              :value="key"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="onSearch">查询</el-button>
          <el-button :icon="Refresh" @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <el-table v-loading="loading" :data="list">
        <template #empty>
          <el-empty description="还没有预约记录">
            <el-button type="primary" @click="goBooking">去仪器列表发起第一次预约</el-button>
          </el-empty>
        </template>

        <el-table-column prop="instrumentName" label="仪器" min-width="150" show-overflow-tooltip />
        <el-table-column label="起止时间" width="260">
          <template #default="{ row }">
            {{ row.startTime }}<br />至 {{ row.endTime }}
          </template>
        </el-table-column>
        <el-table-column prop="purpose" label="用途" min-width="140" show-overflow-tooltip />
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tooltip
              :disabled="row.status !== 'REJECTED' || !row.rejectReason"
              :content="`驳回理由：${row.rejectReason}`"
              placement="top"
            >
              <el-tag :type="BOOKING_STATUS[row.status]?.tag || 'info'">
                {{ BOOKING_STATUS[row.status]?.label || row.status }}
              </el-tag>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="驳回理由" min-width="130" show-overflow-tooltip>
          <template #default="{ row }">{{ row.rejectReason || '—' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="130" fixed="right" align="center">
          <template #default="{ row }">
            <el-button size="small" @click="showDetail(row)">详情</el-button>
            <el-button
              v-if="canCancel(row)"
              type="danger"
              size="small"
              plain
              @click="onCancel(row)"
            >取消</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pager">
        <el-pagination
          v-model:current-page="query.pageNum"
          v-model:page-size="query.pageSize"
          :total="total"
          :page-sizes="[5, 10, 20]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="loadList"
          @current-change="loadList"
        />
      </div>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailVisible" title="预约详情" width="520px">
      <el-descriptions v-if="detailRow" :column="1" border>
        <el-descriptions-item label="仪器名称">{{ detailRow.instrumentName }}</el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ detailRow.startTime }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ detailRow.endTime }}</el-descriptions-item>
        <el-descriptions-item label="实验用途">{{ detailRow.purpose }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="BOOKING_STATUS[detailRow.status]?.tag || 'info'">
            {{ BOOKING_STATUS[detailRow.status]?.label || detailRow.status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item v-if="detailRow.status === 'REJECTED'" label="驳回理由">
          {{ detailRow.rejectReason || '（未填写）' }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button v-if="canCancel(detailRow)" type="danger" plain @click="onCancel(detailRow)">取消预约</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { fetchMyBookings, cancelBooking } from '@/api/booking'
import { BOOKING_STATUS } from '@/utils/dict'

const router = useRouter()

const query = reactive({ status: '', pageNum: 1, pageSize: 10 })
const list = ref([])
const total = ref(0)
const loading = ref(false)

const detailVisible = ref(false)
const detailRow = ref(null)

/** 仅待审批、已通过的预约可以取消（已完成/驳回/取消不可再操作） */
function canCancel(row) {
  return ['PENDING', 'APPROVED'].includes(row?.status)
}

async function loadList() {
  loading.value = true
  try {
    const data = await fetchMyBookings({
      status: query.status || undefined,
      pageNum: query.pageNum,
      pageSize: query.pageSize
    })
    list.value = data.list || []
    total.value = data.total || 0
  } catch {
    // 错误已由拦截器统一提示
  } finally {
    loading.value = false
  }
}

function onSearch() {
  query.pageNum = 1
  loadList()
}

function onReset() {
  query.status = ''
  query.pageNum = 1
  loadList()
}

async function onCancel(row) {
  try {
    await ElMessageBox.confirm(
      `确定取消「${row.instrumentName}」${row.startTime} 开始的预约吗？`,
      '取消预约',
      { confirmButtonText: '确定取消', cancelButtonText: '再想想', type: 'warning' }
    )
  } catch {
    return
  }
  try {
    await cancelBooking(row.id)
    ElMessage.success('预约已取消')
    detailVisible.value = false
    loadList()
  } catch {
    // 错误已由拦截器统一提示
  }
}

function showDetail(row) {
  detailRow.value = row
  detailVisible.value = true
}

function goBooking() {
  router.push({ name: 'InstrumentList' })
}

onMounted(loadList)
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }
.filter-card :deep(.el-card__body) { padding-bottom: 2px; }
.filter-card :deep(.el-form-item) { margin-bottom: 12px; }
.pager { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
