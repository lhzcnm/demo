<script setup lang="ts">
import type { XTagProps } from './helper'
import { style } from './_style'

defineOptions({ name: 'XTag' })
const props = defineProps<XTagProps>()
</script>

<template>
  <span
    :class="style({
      class: props.class,
      color: props.color,
      size: props.size,
      solid: props.solid,
    })"
  >
    <slot>{{ label }}</slot>
  </span>
</template>
