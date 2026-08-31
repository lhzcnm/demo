<script setup lang="ts">
import FieldDialog from './components/FieldDialog.vue'

import { toast } from 'vue-sonner'

import type { ServiceFieldListParams } from '@/inters/services'
import { zServiceFieldForm } from '@/inters/services'
import { deleteServiceField, getServiceFields } from '@/api/services'
import { createList, defaultPageSize, pageSizes } from '@/utils'

import { FIELD_STORE, type ServiceFieldStore } from './utils'
import { columns } from './utils/columnField'
import type { XTableExpose } from '@3un/ui'
import FieldCreate from './components/FieldCreate.vue'
import { ColumnEnum, initColumns, storageColumn } from '@/utils/column.ts'

const serviceStore = useServiceStore()
await serviceStore.getItems()

const store: ServiceFieldStore = reactive({
  fields: createList(),

  formBase: zServiceFieldForm.parse({}),
  visibleBase: false,
  visibleCreate: false,

  refresh: false,
  loading: false,
  index  : undefined,
  page   : 1,
  limit  : defaultPageSize,
  serviceId: undefined,
})

provide(FIELD_STORE, store)

// const serviceId = ref<number>()
const ids = ref<number[]>([])
const loading = ref(false)
const tableRef = ref<XTableExpose | null>(null)

const initedColumns = initColumns(columns, ColumnEnum.ServiceField)

watch(
  [
    () => store.serviceId,
    () => store.page,
    () => store.limit,
    () => store.refresh,
  ],
  ([serviceId, page, limit]) => {
    if(serviceId) {
      store.formBase.serviceId = serviceId
    }
    getList({ page, pageSize: limit, serviceId })
  },
  { immediate: true },
)

function getList(params: ServiceFieldListParams) {
  loading.value = true

  const response = getServiceFields(params)
  response.then((data) => store.fields = data)
  response.finally(() => loading.value = false)

  tableRef.value?.scrollToTop()
}

// function openCreate() {
//   if(!serviceId.value) {
//     store.formBase = zServiceFieldForm.parse({})
//   }
//   store.index = undefined
//   store.visibleBase = true
// }

function handleDelete() {
  if (!ids.value.length) {
    toast.warning('请选择要删除的字段')
    return
  }

  deleteServiceField(ids.value).then(() => {
    store.refresh = !store.refresh
  })
}
</script>

<template>
  <div>
    <section class="flex justify-between p-3 border-b">
      <div class="flex items-center">
        <SelectService
          v-model="store.serviceId"
          ui-trigger="w-56"
          clearable
        />

        <hr class="h-6 w-px mx-4 bg-border" />

        <XButton
          label="新增"
          class="mr-2"
          color="success"
          icon="lucide:circle-plus"
          @click="store.visibleCreate = true"
        />

        <XButton
          label="批量删除"
          color="danger"
          icon="lucide:trash"
          @click="handleDelete"
        />
      </div>

      <XPagination
        v-model="store.page"
        v-model:limit="store.limit"
        :total="store.fields.total"
        :sizes="pageSizes"
        :layouts="['total', 'prev', 'pager', 'next', 'sizes']"
      />
    </section>

    <div class="p-3 pb-0">
      <XTable
        ref="tableRef"
        :data="store.fields.list"
        :columns="initedColumns"
        :loading="loading"
        row-key="id"
        selection selected-key="id"
        class="border h-[calc(100vh-8.75rem)]"
        @select-change="ids = $event"
        @column-resize="(column, width) => storageColumn(
          ColumnEnum.ServiceField,
          column.key.toString(),
          width
        )"
      />
    </div>

    <FieldDialog />
    <FieldCreate />
  </div>
</template>
