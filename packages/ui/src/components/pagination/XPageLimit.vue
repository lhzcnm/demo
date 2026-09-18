<script setup lang="ts">
import { XSelect, XSelectItem } from '../select'
import type { XPageLimitProps } from './helper'

defineProps<XPageLimitProps>()
const selected = defineModel<number>()
</script>

<template>
  <XSelect v-model="selected" ui-trigger="w-32">
    <XSelectItem
      v-for="size in sizes" :key="size"
      :value="size" :label="`${size} 条/页`"
    />
  </XSelect>
</template>
