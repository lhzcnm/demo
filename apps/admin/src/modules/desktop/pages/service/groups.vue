<script setup lang="ts">
import GroupDialog from './components/GroupDialog.vue'

import { zServiceGroupForm } from '@/inters/services'
import { GROUP_STORE, type ServiceGroupStore } from './utils'
import { columns } from './utils/columnGroup'
import { ColumnEnum, initColumns, storageColumn } from '@/utils/column.ts'

const serviceStore = useServiceStore()
const store: ServiceGroupStore = reactive({
  formBase: zServiceGroupForm.parse({}),
  visibleBase: false,
  index: undefined,
})

provide(GROUP_STORE, store)

const initedColumns = initColumns(columns, ColumnEnum.ServiceGroup)

function openCreate() {
  store.formBase = zServiceGroupForm.parse({})
  store.index = undefined
  store.visibleBase = true
}
</script>

<template>
  <div>
    <section class="flex justify-between p-3 border-b">
      <XButton icon="lucide:circle-plus" label="新增服务组" @click="openCreate" />
    </section>

    <div class="p-3 pb-0">
      <XTable
        :data="serviceStore.groups"
        :columns="initedColumns"
        row-key="categoryId"
        class="border h-[calc(100vh-8.75rem)]"
        @column-resize="(column, width) => storageColumn(
          ColumnEnum.ServiceGroup,
          column.key.toString(),
          width
        )"
      />
    </div>

    <GroupDialog />
  </div>
</template>
