<script setup lang="ts">
import LevelDialog from './components/LevelDialog.vue'
import LevelService from './components/LevelService.vue'

import { zLevelForm, zLevelServiceForm } from '@/inters/level'

import type { LevelStore } from './utils'
import { columns } from './utils/columnLevel'
import { LEVEL_STORE } from './utils'
import { ColumnEnum, initColumns, storageColumn } from '@/utils/column.ts'

const levelStore = useLevelStore()
await levelStore.getList(true)

const store: LevelStore = reactive({
  services: [],

  formBase: zLevelForm.parse({}),
  formService: zLevelServiceForm.parse({}),

  visibleBase: false,
  visibleService: false,

  index: undefined,
})

provide(LEVEL_STORE, store)

const initedColumns = initColumns(columns, ColumnEnum.UserLevel)

function openCreate() {
  store.formBase = zLevelForm.parse({})
  store.index = undefined
  store.visibleBase = true
}
</script>

<template>
  <div>
    <section class="p-3 border-b">
      <XButton
        color="success" icon="lucide:plus"
        label="新增等级" @click="openCreate"
      />
    </section>

    <div class="p-3 pb-0">
      <XTable
        :columns="initedColumns"
        :data="levelStore.levels"
        row-key="pricePlanId"
        class="border h-[calc(100vh-8.75rem)]"
        @column-resize="(column, width) => storageColumn(
          ColumnEnum.UserLevel,
          column.key.toString(),
          width
        )"
      />
    </div>

    <LevelDialog />
    <LevelService />
  </div>
</template>
