<script setup lang="ts">
import type { XBtnColor, XBtnSize, XBtnVariant } from '@3un/ui'

const ButtonLayouts = [
  "filter",
  "import",
  "export",
  "submit",
  "confirm",
  "clear",
  "copy",
  "add",
  "cancel",
  "fresh",
] as const

type ButtonLayout = (typeof ButtonLayouts)[number]

interface ButtonConfigItem {
  color: XBtnColor,
  variant: XBtnVariant,
}

interface ButtonGroupProps {
  layouts: ButtonLayout[],
  size?: XBtnSize,
  disabled?: boolean,
  labels?: Partial<Record<ButtonLayout, string>>,
}

interface ButtonGroupEmits {
  filter: [],
  import: [],
  export: [],
  submit: [],
  confirm: [],
  clear: [],
  print: [],
  copy: [],
  generate: [],
  add: [],
  cancel: [],
  fresh: [],
}

type ButtonConfig = Record<ButtonLayout, ButtonConfigItem>
type ButtonLabel = Record<ButtonLayout, string>

const props = withDefaults(
  defineProps<ButtonGroupProps>(),
  {
    size: 'md',
    labels: () => ({})
  }
)

const emits = defineEmits<ButtonGroupEmits>()

const localStore = useLocalStore()

const buttonConfigs: ButtonConfig = {
  filter: { color: 'primary', variant: 'solid' },
  import: { color: 'primary', variant: 'solid' },
  export: { color: 'success', variant: 'solid' },
  submit: { color: 'primary', variant: 'solid' },
  confirm: { color: 'primary', variant: 'solid' },
  clear: { color: 'danger', variant: 'solid' },
  copy: { color: 'primary', variant: 'ghost', },
  add: { color: 'primary', variant: 'solid' },
  cancel: { color: 'primary', variant: 'soft' },
  fresh: { color: 'success', variant: 'outline' }
}

const buttonLabels: ButtonLabel = {
  filter: localStore.localData['submit_Filter'],
  import: localStore.localData['submit_ImportButton'],
  export: localStore.localData['history_Export'],
  submit: localStore.localData['submit_Submit'],
  confirm: localStore.localData['history_ConfirmSearch'],
  clear: localStore.localData['submit_Clear'],
  copy: localStore.localData['profile_Copy'],
  add: localStore.localData['top_Add'],
  cancel: localStore.localData['profile_Cancel'],
  fresh: localStore.localData['device_RefreshButton']
}

const mergedLabels = computed(() => {
  return {
    ...buttonLabels,
    ...props.labels
  }
})

function handleClick(layout: ButtonLayout) {
  // @ts-ignore
  emits(layout)
}
</script>

<template>
  <template v-for="layout in layouts">
    <XButton :color="buttonConfigs[layout].color" :variant="buttonConfigs[layout].variant" :label="mergedLabels[layout]"
      :size="size" :disabled="disabled" @click="handleClick(layout)" />
  </template>
</template>
