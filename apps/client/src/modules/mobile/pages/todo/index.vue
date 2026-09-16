<script setup lang="ts">
import { noticeApi, useNoticeUnread, type NoticeItem } from '@/api/notice'
import { TODO_STORE, type TodoStore } from './utils'
import NoticeList from './components/NoticeList.vue'
import NoticeDetail from './components/NoticeDetail.vue'

const iStore = useSystemStore()
const { decrementUnread } = useNoticeUnread()

const activeTab = ref<'unread' | 'read'>('unread')
const notices = ref<NoticeItem[]>([])
const loading = ref(false)
const visible = ref(false)
const currentNotice = ref<NoticeItem | null>(null)

function getNoticeTitle(n: NoticeItem) {
  return iStore.isEn ? (n.titleEn || n.title) : n.title
}
function getNoticeContent(n: NoticeItem) {
  return iStore.isEn ? (n.contentEn || n.content) : n.content
}

async function fetchNotices() {
  try {
    loading.value = true
    const { data } = await noticeApi.list()
    notices.value = data.records || []
  } finally {
    loading.value = false
  }
}

const filteredNotices = computed(() =>
  notices.value.filter((n) => (activeTab.value === 'unread' ? !n.read : n.read))
)

const unreadCount = computed(() => notices.value.filter((n) => !n.read).length)

function openDetail(notice: NoticeItem) {
  currentNotice.value = notice
  visible.value = true
}

async function markAsRead() {
  if (!currentNotice.value || currentNotice.value.read) return
  try {
    await noticeApi.read(currentNotice.value.id)
    currentNotice.value.read = true
    decrementUnread()
    visible.value = false
    currentNotice.value = null
  } catch { }
}

function switchTab(tab: 'unread' | 'read') {
  activeTab.value = tab
}

const store: TodoStore = {
  activeTab,
  notices,
  loading,
  currentNotice,
  visible,
  filteredNotices,
  unreadCount,
  getNoticeTitle,
  getNoticeContent,
  fetchNotices,
  openDetail,
  markAsRead,
  switchTab,
}

provide(TODO_STORE, store)
const localStore = useLocalStore()
onMounted(fetchNotices)
</script>

<template>
  <div class="h-full">
    <BackHeader :title="localStore.localData['top_Announcement']" />
    <NoticeList />
    <NoticeDetail />
  </div>
</template>
