<script setup lang="ts">
import { ORDER_VERIFY } from '@3un/utils'
import { toast } from 'vue-sonner'

import type { Order, OrderListParams } from '@/inters/orders'
import { getOrders, updateOrderVerify } from '@/api/orders'
import { zOrderSearchForm } from '@/inters/orders'
import { createList, defaultPageSize, pageSizes } from '@/utils'

import type { VerifyStore } from './utils'
import { columns } from './utils/columnVerify'
import { VERIFY_STORE } from './utils'
import type { XTableExpose } from '@3un/ui'
import { ColumnEnum, initColumns, storageColumn } from '@/utils/column'

const store: VerifyStore = reactive({
  orders: createList(),

  refresh: false,
  page   : 1,
  limit  : defaultPageSize,
})

provide(VERIFY_STORE, store)

const loading = ref(false)
const selected = shallowRef<Order[]>([])
const tableRef = ref<XTableExpose | null>(null)

const initedColumns = initColumns(columns, ColumnEnum.OrderVerify)

watch(
  [
    () => store.page,
    () => store.limit,
    () => store.refresh,
  ],
  ([pageValue, limitValue]) => {
    getList({
      page: pageValue,
      pageSize: limitValue,
      ...zOrderSearchForm.parse({}),
      verify: ORDER_VERIFY.REPLIED,
      imeiList: undefined,
    })
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

function handleReply(verify: number) {
  if (selected.value.length === 0) {
    toast.warning('请先选择要操作的行')
    return
  }

  const verifyList = selected.value.map(item => ({
    code: item.code.trim().split('\n').join('<br>'),
    originalStatus: item.codeStatusId,
    codeId: item.codeId,
    userId: item.userId,
    codeStatusId: verify,
    verify,
  }))

  const response = updateOrderVerify(verifyList)
  response.then(() => {
    store.refresh = !store.refresh
    store.page = 1
  })
}
</script>

<template>
  <div>
    <section class="flex justify-between p-3 border-b">
      <div class="flex space-x-2">
        <XButton
          label="批量回复"
          icon="lucide:message-circle-reply"
          @click="handleReply(ORDER_VERIFY.SOLVED)"
        />
        <XButton
          label="批量退积分"
          color="danger" icon="lucide:x"
          @click="handleReply(ORDER_VERIFY.REFUNDED)"
        />
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

    <div class="p-3 pb-0">
      <XTable
        ref="tableRef"
        :columns="initedColumns"
        :loading="loading"
        :data="store.orders.list"
        selection row-key="codeId"
        class="border h-[calc(100vh-8.75rem)]"
        @select-change="selected = $event"
        @column-resize="(column, width) => storageColumn(
          ColumnEnum.OrderVerify,
          column.key.toString(),
          width
        )"
      />
    </div>
  </div>
</template>
