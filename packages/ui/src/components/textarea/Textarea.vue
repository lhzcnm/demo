<script setup lang="ts">
import type { XTextareaProps, XTextareaValue } from './helper'
import { twMerge } from 'tailwind-merge'

defineOptions({ name: 'XTextarea' })
const props = defineProps<XTextareaProps>()
const value = defineModel<XTextareaValue>({ default: '' })
</script>

<template>
  <textarea
    v-model="value"
    :id="props.id"
    :name="props.name"
    :rows="props.rows"
    :cols="props.cols"
    :placeholder="props.placeholder"
    :disabled="props.disabled"
    :class="twMerge(
      'w-full border rounded px-3 py-1.5',
      'text-sm bg-transparent border border-input',
      'hover:border-hover shadow-sm transition-colors',
      'focus:outline-none focus:ring-1 focus:ring-primary',
      'disabled:bg-muted disabled:text-muted-foreground',
      'disabled:hover:border-input disabled:shadow-none',
      props.class
    )"
  />
</template>
