<script setup lang="ts">
import { type ActivyRecharge } from '@/inters/activity/recharge'
import {  xconfirm } from '@3un/utils';
import { ACTIVITY_RECHARGE_STORE } from '../utils'
import { deleteRecharges } from '@/api/recharge'
import { toast } from 'vue-sonner'


interface ActivityRechargeActionProps {
  row: ActivyRecharge,
  index: number,
}

const { row } = defineProps<ActivityRechargeActionProps>()

const store = inject(ACTIVITY_RECHARGE_STORE)!

// const disabled = computed(() => !!row.voucherCode)

// async function openCreate() {
//   store.formCreate = zActivyVoucherForm.parse({
//     userId: row.userId,
//     paymentId: row.paymentId,
//     type: VOUCHER_TYPE.QUERY,
//   })

//   store.payment = zActivyRecharge.parse(row)
//   store.visibleCreate = true
// }

async function handleDelete() {
  if (!await xconfirm("是否确认删除该记录")) return
  try {
    await deleteRecharges([row.paymentId])
    toast.success("删除成功")
    store.refresh = !store.refresh
  } catch {  }
}
</script>

<template>
  <div class="flex gap-2">
    <!-- <XButton
      :disabled="disabled"
      label="生成积分券"
      size="sm" icon="lucide:ticket"
      @click="openCreate"
    /> -->
    <XButton
      color="danger"
      label="删除"
      size="sm" icon="lucide:trash-2"
      @click="handleDelete"
    />
  </div>
</template>
