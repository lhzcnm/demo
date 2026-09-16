<script setup lang="ts">
import FuntionButtonGroup from './FuntionButtonGroup.vue'

// import { Icon } from '@iconify/vue'
import { twJoin } from 'tailwind-merge'


// const isEn = computed(() => locale.value === 'en')

// function goToInstruction() {
//   window.open('http://docx.3unlocked.com/#/', '_blank')
// }
</script>

<template>
  <header :class="twJoin(
    'w-full h-mobile-header px-3 bg-card',
    'border-b dark:border-white/5',
    'shadow-sm dark:shadow-md dark:shadow-white/5'
  )">
    <div class="flex items-center justify-between h-mobile-header">
      <TheLogo size="1.75rem" />

      <nav class="flex items-center space-x-3">
        <FuntionButtonGroup />
        <TodoMsg />

        <LanguageSwitch />
        <TheAvatar class="size-8" />
      </nav>
    </div>
  </header>
</template>
