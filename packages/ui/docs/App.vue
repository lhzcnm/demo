<script setup lang="ts">
import type { Theme } from '~/utils/theme'
import { THEME } from '~/utils/theme'
import { contentPaths } from './utils/routes'

const html = document.documentElement
const isDark = html.classList.contains('dark')
const theme = ref<Theme>({
  name: isDark ? 'dark' : 'light',
  isDark: isDark,
})

provide(THEME, theme)

const links = contentPaths.map((path) => {
  const groups = path.match(/(?<name>[-\w]+)\/index.mdx/)?.groups
  return { to: `/${groups?.name}`, label: groups?.name }
})

const docRef = useTemplateRef('docRef')
const headerRef = useTemplateRef('headerRef')

function toggleForeground() {
  docRef.value?.classList.toggle('bg-card')
  headerRef.value?.classList.toggle('bg-card')
}
</script>

<template>
  <div class="p-3 flex flex-col gap-6 max-w-screen-lg mx-auto">
    <header ref="headerRef" class="w-full flex items-center mx-auto py-3 border rounded">
      <div class="flex-1 flex items-center flex-wrap gap-3 px-3">
        <TheLink v-for="link in links" :key="link.to" :to="link.to" :label="link.label" />
        <button class="text-sm" @click="toggleForeground">Toggle</button>
      </div>
      <div class="border-l px-3">
        <TheTheme />
      </div>
    </header>
    <main ref="docRef" class="docs w-full mx-auto p-3 sm:p-6 border rounded">
      <RouterView />
    </main>
  </div>
</template>
