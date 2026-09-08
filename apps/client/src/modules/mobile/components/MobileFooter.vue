<script setup lang="ts">
import { twMerge } from 'tailwind-merge'
import { Icon } from '@iconify/vue'

const store = useSettingStore()
const route = useRoute()

const localStore = useLocalStore()

const routes = [
  { name: localStore.localData['top_Home'], path: '/m', icon: 'iconoir:home-alt-slim-horiz' },
  { name: localStore.localData['top_Orders'], path: '/m/history', icon: 'iconoir:page-flip' },
  { name: localStore.localData['top_SubmitOrder'], path: '/m/submit', icon: 'iconoir:atom' },
  { name: '批量查询', path: '/m/oldSubmit', icon: 'icon-park-outline:upload-logs' },
  {
    name: localStore.localData['top_Feedback'],
    path: '/m/ticket',
    icon: 'iconoir:chat-lines',
    hide: !store.settings.enableTricket,
  },
  { name: localStore.localData['top_Profile'], path: '/m/profile', icon: 'iconoir:user' },
]

const currentPath = computed(() => {
  let cur = route.path

  for (const menu of routes) {
    if (!menu) continue
    if (menu.path === '/m') continue

    const isStartWith = cur.startsWith(menu.path)
    if (isStartWith && cur.length > menu.path.length) {
      cur = menu.path
    }
  }

  return cur
})
</script>

<template>
  <footer class="relative bg-card border-t">
    <nav class="flex items-center h-mobile-footer px-3">
      <template v-for="item in routes" :key="item.path">
        <RouterLink
          v-if="!item.hide"
          :to="item.path"
          :class="twMerge(
            'flex-1 flex flex-col items-center justify-center text-muted-foreground',
            currentPath === item.path && 'text-primary'
          )"
          @dblclick="$router.go(0)"
        >
          <Icon :icon="item.icon" class="size-5" />
          <span class="mt-1 text-[10px]">{{ item.name }}</span>
        </RouterLink>
      </template>
    </nav>
  </footer>
</template>
