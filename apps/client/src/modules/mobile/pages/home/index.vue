<script setup lang="ts">
import { serviceApi, type ServiceDetail } from '@/api/services'
import PickService from './components/PickService.vue'

import { twJoin } from 'tailwind-merge'
import { useStorage } from '@vueuse/core'
import { xconfirm } from '@3un/utils'

import { usePage } from './utils/usePage'
import { getCommonList } from '@/utils'

const store = useServiceStore()
const iStore = useSettingStore()

await Promise.all([
  store.getServices(),
  iStore.getSettings(),
])

const { popupAnnc, popupAnncEn, enablePopupAnnc, scrollingAnnc, scrollingAnncEn } = iStore.settings
const anncVisible = useStorage('annc-visible', enablePopupAnnc, sessionStorage)
const { locale } = useI18n()
const localStore = useLocalStore()

const confirmContent = computed(() => {
  return locale.value === 'zh'
    ? popupAnnc
    : popupAnncEn
      ? popupAnncEn
      : popupAnnc
})

const bullerBoardContent = computed(() => {
  return locale.value === 'zh'
    ? scrollingAnnc
    : scrollingAnncEn
      ? scrollingAnncEn
      : scrollingAnnc
})

onMounted(async () => {
  if (!anncVisible.value) return
  const result = await xconfirm({
    title: localStore.localData['home_Announcement'],
    text: confirmContent.value,
    confirmText: localStore.localData['home_Confirm'],
    cancelText: undefined,
  })

  if (result) {
    anncVisible.value = false
  }
})

const commonList = getCommonList(store.services)
// 根据数据量动态决定行数，避免数据少时占用过多纵向空间（最多 5 行/列）
const gridRowsClass = (['grid-rows-1', 'grid-rows-2', 'grid-rows-3', 'grid-rows-4', 'grid-rows-5'][Math.min(commonList.length, 5) - 1]) ?? 'grid-rows-5'
const { totalPages, currentPage, pages, handleScroll, scrollToPage, isScrolling, carouselRef } = usePage()

const router = useRouter()

// Current open group
const visible = ref(false)
const current = ref<ServiceDetail>({
  id: 0,
  title: '',
  children: [],
})

function handleServiceGroupClick(event: MouseEvent) {
  if (isScrolling.value) return

  const target = event.target as HTMLElement
  const element = target.closest('[data-index]')

  if (!element) return

  const dataIndex = element.getAttribute('data-index')
  const index = parseInt(dataIndex || '0')
  const groups = pages.value[currentPage.value]

  openGroupDialog(groups[index])
}

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

  router.push(`/m/submit/${id}`)
}

const favoriteIds = ref<number[]>()

async function favoriteClick(serviceId: number | undefined) {
  try {
    const res = await serviceApi.favorite(serviceId)
    favoriteIds.value = res.data
  } catch {
  }
}

onBeforeMount(() => {
  favoriteClick(undefined)
})

</script>

<template>
  <div class="p-3">
    <XBulletinBoard v-if="iStore.settings.enableScrollingAnnc" class="px-2 py-3 mb-4" :text="bullerBoardContent"
      :style="{ '--bg': 'hsl(var(--card))' }" />

    <!-- <section class="mb-4">
      <h2 class="text-xl font-bold mb-3">{{ t('quotation.title') }}</h2>
      <Quote/>
    </section> -->

    <section v-if="commonList.length" class="mb-4">
      <h2 class="text-lg font-bold mb-3">{{ localStore.localData['home_Services'] }}</h2>

      <div :class="twJoin(
        'w-full max-h-[550px] overflow-x-auto overflow-y-hidden grid grid-flow-col gap-3 auto-cols-[380px]',
        gridRowsClass
      )" @click="handleServiceItemClick">
        <ServiceItemCard :favorite-ids="favoriteIds!" v-for="item in commonList" :key="item.id" :data="item"
          :data-id="item.id" />
      </div>
    </section>

    <section class="my-4">
      <div class="flex justify-between items-center mb-2">
        <h2 class="text-lg font-bold">{{ localStore.localData['home_ListService'] }}</h2>
        <div class="space-x-2">
          <button v-for="page in totalPages" :key="page - 1" :class="twJoin(
            'size-1.5 rounded-full transition-all duration-300',
            currentPage === page - 1 ? 'bg-primary' : 'bg-zinc-300'
          )" @click="scrollToPage(page - 1)" />
        </div>
      </div>
      <div class="relative">
        <div ref="carouselRef" class="x-overflow-none overflow-x-auto snap-x snap-mandatory scroll-smooth"
          style="scrollbar-width: none; -ms-overflow-style: none;" @scroll="handleScroll">
          <div class="flex w-full">
            <div v-for="(page, pageIndex) in pages" :key="pageIndex"
              class="space-y-2 w-[80%] flex-shrink-0 snap-start pr-2 last:pr-0" @click="handleServiceGroupClick">
              <ServiceGroupCard v-for="(group, index) in page" :key="group.id" :group="group" :data-index="index"
                class="w-full" />
            </div>
          </div>
        </div>

        <div v-show="currentPage < totalPages - 1" :class="twJoin(
          'absolute top-0 right-0 bottom-0 w-8',
          'bg-gradient-to-l from-zinc-100 dark:from-black',
          'to-[rgba(255,255,255,0)] pointer-events-none'
        )" />
      </div>
    </section>

    <PickService v-model="visible" :group="current" />
  </div>
</template>
