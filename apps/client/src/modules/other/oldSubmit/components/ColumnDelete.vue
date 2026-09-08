<script setup lang="ts">
import { Icon } from '@iconify/vue'

import { SUBMIT_STORE } from '../utils'
import type { OrderTableView } from '@/api/orders'
import type { XTableV2Column } from '@3un/ui'

interface ColumnDeleteProps {
  col: XTableV2Column<OrderTableView>
}

const props = defineProps<ColumnDeleteProps>()

const store = inject(SUBMIT_STORE)!

function handleClick() {
  if (store.onClickHeaderDelete) {
    store.onClickHeaderDelete(props.col)
  }
}
</script>

<template>
  <button class="opacity-0 group-hover:opacity-100 flex items-center" @click="handleClick">
    <Icon icon="lucide:x" class="size-4" />
  </button>
</template>
