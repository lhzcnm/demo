<script setup lang="ts">
import OrderSearch from './components/OrderSearch.vue'
import OrderDialog from './components/OrderDialog.vue'
import OrderClean from './components/OrderClean.vue'

import { downloadFile, ORDER_STATUS } from '@3un/utils'
import { useClipboard } from '@vueuse/core'
import { toast } from 'vue-sonner'
import { hash } from 'ohash'

import type { Order, OrderListParams } from '@/inters/orders'
import { zOrderSearchForm, zOrderUpdateForm } from '@/inters/orders'
import { exportOrder, getOrders, pushOrder, reSubmitOrder, updateCodeStatus } from '@/api/orders'
import { createList, defaultPageSize, pageSizes } from '@/utils'

import type { OrderStore } from './utils'
import { columns } from './utils/column'
import { ORDER_STORE } from './utils'
import type { XTableExpose } from '@3un/ui'
import { ColumnEnum, initColumns, storageColumn } from '@/utils/column.ts'

const store: OrderStore = reactive({
  orders: createList(),

  formSearch: zOrderSearchForm.parse({}),
  formUpdate: zOrderUpdateForm.parse({}),
  formClean: { checked: '7', time: '' },

  visibleSearch: false,
  visibleUpdate: false,
  visibleClear: false,

  refresh: false,
  index  : undefined,
  page   : 1,
  limit  : defaultPageSize,
})

provide(ORDER_STORE, store)

const route = useRoute()
const { copy } = useClipboard()

const loading = ref(false)
const selected = shallowRef<Order[]>([])
const tableRef = ref<XTableExpose | null>(null)

const initedColumns = initColumns(columns, ColumnEnum.Order)

const queryHash = computed(() => hash(route.query)) 

watch(
  [
    () => store.page,
    () => store.limit,
    () => store.refresh,
  ],
  ([pageValue, limitValue]) => {
    const imeiList = store.formSearch.imeiList

    getList({
      page: pageValue,
      pageSize: limitValue,
      ...store.formSearch,
      imeiList: imeiList
        ? imeiList
            .trim()
            .split(/[\s,]+/)
            .filter(Boolean)
        : undefined,
    })
  }
)

watch(
  () => route.query,
  ({ imei, uid, q }) => {
    const statusMap = {
      wait: ORDER_STATUS.WAIT,
      processing: ORDER_STATUS.PROCESSING,
    }

    type StatusKey = keyof typeof statusMap

    store.formSearch = {
      ...zOrderSearchForm.parse({}),
      userId: uid ? Number(uid) : undefined,
      imeiList: imei ? imei as string: undefined,
      statusId: q ? statusMap[q as StatusKey] : undefined,
    }

    store.refresh = !store.refresh
    store.page = 1
  },
  { immediate: true }
)

function getList(params: OrderListParams) {
  loading.value = true

  const response = getOrders(params)
  response.then(data => store.orders = data)
  response.finally(() => loading.value = false)

  tableRef.value?.scrollToTop()
}

function resetSearch() {
  router.replace({
    force: true,
    path: route.path,
    query: { q: route.query.q },
  })
}

function handleCleanOrder() {
  store.formClean = { checked: '7', time: '' }
  store.visibleClear = true
}

function selectDecorator(fn: () => void) {
  return () => {
    if (selected.value.length === 0) {
      toast.warning('请先选择要操作的行')
      return
    }

    fn()
  }
}

const handleCopyImei = selectDecorator(() => {
  copy(
    selected.value
      .map(item => item.imeiNo)
      .filter(Boolean)
      .join('\n')
  )
  toast.success('复制成功')
})

const handleExport = selectDecorator(() => {
  const codeIds = selected.value.map(item => item.codeId)
  exportOrder(codeIds).then(data => downloadFile(data))
})

const handlePushOrder = selectDecorator(() => {
  const codeIds = selected.value.map(item => item.codeId)
  pushOrder(codeIds).then(() => {
    store.refresh = !store.refresh
    toast.success('推送成功')
  })
})

const handleAcceptOrder = selectDecorator(() => {
  const params = selected.value.map(item => ({
    userId: item.userId,
    codeId: item.codeId,
    codeStatusId: ORDER_STATUS.PROCESSING,
    originalStatus: item.codeStatusId,
  }))

  updateCodeStatus(params).then(() => {
    store.refresh = !store.refresh
    toast.success('接受成功')
  })
})

