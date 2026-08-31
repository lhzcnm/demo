<script setup lang="ts">
import UnlockDialog from './components/UnlockDialog.vue'
import UnlockConvert from './components/UnlockConvert.vue'

import { zUnlockForm } from '@/inters/services'
import { getUnlockList } from '@/api/services'

import { UNLOCK_STORE, type UnlockStore } from './utils'
import { columns } from './utils/columnUnlock'
import { ColumnEnum, initColumns, storageColumn } from '@/utils/column.ts'

const store: UnlockStore = reactive({
  unlocks: [],

  formBase: zUnlockForm.parse({}),

  visibleBase: false,
  visibleConvert: false,

  refresh: false,

  index: undefined,
})

provide(UNLOCK_STORE, store)

const initedColumns = initColumns(columns, ColumnEnum.ServiceUnlock)

watch(
  () => store.refresh,
  async () => {
    await getList()
  }
)

await getList()
async function getList() {
  store.unlocks = await getUnlockList()
}

function openCreate() {
  store.formBase = zUnlockForm.parse({})
  store.index = undefined
  store.visibleBase = true
}
</script>

<template>
  <div>
    <section class="p-3 border-b">
      <XButton
        icon="lucide:circle-plus"
        label="新增" @click="openCreate"
      />
    </section>

    <div class="p-3 pb-0">
      <XTable
        :data="store.unlocks"
        :columns="initedColumns"
        row-key="id"
        class="border h-[calc(100vh-8.75rem)]"
        @column-resize="(column, width) => storageColumn(
          ColumnEnum.ServiceUnlock,
          column.key.toString(),
          width
        )"
      />
    </div>

    <UnlockDialog />
    <UnlockConvert />
  </div>
</template>
