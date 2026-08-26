<script setup lang="ts">
import type { UnlockCreateParams } from '@/inters/services'
import { zUnlockForm } from '@/inters/services'

const form = defineModel<UnlockCreateParams>({ required: true })
const formRef = useTemplateRef('formRef')
const serviceStore = useServiceStore()

function handleSelected(value: number) {
  const service = serviceStore.itemMap.get(value)
  if (service) form.value.name = service.packageTitle
}

defineExpose({
  validateForm: () => formRef.value!.validateForm(),
  clearErrors: () => formRef.value!.clearErrors(),
})
</script>

<template>
  <XForm ref="formRef" :model="form" :schema="zUnlockForm">
    <XFormItem label="服务ID" field="packageId">
      <SelectService v-model="form.packageId" @selected="handleSelected" />
    </XFormItem>

    <XFormItem label="服务名称" field="name">
      <XInput v-model="form.name" placeholder="服务名称" />
    </XFormItem>

    <XFormItem label="触发关键字(多个关键字可使用';'分割)" field="operator">
      <XInput v-model="form.operator" placeholder="触发关键字, 多个关键字使用';'分割" />
    </XFormItem>
  </XForm>
</template>
