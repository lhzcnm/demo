<script setup lang="ts">
import type { SidebarMenu } from '../types'
import { twMerge } from 'tailwind-merge'
import { Icon } from '@iconify/vue'

import AppCard from './AppCard.vue'
import AppCardNew from './AppCardNew.vue'

const props = defineProps<{ menus: SidebarMenu[] }>()

const route = useRoute()
const router = useRouter()
const wsStore = useWsStore()
const iStore = useSystemStore()
const localStore = useLocalStore()

const mode = import.meta.env.VITE_APP_MODE
// const isLogout = defineModel({ required: true })

const currentPath = computed(() => {
  let cur = route.path

  for (const menu of props.menus) {
    if (!menu) continue
    if (menu.path === '/') continue

    const isStartWith = cur.startsWith(menu.path)
    if (isStartWith && cur.length > menu.path.length) {
      cur = menu.path
    }
  }

  return cur
})

function handle(menu: SidebarMenu) {
  if (menu.path.includes('logout')) {
    iStore.logout = true
    return
  } else if (menu.type === 'extra') {
    location.href = menu.path
  }

  wsStore.close()

  // location.href = path
  router.push(menu.path)
}
</script>

<template>
  <aside class="w-sidebar p-4 flex flex-col overflow-y-auto border-r border-dashed">
    <template v-for="menu in menus" :key="menu.path">
      <a v-if="!menu.hide" href="javascript:void(0)" :class="twMerge(
        'flex items-center space-x-2 px-3 py-2 mb-1',
        'rounded-lg whitespace-nowrap text-muted-foreground',
        'cursor-pointer transition-all duration-200',
        'hover:bg-primary/20 hover:text-primary',
        currentPath === menu.path && 'bg-primary/20 dark:bg-primary/30 text-primary',
        menu.path.includes('logout') && 'mt-auto hover:bg-danger/20 hover:text-danger'
      )" @click="handle(menu)">
        <Icon :icon="menu.icon" class="size-5" />
        <span>{{ menu.label }}</span>
      </a>

      <div v-if="menu.hide" class="space-y-2 w-full select-none border-t border-dashed pt-4 mt-2 ">
        <div class="bg-zinc-100/20 dark:bg-zinc-800/50 group rounded-md p-2 pt-0 border shadow-sm border-blue-500/40 hover:border-red-500/40" @click="router.push('/oldSubmit')">
          <div class="flex flex-col items-start justify-between">
            <div>
              <div class="flex flex-col items-center">
                <span class="text-xl">📤</span>
                <h3 class="text-[17px] font-bold text-blue-500 group-hover:text-red-500 text-center">{{ localStore.localData['submit_Web-based'] }}</h3>
              </div>

              <p class="text-xs text-muted-foreground mt-1 text-center">
                {{ localStore.localData['submit_Web_based_toast'] }}
              </p>

              <div class="flex justify-end items-center text-blue-500 group-hover:text-red-500 text-xs text-end font-medium">
                <div class="font-bold">{{ localStore.localData['submit_ClickEnter'] }}</div>
                <Icon class="size-7" icon="game-icons:click"/>
              </div>
            </div>

          </div>
        </div>

        <AppCard :is-sidebar="true" v-if="mode === 'SanHe'" />
        <AppCardNew :is-sidebar="true" />
      </div>

    </template>
  </aside>
</template>
