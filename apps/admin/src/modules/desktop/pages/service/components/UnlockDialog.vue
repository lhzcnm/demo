<script setup lang="ts">
import UnlockForm from './UnlockForm.vue'
import { createUnlock, updateUnlock } from '@/api/services'
import { UNLOCK_STORE } from '../utils'
import type { Unlock, UnlockCreateParams } from '@/inters/services/unlock'

const store = inject(UNLOCK_STORE)!
const formRef = useTemplateRef('formRef')

async function handleCreate() {
  const body: UnlockCreateParams = {
    ...store.formBase,
    operator: store.formBase.operator.replace(/；/g, ';')
  }

  const data = await createUnlock(body)
  store.unlocks.push(data)
  store.visibleBase = false
  // store.refresh = !store.refresh
}

async function handleUpdate() {
  const body: Unlock = {
    ...store.formBase,
    id: store.unlocks[store.index!].id,
    operator: store.formBase.operator.replace(/；/g, ';')
  }

  await updateUnlock(body)
  store.unlocks[store.index!] = body
  store.visibleBase = false
}
</script>

<template>
  <FormDialog
    v-model="store.visibleBase"
    :index="store.index"
    :update="handleUpdate"
    :create="handleCreate"
    :validate="formRef?.validateForm"
    @close="formRef?.clearErrors"
  >
    <UnlockForm ref="formRef" v-model="store.formBase" />
  </FormDialog>
</template>
