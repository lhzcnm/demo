<script setup lang="ts">
import { mergeProps } from 'vue'

import { useFloating, offset, flip, shift, size, autoUpdate } from '@floating-ui/vue'
import { onClickOutside, useEventListener } from '@vueuse/core'
import { useFocusLock } from '@/composables/useFocusLock'

import type { XPopoverProps, XPopoverSlots, XPopoverEmits, XPopoverTrigger } from './helper'
import { TRANSFORM_ORIGINS } from './helper'
import { style } from './_style'

defineOptions({ name: 'XPopover' })

const props = withDefaults(
  defineProps<XPopoverProps>(),
  {
    placement: 'bottom',
    offset: 8,
    closeOnClickOutside: false,
    closeOnEsc: true,
    teleport: 'body',
    trigger: 'click',
    hoverDelay: 200,
    openDelay: 200,
    animation: true,
    syncWidth: true,
    lazyRender: true,
    renderCtl: true,
    closeOnMouseLeave: false,
  }
)

const emit = defineEmits<XPopoverEmits>()
const slots = defineSlots<XPopoverSlots>()
const open = defineModel<boolean>({ required: true })

const floating = ref<HTMLElement | null>(null)
const trigger = ref<HTMLElement | null>(null)
// const triggerWidth = ref(0)

const closeTimer = ref<number>()
const openTimer = ref<number>()
const shouldRender = ref(false)

let renderTimeout: ReturnType<typeof setTimeout> | null = null

watch(open, (newVal) => {
  if(!props.renderCtl) shouldRender.value = true
  if(newVal) {
    shouldRender.value = true

    if(renderTimeout) 
      clearTimeout(renderTimeout)

    nextTick(() => {
      if(typeof update === 'function') {
        update()
      }
    })
  } else {
    renderTimeout = setTimeout(() => {
      shouldRender.value = false
    }, 300)
  }
},
{
  immediate: true,
})

const renderTrigger = () => {
  if (!slots.trigger) return null
  const triggerContent = slots.trigger()[0]
  const eventHandlers = getEventHandlers(props.trigger)

  const triggerVNode = h(
    triggerContent.type as Component,
    mergeProps(
      {
        ref: trigger,
        role: 'button',
        'aria-expanded': open.value,
        'aria-haspopup': 'true',
        onmouseleave: () => {
          if(!open.value) emit('mouseleave')
        },
      },
      eventHandlers,
      triggerContent.props || {},
    ),
    triggerContent.children as VNode[],
  )

  return triggerVNode
}

const { handleTab } = useFocusLock(open, floating)
const { floatingStyles, update, placement: actualPlacement } = useFloating(
  trigger,
  floating,
  {
    strategy: 'fixed',
    placement: props.placement,
    middleware: [
      offset(props.offset),
      flip(), shift(),
      size({
        apply({ rects, elements }) {
          if (!props.syncWidth) return
          const width = rects.reference.width
          const isForce = props.syncWidth === 'force'
          const token = isForce ? 'width' : 'minWidth'
          elements.floating.style[token] = `${width}px`
        },
      }),
    ],
    whileElementsMounted(...args) {
      const cleanup = autoUpdate(...args, {animationFrame: true})
      // Important! Always return the cleanup function.
      return cleanup
    },
  },
)

// lazy render & first force update
const mounted = ref(!props.lazyRender)
if (props.lazyRender) {
  watch(open, (val) => {
    if (val && !mounted.value) {
      mounted.value = true
      setTimeout(() => update(), 32)
    }
  })
}

watchPostEffect(() => !open.value && emit('closed'))
watch(actualPlacement, updateTransformOrigin)

onClickOutside(
  floating,
  () => {
    if (props.closeOnClickOutside) {
      open.value = false
    }
  },
  { ignore: [trigger, '.x-custom-ignore'] }
)

if (props.closeOnEsc) {
  useEventListener(
    document, 'keydown',
    (e) => {
      if (e.key === 'Escape')
        open.value = false
    },
  )
}

onMounted(() => updateTransformOrigin())
onUnmounted(() => {
  if (openTimer.value) 
    window.clearTimeout(openTimer.value)

  if (closeTimer.value)
    window.clearTimeout(closeTimer.value)

  if(renderTimeout)
    clearTimeout(renderTimeout)
})

function updateTransformOrigin() {
  const origin = TRANSFORM_ORIGINS[actualPlacement.value || props.placement] || 'top'

  nextTick(() => {
    if (!floating.value) return
    const style = floating.value.style
    style.setProperty('--x-popover-origin', origin)
  })
}

function getEventHandlers(trigger: XPopoverTrigger) {
  const eventHandlers: Record<string, () => void> = {}

  if (trigger === 'click') {
    eventHandlers.onClick = () => open.value = !open.value
  }
  else if (trigger === 'hover') {
    eventHandlers.onMouseleave = () => handleHover(false)
    eventHandlers.onMouseenter = () => handleHover(true)
  }
  else if (trigger === 'focus') {
    eventHandlers.onFocus = () => open.value = true
    eventHandlers.onBlur = () => open.value = false
  }

  return eventHandlers
}

function handleMouseEnter() {
  if (props.trigger === 'hover') handleHover(true)
}

function handleMouseLeave() {
  if (props.trigger === 'hover' && props.closeOnMouseLeave) handleHover(false)

  emit('mouseleave')
}

function handleHover(shouldOpen: boolean) {
  // Clear both timers
  if (closeTimer.value) {
    window.clearTimeout(closeTimer.value)
    closeTimer.value = undefined
  }
  if (openTimer.value) {
    window.clearTimeout(openTimer.value)
    openTimer.value = undefined
  }

  // Set appropriate timer
  if (shouldOpen) {
    if (!open.value) {
      openTimer.value = window.setTimeout(
        () => open.value = true,
        props.openDelay
      )
    }
  } else {
    closeTimer.value = window.setTimeout(
      () => open.value = false,
      props.hoverDelay
    )
  }
}

function getTeleportTo() {
  const isString = typeof props.teleport === 'string'
  if (isString) return props.teleport
  return props.teleport || 'body'
}

const b = style()
</script>

<template>
  <component :is="renderTrigger()" />
  <Teleport
    :to="getTeleportTo()"
    :disabled="teleport === false"
  >
    <div
      ref="floating"
      v-if="shouldRender"
      :class="b.root({ class: uiRoot })"
      :style="floatingStyles"
      @keydown="handleTab"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <Transition
        name="x-popover"
        :disabled="!props.animation"
      >
        <div
          v-if="mounted" v-show="open"
          :class="b.content({ class: uiContent })"
          role="menu" aria-orientation="vertical"
        >
          <slot />
        </div>
      </Transition>
    </div>
  </Teleport>
</template>
