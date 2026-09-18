<script setup lang="ts">
import { XPopover } from '../popover'
import { Icon } from '@iconify/vue'

import type { XBtnSplitProps, XBtnSplitEmits } from './helper'
import { style } from './_style'

defineOptions({ name: 'XButtonSplit' })

const props = withDefaults(defineProps<XBtnSplitProps>(), {
  openClick: false,
})
const emit = defineEmits<XBtnSplitEmits>()

const visible = ref(false)
const b = style()

function handleClick(fn: VoidFunction | undefined) {
  visible.value = false
  fn?.()
}

function handleBtnClick() {
  if(props.openClick) {
    visible.value = !visible.value
  } else {
    emit('click')
  }
}
</script>

<template>
  <div :class="b.root()">
    <button :class="b.button({ size })" @click="handleBtnClick">
      <Icon
        v-if="props.icon" :icon="props.icon"
        :class="b.buttonIcon({ size })"
      />
      <span>{{ props.label }}</span>
    </button>

    <XPopover
      v-model="visible"
      :sync-width="false"
      :ui-root="uiTrigger"
      teleport="#xbtn-splits"
      placement="bottom-end"
      closeOnClickOutside
    >
      <template #trigger>
        <button :class="b.trigger({ size })">
          <Icon icon="lucide:chevron-down" class="size-4" />
        </button>
      </template>

      <div :class="b.content()">
        <template v-for="(option, index) in props.options" :key="index">
          <button v-if="option" :class="b.option()" @click="handleClick(option.command)">
            <Icon v-if="option.icon" :icon="option.icon" class="size-4" />
            <span>{{ option.label }}</span>
          </button>
          <div v-else :class="b.divider()" />
        </template>
      </div>
    </XPopover>
  </div>
</template>
