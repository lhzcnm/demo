<script setup lang="ts">
import type { ServiceDetail } from '@/api/services'
import PickService from './components/PickService.vue'

import { xconfirm } from '@3un/utils'
import { useStorage } from '@vueuse/core'
import { getCommonList } from '@/utils'
// import Quote from './components/Quote.vue'

const store = useServiceStore()
const iStore = useSettingStore()
// await store.getServices()

const router = useRouter()

const defaultGroup = { id: 0, title: '', children: [] }
const current = ref<ServiceDetail>(defaultGroup)
const visible = ref(false)

const { popupAnnc, popupAnncEn, enablePopupAnnc } = iStore.settings
const anncVisible = useStorage('annc-visible', enablePopupAnnc, sessionStorage)
const { locale } = useI18n()
const localStore = useLocalStore()

const confirmText = computed(() => {
  return locale.value === 'zh'
    ? popupAnnc
    : (popupAnncEn && popupAnncEn.trim()) || popupAnnc
})

onMounted(async () => {
  if (!anncVisible.value) return
  const result = await xconfirm({
    title: localStore.localData['home_Announcement'],
    text: confirmText.value,
    confirmText: localStore.localData['home_Confirm'],
    cancelText: undefined,
  })

  if (result) {
    anncVisible.value = false
  }
})

const commonList = getCommonList(store.services)

const bulletinBoardText = computed(() => {
  return locale.value === 'zh'
    ? iStore.settings.scrollingAnnc
    : iStore.settings.scrollingAnncEn
      ? iStore.settings.scrollingAnncEn
      : iStore.settings.scrollingAnnc
})

function openGroupDialog(group: ServiceDetail) {
  current.value = group
  visible.value = true
}

function handleServiceItemClick(event: MouseEvent) {
  const target = event.target as HTMLElement
  const element = target.closest('[data-id]')

  if (!element) return

  const dataId = element.getAttribute('data-id')
  const id = parseInt(dataId || '0')

  router.push(`/submit/${id}`)
}
</script>

<template>
  <div class="p-4">
    <XBulletinBoard v-if="iStore.settings.enableScrollingAnnc" class="mb-4" :text="bulletinBoardText"
      :style="{ '--bg': 'hsl(var(--card))' }" />

      
    <section v-if="commonList.length" class="my-8">
      <h2 class="text-xl font-bold mb-3">{{ localStore.localData['home_Services'] }}</h2>
      <div class="grid gap-2 md:gap-4 grid-cols-[repeat(auto-fill,minmax(280px,_1fr))]" @click="handleServiceItemClick">
        <ServiceItemCard v-for="item in commonList" :key="item.id" :data="item" :data-id="item.id" />
      </div>
    </section>

    <section class="grid gap-2 md:gap-4 grid-cols-[repeat(auto-fill,minmax(280px,_1fr))]">
      <ServiceGroupCard v-for="group in store.details" :key="group.id" :group="group" @click="openGroupDialog(group)" />
    </section>


    <!-- <section class="mt-8">
      <h2 class="text-xl font-bold mb-3">{{ t('quotation.title') }}</h2>
      <Quote />
    </section> -->

    <PickService v-model="visible" :group="current" />
  </div>
</template>
