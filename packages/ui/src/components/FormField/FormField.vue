<script setup lang="ts">
import { style } from './_style'
import { type FormFieldProps } from './helper'

defineOptions({ name: 'XFormField' })

const props = withDefaults(
  defineProps<FormFieldProps>(),
  {
    required: false,
    variant: 'horizontal',
    contentFlex: false,
  },
)

const b = style()
</script>

<template>
  <div :class="b.root({ variant, class: props.uiRoot })">
    <div class="flex-1">
      <p :class="b.title({ required })">{{ label }}</p>
      <span v-if="desc" :class="b.desc()">{{ desc }}</span>
    </div>

    <div :class="b.body({ contentFlex: contentFlex })">
      <slot />
    </div>
  </div>
</template>
