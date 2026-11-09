<template>
  <div class="page">
    <!-- 筛选区 -->
    <el-card shadow="never" class="filter-card">
      <el-form inline @submit.prevent="onSearch">
        <el-form-item label="仪器名称">
          <el-input
            v-model="query.name"
            placeholder="按名称/型号搜索"
            clearable
            style="width: 200px"
            @keyup.enter="onSearch"
            @clear="onSearch"
          />
        </el-form-item>
        <el-form-item label="设备状态">
          <el-select v-model="query.status" placeholder="全部状态" clearable style="width: 140px" @change="onSearch">
            <el-option
              v-for="(item, key) in INSTRUMENT_STATUS"
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

    <!-- 列表 -->
    <el-card shadow="never">
      <el-table v-loading="loading" :data="list" empty-text="暂无仪器数据">
        <el-table-column prop="name" label="仪器名称" min-width="170" show-overflow-tooltip />
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
        <el-table-column prop="remark" label="备注" min-width="120" show-overflow-tooltip>
          <template #default="{ row }">{{ row.remark || '—' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <el-tooltip
              :disabled="isBookable(row)"
              content="维修/停用仪器暂不可预约"
              placement="top"
            >
              <span style="margin-right: 8px">
                <el-button
                  type="primary"
                  size="small"
                  :disabled="!isBookable(row)"
                  @click="goBooking(row)"
                >预约</el-button>
              </span>
            </el-tooltip>
            <el-button size="small" @click="showDetail(row)">详情</el-button>
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
    <el-dialog v-model="detailVisible" title="仪器详情" width="480px">
      <el-descriptions v-if="detailRow" :column="1" border>
        <el-descriptions-item label="仪器名称">{{ detailRow.name }}</el-descriptions-item>
        <el-descriptions-item label="型号">{{ detailRow.model }}</el-descriptions-item>
        <el-descriptions-item label="位置">{{ detailRow.location }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="INSTRUMENT_STATUS[detailRow.status]?.tag || 'info'">
            {{ INSTRUMENT_STATUS[detailRow.status]?.label || detailRow.status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="可用时段">
          每日 {{ detailRow.availableStart }} – {{ detailRow.availableEnd }}
        </el-descriptions-item>
        <el-descriptions-item label="备注">{{ detailRow.remark || '—' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button
          type="primary"
          :disabled="!isBookable(detailRow)"
          @click="goBooking(detailRow)"
        >去预约</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Refresh } from '@element-plus/icons-vue'
import { fetchInstruments } from '@/api/instrument'
import { INSTRUMENT_STATUS, isBookable } from '@/utils/dict'

const router = useRouter()

const query = reactive({
  name: '',
  status: '',
  pageNum: 1,
  pageSize: 10
})

const list = ref([])
const total = ref(0)
const loading = ref(false)

const detailVisible = ref(false)
const detailRow = ref(null)

/** 拉取列表：筛选条件 + 分页（接口契约 v1.1，返回 { list, total }） */
async function loadList() {
  loading.value = true
  try {
    const data = await fetchInstruments({
      name: query.name || undefined,
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

/** 查询：任何新条件都回到第 1 页 */
function onSearch() {
  query.pageNum = 1
  loadList()
}

function onReset() {
  query.name = ''
  query.status = ''
  query.pageNum = 1
  loadList()
}

/** 仅「正常」状态可预约，携带仪器 id 跳预约表单（WBS 4.3 → 4.4 串联） */
function goBooking(row) {
  router.push({ name: 'BookingCreate', query: { instrumentId: row.id } })
}

function showDetail(row) {
  detailRow.value = row
  detailVisible.value = true
}

onMounted(loadList)
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }
.filter-card :deep(.el-card__body) { padding-bottom: 2px; }
.filter-card :deep(.el-form-item) { margin-bottom: 12px; }
.pager { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
