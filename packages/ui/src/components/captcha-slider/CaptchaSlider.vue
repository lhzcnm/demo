<script setup lang="ts">
import type { XCaptcha, XTrackList, XSliderCaptchaProps, XSliderCaptchaEmits } from './helper'
import { Icon } from '@iconify/vue'
import { XDialog } from '../dialog'
import { style } from './_style'

defineOptions({ name: 'XCaptchaSlider' })

const props = defineProps<XSliderCaptchaProps>()
const emits = defineEmits<XSliderCaptchaEmits>()
const visible = defineModel<boolean>({ required: true })
const captchaValidId = defineModel<string>('id')

let captchaId = ''

const position = ref(0)
const isDragging = ref(false)
const captcha = ref<XCaptcha['captcha']>()

let startTime = 0
let startPos = { x: 0, y: 0 }
let trackList: XTrackList[] = []

const bgRef = useTemplateRef('backgroundImageRef')
const templateRef = useTemplateRef('templateImageRef')

watch(visible, val => {
  if (!val) return
  position.value = 0
  refresh()
})

function refresh() {
  const response = props.refresh()

  response.then(({ data }) => {
    captcha.value = data.captcha
    captchaId = data.id
  })
}

type DragType = 'start' | 'move' | 'end'
type DragFunc = (clientX: number, clientY: number) => void

function preventDefault(fn: DragFunc, type: DragType) {
  return (event: MouseEvent | TouchEvent) => {
    if (!event) return
    event.preventDefault()

    let clientX: number
    let clientY: number
    let target: HTMLElement | null = null

    if ('touches' in event) {
      // For touch events
      if (event.type === 'touchend') {
        // Use changedTouches for touchend event
        const touch = event.changedTouches[0]
        clientX = touch.clientX
        clientY = touch.clientY
      } else {
        // Use touches for other touch events
        const touch = event.touches[0]
        clientX = touch.clientX
        clientY = touch.clientY
        target = touch.target as HTMLElement
      }
    } else {
      // For mouse events
      clientX = event.clientX
      clientY = event.clientY
      target = event.target as HTMLElement
    }

    // Only try to update cursor style if we have a target
    if (target) {
      const sliderThumb = target.closest('.slider-thumb') as HTMLElement
      if (sliderThumb) {
        if (type === 'start') sliderThumb.style.cursor = 'grabbing'
        else if (type === 'end') sliderThumb.style.cursor = 'grab'
      }
    }

    fn(clientX, clientY)
  }
}

function startDragging(clientX: number, clientY: number) {
  startPos.x = clientX
  startPos.y = clientY
  startTime = Date.now()
  isDragging.value = true

  trackList.push({
    type: 'down', x: 0, y: 0,
    t: startTime
  })
}

function onDragging(clientX: number, clientY: number) {
  if (!isDragging.value || !captcha.value) return

  const { x, y } = startPos
  const t = startTime

  const deltaX = clientX - x
  const newPos = Math.max(0, Math.min(deltaX, 278))
  position.value = newPos

  trackList.push({
    type: 'move',
    x: clientX - x,
    y: clientY - y,
    t: Date.now() - t
  })
}

function endDragging(clientX: number, clientY: number) {
  if (!isDragging.value || !captcha.value) return
  isDragging.value = false

  const { x, y } = startPos
  const t = startTime

  trackList.push({
    type: 'move',
    x: clientX - x,
    y: clientY - y,
    t: Date.now() - t
  })

  verifyCaptcha()
}

async function verifyCaptcha() {
  const body = {
    id: captchaId,
    data: {
      bgImageWidth: bgRef.value!.width,
      bgImageHeight: bgRef.value!.height,
      templateImageWidth: templateRef.value!.width,
      templateImageHeight: templateRef.value!.height,
      startTime,
      stopTime: Date.now(),
      trackList,
    }
  }

  try {
    const result = await props.verify(body)
    captchaValidId.value = result.data
    emits('verified', result.data)
  } catch (error) {
    position.value = 0
    refresh()
  }
}

const handleMouseDown = preventDefault(startDragging, 'start')
const handleTouchStart = preventDefault(startDragging, 'start')
const handleMouseMove = preventDefault(onDragging, 'move')
const handleTouchMove = preventDefault(onDragging, 'move')
const handleMouseUp = preventDefault(endDragging, 'end')
const handleTouchEnd = preventDefault(endDragging, 'end')

const b = style()
</script>

<template>
  <XDialog
    v-model="visible" title="滑动验证"
    :ui-root="b.root()"
  >
    <div
      @mousemove="handleMouseMove"
      @touchmove="handleTouchMove"
      @mouseup="handleMouseUp"
      @touchend="handleTouchEnd"
    >
      <div v-if="captcha" :class='b.images()'>
        <img
          ref="backgroundImageRef"
          :class='b.bgImage()'
          :src="captcha.backgroundImage" alt="bg"
          :width="captcha.backgroundImageWidth"
          :height="captcha.backgroundImageHeight"
          draggable="false"
        />
        <img
          ref="templateImageRef"
          :class='b.templateImage()'
          :style="{ transform: `translateX(${position}px)` }"
          :src="captcha.templateImage" alt="template"
          :height="captcha.templateImageHeight"
          width="60" draggable="false"
        />
      </div>
      <div v-else :class='b.loading()'>
        <div class="flex items-center justify-center h-full">
          <Icon icon="lucide:loader" class="animate-spin" />
        </div>
      </div>

      <div :class='b.slider()'>
        <div :class='b.sliderText()'>
          向右滑动完成验证
        </div>
        <div
          :class="b.sliderThumb()"
          :style="{ transform: `translateX(${position}px)` }"
          @mousedown="handleMouseDown"
          @touchstart="handleTouchStart"
        >
          <Icon icon="lucide:tally-4" :class='b.sliderThumbIcon()'/>
        </div>
      </div>
    </div>
  </XDialog>
</template>
