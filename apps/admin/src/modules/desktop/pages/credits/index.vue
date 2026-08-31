<script setup lang="ts">
import CreditSearch from './components/CreditSearch.vue'
import CreditClean from './components/CreditClean.vue'

import type { CreditListParams } from '@/inters/credits'
import { zCreditSearchForm } from '@/inters/credits'
import { getCreditList } from '@/api/credits'

import type { CreditStore } from './utils'
import { CREDIT_STORE, columns } from './utils'
import { createList, defaultPageSize, pageSizes } from '@/utils'
import { hash } from 'ohash'
import type { XTableExpose } from '@3un/ui'
import { ColumnEnum, initColumns, storageColumn } from '@/utils/column.ts'

const store: CreditStore = reactive({
  credits: createList(),

  formSearch: zCreditSearchForm.parse({}),
  formClean: { checked: '90', time: '' },

  visibleSearch: false,
  visibleClean: false,

  refresh: false,
  page   : 1,
  limit  : defaultPageSize,
})

provide(CREDIT_STORE, store)

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const queryHash = computed(() => hash(route.query))

const tableRef = ref<XTableExpose | null>(null)

const initedColumns = initColumns(columns, ColumnEnum.Credit)

watch(
  [
    () => store.page,
    () => store.limit,
    () => store.refresh,
  ],
  ([pageValue, limitValue]) => {
    const imeiNo = store.formSearch.imeiNo

    getList({
      page: pageValue,
      pageSize: limitValue,
      ...store.formSearch,
      imeiNo: imeiNo
        ? imeiNo
            .trim()
            .split(/[\s,]+/)
            .filter(Boolean)
        : undefined,
    })
  },
)

watch(
  () => route.query,
  ({ uid, sid }) => {
    store.formSearch = {
      ...zCreditSearchForm.parse({}),
      userId: uid ? Number(uid) : undefined,
      serviceId: sid ? Number(sid) : undefined,
    }

    store.refresh = !store.refresh
    store.page = 1
  },
  { immediate: true },
)

function getList(params: CreditListParams) {
  loading.value = true

  const response = getCreditList(params)
  response.then(data => store.credits = data)
  response.finally(() => loading.value = false)

  tableRef.value?.scrollToTop()
}

function handleCleanOrder() {
  store.formClean = { checked: '90', time: '' }
  store.visibleClean = true
}

function resetSearch() {
  router.replace({
    force: true,
    path: route.path
  })
}
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
          label="清理记录"
          color="danger"
          variant="outline"
          icon="lucide:trash-2"
          @click="handleCleanOrder"
        />
      </div>

      <XPagination
        v-model="store.page"
        v-model:limit="store.limit"
        :total="store.credits.total"
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
        :data="store.credits.list"
        row-key="id"
        class="border h-[calc(100vh-8.75rem)]"
        @column-resize="(column, width) => storageColumn(
          ColumnEnum.Credit,
          column.key.toString(),
          width
        )"
      />
    </div>

    <CreditSearch :key="queryHash" />
    <CreditClean />
  </div>
</template>
