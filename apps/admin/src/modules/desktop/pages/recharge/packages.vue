<script setup lang="ts">
import PackageDialog from './components/PackageDialog.vue'
import { zRechargePackageForm } from '@/inters/recharge'

import type { PackageStore } from './utils'
import { columns } from './utils/columnPackage'
import { PACKAGE_STORE } from './utils'
import { getRechargePackages } from '@/api/recharge'
import { ColumnEnum, initColumns, storageColumn } from '@/utils/column.ts'

const levelStore = useLevelStore()
await levelStore.getList()

const store: PackageStore = reactive({
  packages: await getRechargePackages(),
  
  formBase: zRechargePackageForm.parse({}),
  visibleBase: false,

  refresh: false,
  index  : undefined,
})

provide(PACKAGE_STORE, store)

const initedColumns = initColumns(columns, ColumnEnum.RechargePackage)

function openCreate() {
  store.formBase = zRechargePackageForm.parse({})
  store.index = undefined
  store.visibleBase = true
}
</script>

<template>
  <div>
    <section class="flex justify-between p-3 border-b">
      <XButton icon="lucide:plus" label="添加套餐" @click="openCreate" />
    </section>

    <div class="p-3 pb-0">
      <XTable
        :columns="initedColumns"
        :data="store.packages" row-key="id"
        class="border h-[calc(100vh-8.75rem)]"
        @column-resize="(column, width) => storageColumn(
          ColumnEnum.RechargePackage,
          column.key.toString(),
          width
        )"
      />
    </div>

    <PackageDialog />
  </div>
</template>
