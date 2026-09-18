<script setup lang="ts">
import type { XSwitchProps, XSwitchEmits } from './helper'
import { style } from './_style'

defineOptions({ name: 'XSwitch' })

const props = withDefaults(
  defineProps<XSwitchProps>(),
  {
    activeValue: true,
    inactiveValue: false,
    leftLabel: '',
    size: 'md',
  }
)

const emit = defineEmits<XSwitchEmits>()
const toggle = defineModel<any>({ default: false })

const id = props.id || useId()

function handleChange(event: Event) {
  const target = event.target as HTMLInputElement
  const newValue = target.checked ? props.activeValue : props.inactiveValue
  toggle.value = newValue
  emit('change', target.checked)
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.code === 'Enter' || event.code === 'Space') {
    event.preventDefault()

    const checkbox = document.getElementById(id) as HTMLInputElement
    if (!checkbox) return

    checkbox.checked = !checkbox.checked
    toggle.value = checkbox.checked ? props.activeValue : props.inactiveValue
    emit('change', checkbox.checked)
  }
}

const b = style({ size: props.size })
</script>

<template>
  <label 
    :for="id" 
    :class="b.root()"
    :aria-checked="toggle === activeValue"
    tabindex="0" role="switch"
    @keydown="handleKeyDown"
  >
    <span :class="b.label()">
      <slot>{{ leftLabel }}</slot>
    </span>
    <input
      :id="id"
      :name="name"
      :checked="toggle === activeValue"
      type="checkbox" tabindex="-1"
      class="sr-only peer"
      @change="handleChange"
    />
    <div :class="b.input()" />
    <span :class="b.label()">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>
