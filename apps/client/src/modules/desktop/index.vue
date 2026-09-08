<script setup lang="ts">
import DesktopHeader from './components/DesktopHeader.vue'
import TheSidebar from './components/TheSidebar.vue'

// import { useDocumentVisibility } from '@vueuse/core'
import type { SidebarMenu } from './types'
import { ACCESS_LEVEL } from '@3un/utils'
import { closeChannel, startChannel } from '@/utils/heartBeat'
import { setDataSets, setVersion } from '@/utils/device'

const route = useRoute()
// const visibility = useDocumentVisibility()

const iStore = useSettingStore()
const uStore = useUserStore()
const systemStore = useSystemStore()
const serviceStore = useServiceStore()

await Promise.all([
  iStore.getSettings(),
  iStore.getHandleFee(),
  setDataSets(),
  setVersion(),
  !route.meta.noAuthRequired && uStore.getInfo(),
])

if (!route.meta.noAuthRequired) {
  await uStore.getInfo()
  await serviceStore.getServices()
}

// watch(visibility, (cur) => {
//   if ((cur === 'visible') && !route.meta.noAuthRequired) {
//   }
// }, { immediate: true })

const isLogout = ref(false)

const localStore=useLocalStore()

const hideDevice =
  import.meta.env.VITE_APP_DEVICE === 'false' ||
  // 用户未开启设备
  !uStore.info.enableDevice

const menus: SidebarMenu[] = [
  { label: localStore.localData['sidebar_Home'], path: '/', icon: 'iconoir:home-alt-slim-horiz', type: 'basic' as const },
  // { label: t('barItem.quote'), path: '/quote', icon: 'circum:receipt' },
  { label: localStore.localData['sidebar_OrderSubmit'], path: '/submit', icon: 'iconoir:atom', type: 'basic' as const },
  // { label: localStore.localData['sidebar_OrderSubmit'] + '(旧)', path: '/oldSubmit', icon: 'icon-park-outline:upload-logs', type: 'basic' as const },
  { label: localStore.localData['sidebar_PrintQuery'], path: '/custom-submit', icon: 'iconoir:atom', type: 'basic' as const },
  {
    label: localStore.localData['sidebar_Devices'],
    path: '/device',
    icon: 'iconoir:laptop-charging',
    hide: hideDevice,
    type: 'basic' as const
  },
  { label: localStore.localData['sidebar_Orders'], path: '/history', icon: 'iconoir:page-flip', type: 'basic' as const },
  { label: localStore.localData['sidebar_AddFunds'], path: '/recharge', icon: 'iconoir:credit-card', type: 'basic' as const },
  { label: localStore.localData['sidebar_Consumes'], path: '/credits', icon: 'iconoir:bitcoin-rotate-out', type: 'basic' as const },
  {
    label: localStore.localData['sidebar_Tickets'],
    path: '/ticket',
    icon: 'iconoir:chat-lines',
    hide: !iStore.settings.enableTricket,
    type: 'basic' as const
  },

  { label: localStore.localData['sidebar_Profile'], path: '/profile', icon: 'iconoir:user', type: 'basic' as const },
  uStore.info.accessLevel === ACCESS_LEVEL.AUCTION && { label: localStore.localData['sidebar_AuctionPlat'], path: '/auction', icon: 'lucide:laptop-minimal', type: 'extra' as const },
  { label: '', path: '/exe', icon: '',type: 'basic' as const , hide: true},

  { label: localStore.localData['sidebar_Logout'], path: '/logout', icon: 'iconoir:log-out', type: 'basic' as const },
].filter((item) => !!item)

onMounted(async () => {
  if (!uStore.isAdminLogin && uStore.info.heartbeatEnabled) {
    startChannel()
  }
})

onBeforeUnmount(async () => {
  closeChannel()
  uStore.isAdminLogin = false
})
</script>

<template>
  <DesktopHeader />
  <div class="flex h-container">
    <Transition name="slide-left">
      <TheSidebar v-model="isLogout" v-show="systemStore.showSidebar" :menus />
    </Transition>
    <RouterView v-slot="{ Component }" :key="route.path">
      <main class="flex-1 overflow-x-auto">
        <Transition name="fade-in" mode="out-in">
          <Suspense>
            <component :is="Component" v-if="Component" />
            <template #fallback>
              <Fallback />
            </template>
          </Suspense>
        </Transition>
      </main>
    </RouterView>
  </div>
  <LogoutDialog />
  <IdleModal />
</template>
