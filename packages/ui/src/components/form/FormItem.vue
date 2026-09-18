<script setup lang="ts">
import type { XFormItemProps } from './hepler'
import { XFormContext } from './hepler'

defineOptions({ name: 'XFormItem' })

defineProps<XFormItemProps>()
const errors = inject(XFormContext)!
</script>

<template>
  <div>
    <label class="block text-label text-sm mb-1">{{ label }}</label>
    <slot />
    <p
      v-if="field && errors.has(field)"
      class="text-xs text-red-700 mt-1"
    >
      {{ errors.get(field) }}
    </p>
  </div>
</template>
