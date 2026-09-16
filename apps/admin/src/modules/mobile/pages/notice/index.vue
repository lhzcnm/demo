<script setup lang="ts">
import NoticeSearchModal from './components/NoticeSearchModal.vue'
import NoticeCard from './components/NoticeCard.vue'
import NoticeModal from './components/NoticeModal.vue'

import { zNoticeForm, zNoticeSearch, type NoticeSearch } from '@/inters/notice'
import { NOTICE_STORE, type NoticeStore } from './utils'
import { getNotices } from '@/api/notice'

const store: NoticeStore = reactive({
  visibleBase: false,
  visibleSearch: false,

  notices: [],
  formSearch: zNoticeSearch.parse({}),
  formBase: zNoticeForm.parse({}),

  refresh: false,
  index: undefined,
})

provide(NOTICE_STORE, store)

const loading = ref<boolean>(false)

watch(
  () => store.refresh,
  async () => {
    await getList(store.formSearch)
  },
  {
    immediate: true,
  }
)

async function getList(params: NoticeSearch) {
  try {
    loading.value = true
    store.notices = await getNotices(params)
  } finally {
    loading.value = false
  }
}

function resetSearch() {
  store.formSearch = zNoticeSearch.parse({})
  store.refresh = !store.refresh
}

function openCreate() {
  store.index = undefined
  store.formBase = zNoticeForm.parse({})
  store.visibleBase = true
}
</script>

<template>
  <div>
    <Toolbar :loading="loading">
      <template #extra>
        <div class="flex justify-between gap-2">
          <div class="flex gap-2">
            <XButton
              icon="lucide:filter"
              label="筛选"
              @click="store.visibleSearch = true"
            />

            <XButton
              label="清空筛选"
              variant="outline"
              icon="lucide:brush-cleaning"
              @click="resetSearch"
            />
          </div>

          <div class="">
            <XButton
              label="新增公告"
              color="success"
              icon="lucide:plus"
              @click="openCreate"
            />
          </div>
        </div>
      </template>
    </Toolbar>

    <section class="overflow-y-auto h-[calc(100vh-6.85rem)] space-y-2 p-3">
      <template v-if="!loading && store.notices.length === 0">
        <NoMessage
          class="h-auto bg-card border rounded-lg p-3" />
      </template>

      <template v-else v-for="(item, index) in store.notices">
        <NoticeCard :index="index" :notice="item" />
      </template>
    </section>

    <NoticeModal />
    <NoticeSearchModal />
  </div>
</template>
