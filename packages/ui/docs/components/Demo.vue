<script setup lang="ts">
import type { ClassNameValue } from 'tailwind-merge'
import { twMerge } from 'tailwind-merge'

interface DemoProps {
  class?: ClassNameValue
}

const props = defineProps<DemoProps>()
</script>

<template>
  <div
    :class="twMerge(
      'flex flex-col gap-3 my-3 p-3 border rounded',
      props.class
    )"
  >
    <slot />
  </div>
</template>
