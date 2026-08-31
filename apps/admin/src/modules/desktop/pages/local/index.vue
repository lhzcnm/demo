<script setup lang="ts">
// import { execFile } from 'child_process';
import CreateDialog from './components/CreateDialog.vue'
import SearchDialog from './components/SearchDialog.vue'
import UpdateDialog from './components/UpdateDialog.vue'

import { pageSizes } from '@/utils/common'
import { localListTable } from './utils/localTable'
import { createLocalForm, useLocalStore } from './utils/store'
import { ColumnEnum, initColumns, storageColumn } from '@/utils/column.ts'

const store = useLocalStore()
// const size = ref<number[]>([50, 100, 200, 300, 500])

const initedColumns = initColumns(localListTable, ColumnEnum.Locale)

watch(
  () => [store.searchForm.page, store.searchForm.pageSize],
  ([page, pageSize], [oldPage, oldPageSize]) => {
    if (page !== oldPage) {
      store.getData()
    }
    if (pageSize !== oldPageSize) {
      store.searchForm.page = 1
      store.getData()
    }

  }, { deep: true })

function clearForm() {
  store.searchForm = {
    ...store.searchForm,
    ch: '',
    en: '',
    fullKey: '',
    module: Number(store.query) == -1 ? undefined : Number(store.query)
  };
  store.getData()
}

const route = useRoute()

watch(() => route.query.q, (q) => {
  store.query = q ? String(route.query.q) : '-1'
  const queryModule = Number(store.query)
  
  store.searchForm.module = queryModule === -1 ? undefined : queryModule
  store.createForm.module = queryModule
  store.updateForm.module = queryModule
  clearForm()
  store.getData()
}, { immediate: true })


watch(() => store.localDialog.createDialog, () => {
  if (!store.localDialog.createDialog) {
    clearCreateForm()
  }
})

function clearCreateForm() {
  if (store.query == '-1') {
    store.createForm = { ...createLocalForm }
  } else {
    store.createForm = {
      ...createLocalForm,
      module: Number(store.query)
    }
  }
}

onMounted(() => {
  store.isShow = import.meta.env.VITE_APP_LOCAL == 'true'

})
</script>

<template>
  <div>
    <section class="w-full flex justify-between p-2 border-b ">
      <div class="space-x-2">
        <XButton @click="store.localDialog.searchDialog = true" label="筛选" variant="outline" />
        <XButton @click="clearForm" label="刷新" color="warning" variant="outline" />
        <XButton v-if="store.isShow" @click="store.localDialog.createDialog = true" label="新增" color="success"
          variant="outline" />
      </div>

      <XPagination
        :sizes="pageSizes"
        v-model="store.searchForm.page"
        v-model:limit="store.searchForm.pageSize"
        :total="store.total"
        :layouts="[
          'total',
          'prev',
          'pager',
          'next',
          'sizes',
        ]" />
    </section>

    <section class="p-3 pb-0">
      <XTable
        ref="tableRef"
        :columns="initedColumns"
        :data="store.localList"
        class="border h-[calc(100vh-8.75rem)]"
        @column-resize="(column, width) => storageColumn(
          ColumnEnum.Locale,
          column.key.toString(),
          width
        )"
      />
    </section>
    
    <SearchDialog />
    <CreateDialog />
    <UpdateDialog />
  </div>
</template>