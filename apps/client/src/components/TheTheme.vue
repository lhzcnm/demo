<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { twMerge } from 'tailwind-merge'
import { THEME } from '@3un/utils'

interface ThemeProps {
  ghost?: boolean
}

const props = defineProps<ThemeProps>()

const theme = inject(THEME)!
const html = document.documentElement

const toggleTheme = () => {
  theme.value.isDark = !theme.value.isDark
  const target = theme.value.isDark ? 'dark' : 'light'

  localStorage.setItem('theme', target)
  html.className = html.className.replace(theme.value.name, target)
  theme.value.name = target
}
</script>

<template>
  <button
    accesskey="t"
    :class="twMerge(
      'p-2 rounded-full text-muted-foreground transition-colors duration-300',
      props.ghost ? 'bg-muted  hover:bg-muted' : 'bg-muted hover:bg-accent/20',
    )"
    aria-label="Toggle theme"
    @click="toggleTheme"
  >
    <Icon icon="lucide:moon" v-if="theme.isDark" class="size-4" />
    <Icon icon="lucide:sun" v-else class="size-4" />
  </button>
</template>
