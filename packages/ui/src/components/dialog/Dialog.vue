<script setup lang="ts">
import type { XDialogProps, XDialogEmits, XDialogExpose } from './helper'
import { useFocusLock } from '@/composables/useFocusLock'
import { useEventListener } from '@vueuse/core'
import { Icon } from '@iconify/vue'
import { style } from './_style'
import { vDrag } from '@/utils/drag'

defineOptions({ name: 'XDialog' })

const props = withDefaults(
  defineProps<XDialogProps>(),
  {
    text: '',
    title: '',
    closeBtn: true,
    maskClosable: true,
    closeOnEsc: true,
    draggable: false,
    teleport: "body",
    scrollToTopOnClose: true,
  },
)

const emit = defineEmits<XDialogEmits>()
const visible = defineModel<boolean>({ required: true })

const dialogBody = ref<HTMLElement | null>(null)

const mounted = ref(false)
const isShaking = ref(false)

const dialog = ref<HTMLElement | null>(null)

const { handleTab } = useFocusLock(visible, dialog)

defineExpose<XDialogExpose>({
  get el() {
    return dialog.value
  }
})

watch(
  visible,
  (value) => {
    const body = document.body
    if (!value) {
      body.style.overflow = ''
      return emit('close')
    }

    body.style.overflow = 'hidden'
    mounted.value = true
  },
  { immediate: true }
)

if (props.closeOnEsc) {
  useEventListener(document, 'keydown', handleKeyDown)
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape')
      handleClose(true)
  }
}

function handleClose(force = false) {
  if (!props.maskClosable && !force) {
    isShaking.value = true
    setTimeout(() => isShaking.value = false, 350)
    return
  }

  visible.value = false
  bodyScrollToTop()
  emit('close')
}

let mouseDownOnMask = false
function handleMaskMousedown(e: MouseEvent) {
  if (e.target === e.currentTarget) mouseDownOnMask = true
  else mouseDownOnMask = false
}

function handleMaskMouseup(e: MouseEvent) {
  if (e.target === e.currentTarget && mouseDownOnMask) {
    handleClose()
  }
}

function bodyScrollToTop() {
  if (!dialogBody.value) return 

  if (props.scrollToTopOnClose) {
    dialogBody.value.scrollTop = 0

    const scrollEl = dialogBody.value.firstElementChild
    if (scrollEl) {
      scrollEl.scrollTop = 0
    }
  }
}

const b = style()
</script>

<template>
  <Teleport :to="teleport">
    <div
      :class="b.mask({ class: uiMask, visible })"
      @mousedown="handleMaskMousedown"
      @mouseup="handleMaskMouseup"
    >
      <Transition name="x-dialog">
        <div
          v-if="mounted" v-show="visible" v-drag="draggable" ref="dialog"
          :class="b.root({ class: uiRoot, isShaking })"
          @keydown="handleTab"
        >
          <slot name="header">
            <div
              v-if="props.title" :class="[b.header({ class: uiHeader }), { 'x-dialog-header': draggable }]">
              <h3 :class="b.title({ class: uiTitle })">{{ props.title }}</h3>
              <button
                v-if="props.closeBtn"
                :class="b.closeBtn()"
                @click="handleClose(true)"
              >
                <Icon icon="lucide:x" :class="b.closeIcon()"  />
              </button>
            </div>
          </slot>

          <div ref="dialogBody" :class="b.body()">
            <slot name="default">
              <div
                v-html="text"
                :class="b.text({ class: uiText })"
              />
            </slot>
          </div>

          <slot name="footer" />
        </div>
      </Transition>
    </div>
  </Teleport>
</template>
