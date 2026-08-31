<script setup lang="ts">
import LogSearch from './components/LogSearch.vue'

import { toast } from 'vue-sonner'
import { xconfirm } from '@3un/utils'
import { hash } from 'ohash'

import type { LogListParams } from '@/inters/logs'
import { zLogSearchForm } from '@/inters/logs'
import { deleteLogs, getLogs } from '@/api/logs'
import { createList, defaultPageSize, pageSizes } from '@/utils'

import type { LogStore } from './utils'
import { columns } from './utils/column'
import { LOG_STORE } from './utils'
import type { XTableExpose } from '@3un/ui'
import { ColumnEnum, initColumns, storageColumn } from '@/utils/column.ts'

const store: LogStore = reactive({
  logs: createList(),

  formSearch: zLogSearchForm.parse({}),
  visibleSearch: false,

  refresh: false,
  page   : 1,
  limit  : defaultPageSize,
})

provide(LOG_STORE, store)

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const ids = ref<number[]>([])

const queryHash = computed(() => hash(route.query))

const tableRef = ref<XTableExpose | null>(null)

const initedColumns = initColumns(columns, ColumnEnum.Logs)

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
    })
  },
)

watch(
  () => route.query,
  ({ q, uid, ip }) => {
    store.formSearch = {
      ...zLogSearchForm.parse({}),
      isAdmin: q === 'admin',
      userId: uid ? Number(uid) : undefined,
      ip: ip ? ip.toString() : undefined,
    }

    store.refresh = !store.refresh
    store.page = 1
  },
  { immediate: true },
)

function getList(params: LogListParams) {
  loading.value = true

  const response = getLogs(params)
  response.then(data => store.logs = data)
  response.finally(() => loading.value = false)

  tableRef.value?.scrollToTop()
}

function resetSearch() {
  router.replace({
    force: true,
    path: route.path,
    query: {q: route.query.q}
  })
}

async function handleDelete() {
  if (ids.value.length === 0) {
    return toast.warning('请选择要删除的记录')
  }

  if (!await xconfirm('确定删除这些记录吗？')) return
  deleteLogs(ids.value).then(() => {
    store.refresh = !store.refresh
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
          label="批量删除"
          color="danger"
          icon="lucide:trash-2"
          @click="handleDelete"
        />
      </div>

      <XPagination
        v-model="store.page"
        v-model:limit="store.limit"
        :total="store.logs.total"
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
        :data="store.logs.list"
        :loading="loading"

        row-key="id"
        selection selected-key="id"
        class="border h-[calc(100vh-8.75rem)]"
        @select-change="ids = $event"

        @column-resize="(column, width) => storageColumn(
          ColumnEnum.Logs,
          column.key.toString(),
          width
        )"
      />
    </div>

    <LogSearch :key="queryHash" />
  </div>
</template>
