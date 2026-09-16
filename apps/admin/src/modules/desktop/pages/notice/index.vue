<script setup lang="ts">
import NoticeSearchDialog from './components/NoticeSearchDialog.vue'
import NoticeDialog from './components/NoticeDialog.vue'

import { zNoticeForm, zNoticeSearch, type NoticeSearch } from '@/inters/notice'
import { NOTICE_STORE, type NoticeStore } from './utils'
import { getNotices } from '@/api/notice'
import { columns } from "./utils/columnNotice"
import { ColumnEnum, initColumns, storageColumn } from '@/utils/column.ts'

const store: NoticeStore = reactive({
  visibleBase: false,
  visibleSearch: false,

  notices: [],
  formSearch: zNoticeSearch.parse({}),
  formBase: zNoticeForm.parse({}),

  refresh: false,
  index: undefined,
})

provide(NOTICE_STORE, store)

const loading = ref<boolean>(false)

const initedColumns = initColumns(columns, ColumnEnum.Notice)

watch(
  [
    () => store.refresh,
  ],
  async () => {
    await getList(store.formSearch)
  },
  {
    immediate: true,
  }
)

async function getList(params: NoticeSearch) {
  try {
    loading.value = true
    store.notices = await getNotices(params)
  } finally {
    loading.value = false
  }
}

function resetSearch() {
  store.formSearch = zNoticeSearch.parse({})
  store.refresh = !store.refresh
}

function openCreate() {
  store.index = undefined
  store.formBase = zNoticeForm.parse({})
  store.visibleBase = true
}
</script>

<template>
  <div>
    <section class="flex p-3 border-b">
      <div class="flex items-center gap-2">
        <XButton
          icon="lucide:filter"
          label="筛选"
          @click="store.visibleSearch = true"
        />

        <XButton
          label="清空筛选"
          variant="outline"
          icon="lucide:brush-cleaning"
          @click="resetSearch"
        />

        <hr class="h-full w-px mx-4 bg-border">

        <XButton
          label="新增公告"
          color="success"
          icon="lucide:plus"
          @click="openCreate"
        />
      </div>
    </section>

    <div class="p-3 pb-0">
      <XTable
        :columns="initedColumns"
        :data="store.notices"
        :loading="loading"
        class="border h-[calc(100vh-8.75rem)]"
        @column-resize="(column, width) => storageColumn(
          ColumnEnum.Notice,
          column.key.toString(),
          width
        )"
      />
    </div>

    <NoticeSearchDialog />
    <NoticeDialog />
  </div>
</template>
