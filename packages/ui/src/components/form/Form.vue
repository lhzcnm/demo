<script setup lang="ts">
import type { XFormProps } from './hepler'
import { XFormContext } from './hepler'

defineOptions({ name: 'XForm' })

const props = defineProps<XFormProps>()
let errors = ref<Map<string, string>>(new Map())

defineExpose({
  validateForm() {
    const res = props.schema.safeParse(props.model)
    if (res.success) return true

    for (const issue of res.error.issues) {
      errors.value.set(
        issue.path[0] as string,
        issue.message
      )
    }
    return false
  },
  clearErrors() {
    errors.value.clear()
  },
})

provide(XFormContext, errors)
</script>

<template>
  <form class="space-y-4" @submit.prevent>
    <slot />
  </form>
</template>