const handleReSubmitOrder = selectDecorator(() => {
  const codeIds = selected.value.map(item => item.codeId)
  reSubmitOrder(codeIds).then(() => {
    store.refresh = !store.refresh
    toast.success('重新提交成功')
  })
})

const handleRejectOrder = selectDecorator(() => {
  const params = selected.value.map(item => ({
    userId: item.userId,
    codeId: item.codeId,
    codeStatusId: ORDER_STATUS.FAILED,
    originalStatus: item.codeStatusId,
  }))

  updateCodeStatus(params).then(() => {
    store.refresh = !store.refresh
    toast.success('拒绝成功')
  })
})

const iStore = useSystemStore()
const router = useRouter()

const handleBatchEdit = selectDecorator(() => {
  iStore.selectedOrders = selected.value.map(item => ({
    imei: item.imeiNo,
    serviceId: item.packageId,
    status: item.codeStatusId,
    originalStatus: item.codeStatusId,
    serverOrderId: item.orderIdFromServer,
    code: item.code.trim().split('<br>').join('\n'),
    codeId: item.codeId,
  }))

  router.push('/batch-edit-orders')
})
</script>

<template>
  <div>
    <section class="flex justify-between p-3 border-b">
      <div class="flex items-center">
        <XButton
          label="筛选"
          class="mr-2"
          icon="lucide:filter"
          @click="store.visibleSearch = true"
        />
        <XButton
          label="清空筛选"
          variant="outline"
          icon="lucide:brush-cleaning"
          @click="resetSearch"
        />

        <hr class="h-6 w-px mx-4 bg-border" />

        <XButton
          label="清理订单"
          color="danger"
          variant="outline"
          icon="lucide:trash-2"
          @click="handleCleanOrder"
        />

        <!-- <hr class="h-6 w-px mx-4 bg-border" /> -->

        <!-- <XButton
          label="历史订单自动清理"
          color="success"
          variant="soft"
          icon="lucide:cctv"
          @click="store.visibleAutoClean = true"
        /> -->
      </div>

      <XPagination
        v-model="store.page"
        v-model:limit="store.limit"
        :total="store.orders.total"
        :sizes="pageSizes"
        :layouts="[
          'total',
          'prev',
          'pager',
          'next',
          'sizes',
          'jumper',
        ]"
      />
    </section>

    <section class="flex items-center p-3 pb-0">
      <XButton
        class="mr-2"
        size="sm"
        label="导出订单"
        icon="lucide:file-input"
        @click="handleExport"
      />
      <XButton
        size="sm"
        label="复制IMEI"
        icon="lucide:copy"
        @click="handleCopyImei"
      />
      
      <hr class="h-5 w-px mx-4 bg-border" />

      <XButton
        icon="lucide:wand-sparkles"
        size="sm" label="批量编辑"
        @click="handleBatchEdit"
      />

      <hr class="h-5 w-px mx-4 bg-border" />

      <div class="space-x-2">
        <XButton
          icon="lucide:bell" size="sm"
          color="warning" label="推送通知"
          @click="handlePushOrder"
        />
        <XButton
          icon="lucide:check-circle" size="sm"
          color="success" label="接受订单"
          @click="handleAcceptOrder"
        />
        <XButton
          icon="lucide:refresh-cw" size="sm"
          color="primary" label="重新提交"
          @click="handleReSubmitOrder"
        />
        <XButton
          icon="lucide:x" size="sm"
          color="danger" label="拒绝订单"
          @click="handleRejectOrder"
        />
      </div>
    </section>

    <div class="p-3 pb-0">
      <XTable
        ref="tableRef"
        :columns="initedColumns"
        :loading="loading"
        :data="store.orders.list"

        selection row-key="codeId"
        class="border h-[calc(100vh-11.125rem)]"
        @select-change="selected = $event"
        @column-resize="(column, width) => storageColumn(
          ColumnEnum.Order,
          column.key.toString(),
          width
        )"
      />
    </div>

    <OrderSearch :key="queryHash" />
    <OrderDialog />
    <OrderClean />
  </div>
</template>
