<script setup lang="ts">
import type { XSelectProps, XSelectEmits, Option } from './helper'
import { Icon } from '@iconify/vue'

import { isNullish } from '@/utils'

import { XPopover } from '../popover'
import type { XSelectValue } from './helper'
import { XSELECT_CONTEXT } from './helper'
import { style } from './_style'

defineOptions({ name: 'XSelect' })

const props = withDefaults(
  defineProps<XSelectProps>(),
  {
    filterable: false,
    defaultValue: null,
    inputPlaceholder: '请输入',
    placeholder: '请选择',
    placement: 'bottom',
    lazyRender: false,
    size: 'md',
    closeOnMouseLeave: true,
  }
)

const emits = defineEmits<XSelectEmits>()
const search = defineModel<string>('input', { default: '' })
const model = defineModel<XSelectValue>()

const open = ref(false)
const options = ref<Option[]>([])

const displayText = computed(() => {
  const finded = options.value
    .findIndex(option => option.value === model.value)

  if (finded === -1) return props.placeholder
  return options.value[finded].label
})

provide(XSELECT_CONTEXT, { model, options, itemClick })

function itemClick(value: XSelectValue) {
  emits('selected', value)
  model.value = value
  open.value = false
}

function handleClear() {
  model.value = props.defaultValue
  emits('clear')
}

function handleLeave() {
  emits('mouseleave', open.value)
}

const b = style()
</script>

<template>
  <XPopover
    v-model="open"
    :placement="placement"
    :ui-content="b.root({ class: uiRoot })"
    :lazy-render="lazyRender"
    closeOnClickOutside
    :renderCtl="false"
    :close-on-mouse-leave="closeOnMouseLeave"
    @mouseleave="handleLeave"
  >
    <template #trigger>
      <button
        :class="b.trigger({
          class: uiTrigger,
          disabled: disabled,
          selected: !isNullish(model),
          size: props.size,
        })"
        :disabled="disabled"
      >
        <span :class="b.triggerText()">{{ displayText }}</span>
        <span :class="b.triggerIcon({ showClearIcon: clearable && !isNullish(model) })">
          <Icon icon="lucide:chevron-down" />
        </span>
        <span
          v-if="clearable"
          :class="b.clearIcon({ showClearIcon: !isNullish(model) })"
          @click.stop="handleClear"
        >
          <Icon icon="lucide:brush-cleaning" />
        </span>
      </button>
    </template>

    <div v-if="props.filterable" :class="b.input({ class: uiInput })">
      <Icon icon="lucide:search" :class="b.icon()" />
      <input
        v-model="search"
        autofocus type="text"
        :class="b.inputInner()"
        :placeholder="inputPlaceholder"
      >
    </div>
    <div :class="b.content({ class: uiContent })">
      <slot>
        <div :class="b.empty({ class: uiEmpty })">空空如也</div>
      </slot>
    </div>
  </XPopover>
</template>
