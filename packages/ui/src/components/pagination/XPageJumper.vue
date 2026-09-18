<script setup lang="ts">
import type { XPageJumperProps } from './helper'
import { XInput } from '../input'

defineProps<XPageJumperProps>()
</script>

<template>
  <XInput
    :model-value="modelValue"
    placeholder="页码"
    style="width: 80px"
  />
</template>
