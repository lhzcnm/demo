<script setup lang="ts">
import { type BadgeProps } from './helper'
import { style } from './_style'

defineOptions({ name: 'XBadge' })
withDefaults(
  defineProps<BadgeProps>(),
  {
    limit: 99,
  },
)
</script>

<template>
  <span :class="style({ color, size })">
    {{ value > limit ? `${limit}+` : value }}
  </span>
</template>
