<script setup lang="ts">
import type { XPagerEmits, XPagerProps } from './helper'
import { pageStyle } from './_style'

defineProps<XPagerProps>()
const emit = defineEmits<XPagerEmits>()

const b = pageStyle()
</script>

<template>
  <div :class="b.root()">
    <button
      v-text="1"
      :class="['item', b.item({ isCurPage: isFirstPage })]"
    />
    <button
      v-if="showBeforeMore"
      v-text="'...'"
      :class="b.item()"
      @click="emit('more', 'prev')"
    />
    <button
      v-for="page in pages" :key="page"
      v-text="page"
      :class="['item', b.item({ isCurPage: page === current })]"
    />
    <button
      v-if="showAfterMore"
      v-text="'...'"
      :class="b.item()"
      @click="emit('more', 'next')"
    />
    <button
      v-if="lastPage > 1"
      v-text="lastPage"
      :class="['item', b.item({ isCurPage: isLastPage })]"
    />
  </div>
</template>
