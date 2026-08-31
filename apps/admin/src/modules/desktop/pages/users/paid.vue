<script setup lang="ts">
import PaidSearch from './components/PaidSearch.vue'

import type { UserPaidListParams } from '@/inters/users'
import { zUserPaidSearchForm } from '@/inters/users'
import { getUserPaidList } from '@/api/users'
import { createList, defaultPageSize, pageSizes } from '@/utils'

import type { PaidStore } from './utils'
import { columns } from './utils/columnPaid'
import { PAID_STORE } from './utils'
import type { XTableExpose } from '@3un/ui'
import { ColumnEnum, initColumns, storageColumn } from '@/utils/column.ts'

const store: PaidStore = reactive({
  users        : createList(),
  formSearch   : zUserPaidSearchForm.parse({}),
  visibleSearch: false,
  refresh      : false,
  page         : 1,
  limit        : defaultPageSize,
})

provide(PAID_STORE, store)

const loading = ref(false)
const tableRef = ref<XTableExpose | null>(null)

const initedColumns = initColumns(columns, ColumnEnum.UserPaid)

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
  { immediate: true },
)

function getList(params: UserPaidListParams) {
  loading.value = true

  const response = getUserPaidList(params)
  response.then((data) => store.users = data)
  response.finally(() => loading.value = false)

  tableRef.value?.scrollToTop()
}

function resetSearch() {
  store.formSearch = zUserPaidSearchForm.parse({})
  store.refresh = !store.refresh
  store.page = 1
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
      </div>

      <XPagination
        v-model="store.page"
        v-model:limit="store.limit"
        :total="store.users.total"
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
        :data="store.users.list"
        :loading="loading"
        row-key="userId"
        class="border h-[calc(100vh-8.75rem)]"
        @column-resize="(column, width) => storageColumn(
          ColumnEnum.UserPaid,
          column.key.toString(),
          width
        )"
      />
    </div>

    <PaidSearch />
  </div>
</template>
