<script setup lang="ts">
import type { XPageControlProps } from './helper'
import { twMerge } from 'tailwind-merge'
import { Icon } from '@iconify/vue'

defineProps<XPageControlProps>()
</script>

<template>
  <button
    :class="twMerge(
      'inline-flex items-center justify-center [&>svg]:size-5',
      'size-9 p-1 bg-primary hover:bg-primary/90 text-white rounded shadow-sm',
      'disabled:opacity-50 disabled:pointer-events-none',
    )"
    :disabled
  >
    <Icon :icon="type === 'prev' ? 'lucide:chevron-left' : 'lucide:chevron-right'" />
  </button>
</template>
