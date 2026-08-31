<script setup lang="ts">
import OssUpload from './components/OssUpload.vue'

import type { IPage } from '@3un/shared'
import type { XTableExpose } from '@3un/ui'

import { deleteOssData, getOssDataList } from '@/api/oss'
import { createList, defaultPageSize, pageSizes } from '@/utils'
import { columns } from './utils/column'
import { OSS_STORE, type OssStore } from './utils'
import { toast } from 'vue-sonner'
import { ColumnEnum, initColumns, storageColumn } from '@/utils/column.ts'

const store = reactive<OssStore>({
  visibleUpdate: false,

  ossData: createList(),

  page: 1,
  pageSize: defaultPageSize,
  refresh: false,
})
provide(OSS_STORE, store)

const loading = ref<boolean>(false)
const selectIds = ref<number[]>([])

const tableRef = ref<XTableExpose | null>(null)

const initedColumns = initColumns(columns, ColumnEnum.Oss)

const notDelete = [43, 44, 45, 46, 47, 48]

watch(
  ([() => store.page, () => store.pageSize, () => store.refresh]),
  async ([pageVal, sizeVal]) => {
    await getList({
      page: pageVal,
      pageSize: sizeVal
    })
  },
  { immediate: true }
)

watch(
  (() => store.pageSize),
  () => store.page = 1
)

async function getList(params: IPage) {
  loading.value = true
  const data = await getOssDataList(params)
  store.ossData = data
  tableRef.value?.scrollToTop()
  loading.value = false
  // console.log(data)
}

function openUpdate() {
  store.visibleUpdate = true
}

async function handleBatchDelete() {
  if (selectIds.value.length === 0) return toast.warning("请选择需要删除的数据")

  const hasProtected = selectIds.value.some(id => notDelete.includes(id))

  if (hasProtected) {
    return toast.error("包含系统保留文件，禁止删除")
  }
  
  try {
    await deleteOssData(selectIds.value)
    toast.success("删除成功")
    store.page = 1
    store.refresh = !store.refresh
  } catch {}
}
</script>

<template>
  <div>
    <section class="flex justify-between p-3 border-b">
      <div class="flex items-center space-x-4">
        <XButton label="更新oss" icon="lucide:cloud-upload" @click="openUpdate" />
        <XButton label="刷新" icon="lucide:refresh-ccw" color="warning" @click="store.refresh = !store.refresh" />
        <XButton label="批量删除" color="danger" icon="lucide:trash-2" @click="handleBatchDelete"  />
      </div>

      <XPagination
        v-model="store.page"
        v-model:limit="store.pageSize"
        :total="store.ossData.total"
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
        class="border h-[calc(100vh-8.75rem)]"
        ref="tableRef"
        :columns="initedColumns"
        :data="store.ossData.list"
        :loading="loading"
        selection
        selected-key="ossId"
        @select-change="selectIds = $event"
        @column-resize="(column, width) => storageColumn(
          ColumnEnum.Oss,
          column.key.toString(),
          width
        )"
      />
    </div>

    <OssUpload />
  </div>
</template>
