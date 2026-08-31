<script setup lang="ts">
import RechargeSearch from './components/RechargeSearch.vue'
import RechargeDialog from './components/RechargeDialog.vue'
import RechargeHandleFee from './components/RechargeHandleFee.vue'

import { toast } from 'vue-sonner'
import type { XTableExpose } from '@3un/ui'
import { xconfirm } from '@3un/utils'
import dayjs from 'dayjs'
import { hash } from 'ohash'

import type { RechargeListParams, RechargeUpdateParams } from '@/inters/recharge'
import { deleteRecharges, getRecharges } from '@/api/recharge'
import { zRechargeHandleFee, zRechargeSearchForm } from '@/inters/recharge'
import { createList, defaultPageSize, pageSizes } from '@/utils'

import type { RechargeStore } from './utils'
import { columns } from './utils/column'
import { RECHARGE_STORE } from './utils'
import { ColumnEnum, initColumns, storageColumn } from '@/utils/column.ts'

const store: RechargeStore = reactive({
  recharges: createList(),

  formSearch: zRechargeSearchForm.parse({}),
  formUpdate: {} as RechargeUpdateParams,
  handleFee: zRechargeHandleFee.parse({}),

  visibleSearch: false,
  visibleUpdate: false,
  visibleHandleFee: false,

  refresh: false,
  index: undefined,
  page: 1,
  limit: defaultPageSize,

})

provide(RECHARGE_STORE, store)

const route = useRoute()
const router = useRouter()
const { configs } = useSystemStore()

const ids = ref<number[]>([])
const loading = ref(false)
const tableRef = ref<XTableExpose | null>(null)

const queryHash = computed(() => hash(route.query))
const packageStore = usePackageStore()
await packageStore.getList()

const initedColumns = initColumns(columns, ColumnEnum.Recharge)

store.handleFee = {
  aliFee: (+configs['recharge:fee'] * 100).toString(),
  aliThreshold: configs['recharge:threshold'],
  wxFee: (+configs['recharge:wxFee'] * 100).toString(),
  wxThreshold: configs['recharge:wxThreshold'].toString(),
}

const isAdmin = computed(() => {
  return route.query.q === 'admin'
})

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
      ...store.formSearch,
      byAdmin: (!isAdmin.value && store.formSearch.paymentMethod === 5) ? true : store.formSearch.byAdmin
    })
  },
)

watch(
  () => route.query,
  ({ uid, q }) => {
    store.formSearch = {
      ...zRechargeSearchForm.parse({}),
      userId: uid ? Number(uid) : undefined,
      byAdmin: q === 'admin',
    }

    if (q === 'today') {
      const format = 'YYYY-MM-DD HH:mm:ss'
      store.formSearch.startTime = dayjs().startOf('day').format(format)
      store.formSearch.endTime = dayjs().endOf('day').format(format)
    }

    store.refresh = !store.refresh
    store.page = 1
  },
  { immediate: true },
)

function getList(params: RechargeListParams) {
  loading.value = true

  const response = getRecharges(params)
  response.then((data) => store.recharges = data)
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

async function handleDelete() {
  if (ids.value.length === 0) {
    return toast.warning('请选择要删除的充值记录')
  }

  if (!await xconfirm('确定要删除这些充值记录吗？')) return

  deleteRecharges(ids.value).then(() => {
    store.refresh = !store.refresh
  })
}
</script>

<template>
  <div>
    <section class="flex justify-between p-3 border-b">
      <div class="flex items-center">
        <XButton label="筛选" class="mr-2" icon="lucide:filter" @click="store.visibleSearch = true" />
        <XButton label="清空筛选" variant="outline" icon="lucide:x" @click="resetSearch" />

        <hr class="h-6 w-px mx-4 bg-border" />

        <XButton color="success" label="手续费设置" icon="iconoir:settings" @click="store.visibleHandleFee = true" />

        <hr class="h-6 w-px mx-4 bg-border" />

        <XButton color="danger" label="批量删除" icon="lucide:trash-2" @click="handleDelete" />
      </div>

      <XPagination
        v-model="store.page"
        v-model:limit="store.limit"
        :total="store.recharges.total"
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
        :data="store.recharges.list"
        :loading="loading" selection
        row-key="paymentId"
        selected-key="paymentId" class="border h-[calc(100vh-8.75rem)]"
        @select-change="ids = $event"
        @column-resize="(column, width) => storageColumn(
          ColumnEnum.Recharge,
          column.key.toString(),
          width
        )"
      />
    </div>

    <RechargeSearch :key="queryHash" />
    <RechargeDialog />
    <RechargeHandleFee />
  </div>
</template>
