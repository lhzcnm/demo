<script setup lang="ts">
import type { XRadioProps, XRadioValue } from './helper'
import { style } from './_style'

defineOptions({ name: 'XRadio' })

const props = withDefaults(
  defineProps<XRadioProps>(),
  {
    label: '',
    value: '',
    name: '',
  }
)

const checked = defineModel<XRadioValue>({ required: true })

const id = props.id || useId()
const b = style()
</script>

<template>
  <label :for="id" :class="b.root()">
    <input
      v-model="checked"
      :id="id"
      :name="name"
      :value="value"
      :class="b.input()"
      type="radio"
    />
    <span :class="b.label()">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>
