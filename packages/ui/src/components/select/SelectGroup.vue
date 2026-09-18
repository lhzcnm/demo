<script setup lang="ts">
import type { XSelectGroupProps } from './helper'
import { groupStyle } from './_style'

defineOptions({ name: 'XSelectGroup' })

withDefaults(
  defineProps<XSelectGroupProps>(),
  {
    title: '',
  }
)

const b = groupStyle()
</script>

<template>
  <div :class="b.root({ class: uiRoot })">
    <span :class="b.title({ class: uiTitle })">
      {{ title }}
    </span>
    <slot />
  </div>
</template>
