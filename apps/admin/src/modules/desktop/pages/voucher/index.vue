<script setup lang="ts">
import { createList, defaultPageSize, pageSizes } from '@/utils'
import { VOUCHER_STORE, type VoucherStore } from './utils'
import { zVoucherCreate, type VoucherListForm } from '@/inters/voucher'
import { deleteVoucher, getVouchers } from '@/api/voucher'
import { columns } from './utils/column'
import VoucherCreate from './components/VoucherCreate.vue'
import { toast } from 'vue-sonner'
import { ColumnEnum, initColumns, storageColumn } from '@/utils/column.ts'

const store: VoucherStore = reactive({
  visibleCreate: false,
  visibleUpdate: false,
  refresh: false,

  page: 1,
  limit: defaultPageSize,

  vouchers: createList(),

  createForm: zVoucherCreate.parse({}),
})

provide(VOUCHER_STORE, store)

const loading = ref<boolean>(false)
const ids = ref<number[]>([])

const initedColumns = initColumns(columns,ColumnEnum.Voucher)

watch(
  (
    [
      () => store.page,
      () => store.limit,
      () => store.refresh,
    ]
  ),
  ([pageVal, limitVal]) => {
    getVoucherList({
      page: pageVal,
      pageSize: limitVal,
    })
  },
  {
    immediate: true,
  },
)

async function getVoucherList(params: VoucherListForm) {
  try {
    loading.value = true
    const data = await getVouchers(params)
    store.vouchers = data
  } finally {
    loading.value = false
    store.refresh = false
    store.createForm = zVoucherCreate.parse({})
  }
}

async function batchDelete() {
  if (ids.value.length === 0) {
    return toast.warning("请选择需要删除的行")
  }
  
  try {
    await deleteVoucher(ids.value)
    toast.success("删除成功")
    store.refresh = !store.refresh
  } catch {}
}
</script>

<template>
  <div>
    <section class="flex justify-between p-3 border-b">
      <div class="flex space-x-2">
        <XButton
          icon="lucide:ticket-plus"
          label="生成券码"
          @click="store.visibleCreate = true"
        />

        <XButton
          color="danger"
          icon="lucide:trash-2"
          label="批量删除"
          @click="batchDelete"
        />
      </div>

      <XPagination
        v-model="store.page"
        v-model:limit="store.limit"
        :total="store.vouchers.total"
        :sizes="pageSizes"
        :layouts="[
          'total',
          'prev',
          'pager',
          'next',
          'sizes',
        ]"
      />
    </section>

    <section class="p-3 pb-0">
      <XTable
        ref="tableRef"
        :columns="initedColumns"
        :data="store.vouchers.list"
        :loading
        row-key="id"
        selection
        selected-key="id"
        class="border h-[calc(100vh-8.75rem)]"
        @select-change="ids = $event"

        @column-resize="(column, width) => storageColumn(
          ColumnEnum.Voucher,
          column.key.toString(),
          width
        )"
      />
    </section>

    <VoucherCreate />
  </div>
</template>
