<script setup lang="ts">
import { Icon } from '@iconify/vue'

import { useFocusLock } from '@/composables/useFocusLock'
import { useEventListener } from '@vueuse/core'

import type { XDrawerProps, XDrawerEmits } from './helper'
import { DrawerContext } from './helper'
import { style } from './_style'

defineOptions({ name: 'XDrawer' })

const props = withDefaults(
  defineProps<XDrawerProps>(),
  {
    placement: 'right',
    width: '30%',
    height: '30%',
    showClose: true,
    maskClosable: true,
    closeOnEsc: true,
  }
)

const emit = defineEmits<XDrawerEmits>()
const visible = defineModel<boolean>({ required: true })

const mounted = ref(false)

const drawer = ref<HTMLElement | null>(null)
const { handleTab } = useFocusLock(visible, drawer)

const isNumber = (value: unknown) => typeof value === 'number'

const isVertical = computed(() => 
  props.placement === 'left' ||
  props.placement === 'right'
)

const drawerStyle = computed(() => {
  const style: Record<string, string> = {}

  if (isVertical.value) {
    if (isNumber(props.width)) style.width = `${props.width}px`
    else style.width = props.width
  }
  else {
    if (isNumber(props.height)) style.height = `${props.height}px`
    else style.height = props.height
  }
  return style
})

if (props.closeOnEsc) {
  useEventListener(document, 'keydown', handleKeyDown)
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      handleClose()
    }
  }
}

watch(
  visible,
  (value) => {
    const body = document.body
    if (value) body.style.overflow = 'hidden'
    else body.style.overflow = ''
    value && (mounted.value = true)
  },
  { immediate: true }
)

function handleClose() {
  visible.value = false
  emit('close')
}

let mouseDownOnMask = false
function handleMaskMousedown(e: MouseEvent) {
  if (e.target === e.currentTarget) mouseDownOnMask = true
  else mouseDownOnMask = false
}

function handleMaskMouseup(e: MouseEvent) {
  if (e.target === e.currentTarget && mouseDownOnMask) {
    if (props.maskClosable) {
      handleClose()
    }
  }
}

provide(DrawerContext, { isDrawer: true })
const b = style({ placement: props.placement })
</script>

<template>
  <Teleport to="body">
    <div
      :class="b.mask({ class: uiMask, visible })"
      @mousedown="handleMaskMousedown"
      @mouseup="handleMaskMouseup"
    >
      <Transition :name="`x-drawer-${placement}`">
        <div
          v-if="mounted" v-show="visible" ref="drawer"
          :class="b.root({ class: uiRoot, placement })"
          :style="drawerStyle"
          @keydown="handleTab"
        >
          <slot name="header">
            <div v-if="title" :class="b.header()">
              <h3 :class="b.title()">{{ title }}</h3>
              <button
                v-if="showClose"
                :class="b.closeBtn()"
                @click="handleClose"
              >
                <Icon icon="lucide:x" class="size-5" />
              </button>
            </div>
          </slot>

          <div :class="b.body()">
            <slot />
          </div>

          <slot name="footer" />
        </div>
      </Transition>
    </div>
  </Teleport>
</template>
