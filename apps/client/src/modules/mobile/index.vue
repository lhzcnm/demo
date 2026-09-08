<script setup lang="ts">
import '@jweixin/index'

import { wxApi } from '@/api/wx'
import { ua } from '@3un/utils'

const route = useRoute()
const iStore = useSettingStore()
const uStore = useUserStore()

const isDev = import.meta.env.DEV
const loadConfig = !isDev && ua.isWechat

await Promise.all([
  iStore.getSettings(),
  iStore.getHandleFee(),
  loadConfig && getWxConfig(),
])

if(!route.meta.noAuthRequired) {
  await uStore.getInfo()
}

async function getWxConfig() {
  const url = (iStore.originUrl || location.href).split('#')[0]
  const encode = encodeURIComponent(url)
  const { data } = await wxApi.config(encode)

  window.wx.config({
    debug: isDev,
    ...data,
    jsApiList: [
      'scanQRCode',
      'chooseImage',
      'getLocalImgData',
    ],
  })
}
</script>

<template>
  <div class="fixed top-0 bottom-0 left-0 right-0 flex flex-col">
    <MobileHeader v-show="!route.meta.hideHeader" />
    <RouterView v-slot="{ Component }" :key="route.path">
      <main
        v-if="Component" id="main"
        class="flex-1 overflow-y-auto bg-zinc-100 dark:bg-black"
      >
        <Transition name="fade-in" mode="out-in">
          <Suspense>
            <component :is="Component" />

            <template #fallback>
              <Fallback />
            </template>
          </Suspense>
        </Transition>
      </main>
    </RouterView>

    <MobileFooter v-show="!route.meta.hideFooter" />
  </div>
</template>
