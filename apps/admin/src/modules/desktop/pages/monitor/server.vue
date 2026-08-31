<script setup lang="ts">
import ServerSearch from './components/ServerSearch.vue'
import ServerDialog from './components/ServerDialog.vue'

import type { XTableExpose } from '@3un/ui'

import { zMonitorForm, zMonitorSearch, type MonitorServerSearchForm } from '@/inters/monitor/server'
import { MONITOR_SERVER_STORE, type MonitorServerStore } from './utils'
import { getMonitorServers } from '@/api/monitor'
import { createList, defaultPageSize, pageSizes } from '@/utils'
import { columns } from "./utils/columnServer"
import { ColumnEnum, initColumns, storageColumn } from '@/utils/column.ts'

const store: MonitorServerStore = reactive({
  visibleSearch: false,
  visibleBase: false,

  formSearch: zMonitorSearch.parse({}),
  formBase: zMonitorForm.parse({}),
  servers: createList(),

  page: 1,
  limit: defaultPageSize,
  refresh: false,
  domainId: undefined,
})

provide(MONITOR_SERVER_STORE, store)

const loading = ref<boolean>(false)
const tableRef = ref<XTableExpose | null> (null)

const initedColumns = initColumns(columns, ColumnEnum.Monitor)

watch(
  [
    () => store.page,
    () => store.limit,
    () => store.refresh,
  ],
  async ([pageVal, limitVal]) => {
    await getList({
      ...store.formSearch,
      page: pageVal,
      pageSize: limitVal,
    })
  },
  {
    immediate: true,
  }
)

async function getList(params: MonitorServerSearchForm) {
  try {
    loading.value = true
    store.servers = await getMonitorServers(params)
    tableRef.value?.scrollToTop()
  } finally {
    loading.value = false
  }
}

function initSearchData() {
  store.formSearch = zMonitorSearch.parse({})
  store.refresh = !store.refresh
}
</script>

<template>
  <div>
    <section class="flex justify-between p-3 border-b">
      <div class="flex items-center gap-2">
        <XButton label="筛选" icon="lucide:filter" @click="store.visibleSearch = true" />
        <XButton label="清除筛选" variant="outline" icon="lucide:x" @click="initSearchData" />
      </div>

      <XPagination
        v-model="store.page"
        v-model:limit="store.limit"
        :total="store.servers.total"
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
        :data="store.servers.list"
        :loading="loading"
        class="border h-[calc(100vh-8.75rem)]"
        @column-resize="(column, width) => storageColumn(
          ColumnEnum.Monitor,
          column.key.toString(),
          width
        )"
      />
    </div>

    <ServerSearch />
    <ServerDialog />
  </div>
</template>
