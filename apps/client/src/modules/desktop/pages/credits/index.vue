<script setup lang="ts">
import type { CreditLogsResponse } from '@/api/user'
import { userApi } from '@/api/user'
import { getCreditColumns } from './utils/columns'
import { ColumnEnum, initColumns, storageColumn } from '@/utils/column'

const page = ref(1)
const limit = ref(20)

const response = { list: [], page: 1, pageSize: 20, total: 0 }
const creditLogs = ref<CreditLogsResponse>(response)
const loading = ref(false)

const serviceStore = useServiceStore()
await serviceStore.getServices()

// const columns = getCreditColumns()
const initedColumns = initColumns(getCreditColumns(), ColumnEnum.Credit)

watch(
  [page, limit],
  async ([pageVal, pageSizeVal]) => {
    loading.value = true
    const response = await userApi.creditLogs({
      pageSize: pageSizeVal,
      page: pageVal
    })
    creditLogs.value = response.data
    loading.value = false
  },
  { immediate: true }
)
</script>

<template>
  <div class="p-4 h-full">
    <section class="space-x-2 mb-3 flex justify-end">
      <!-- <div></div> -->
      <XPagination
        v-model="page"
        v-model:limit="limit"
        :total="creditLogs.total"
        class="flex-wrap gap-y-2"
        :layouts="[
          'total',
          'prev',
          'pager',
          'next',
          'sizes',
          'jumper'
        ]"
      />
    </section>

    <XTable
      :data="creditLogs.list"
      :columns="initedColumns"
      :loading="loading"
      row-key="historyId"
      class="h-[calc(100%-3rem)] border"
      @column-resize="(column, width) => storageColumn(
        ColumnEnum.Credit,
        column.key.toString(),
        width
      )"
    />
  </div>
</template>
