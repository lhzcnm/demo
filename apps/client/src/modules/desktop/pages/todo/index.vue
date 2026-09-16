<script setup lang="ts">
import { noticeApi, useNoticeUnread, type NoticeItem } from '@/api/notice'
import { TODO_STORE, type TodoStore } from './utils'
import NoticeList from './components/NoticeList.vue'
import NoticeDetail from './components/NoticeDetail.vue'

const iStore = useSystemStore()
const { decrementUnread } = useNoticeUnread()

const activeTab = ref<TodoStore['activeTab']['value']>('unread')
const notices = ref<NoticeItem[]>([])
const loading = ref(false)
const currentNotice = ref<NoticeItem | null>(null)

function getNoticeTitle(n: NoticeItem) {
  return iStore.isEn ? (n.titleEn || n.title) : n.title
}
function getNoticeContent(n: NoticeItem) {
  return iStore.isEn ? (n.contentEn || n.content) : n.content
}

function findDefaultNotice(): NoticeItem | null {
  return notices.value.find(n => !n.read) || notices.value.find(n => n.read) || null
}

async function fetchNotices() {
  try {
    loading.value = true
    const { data } = await noticeApi.list()
    notices.value = data.records || []
    currentNotice.value = findDefaultNotice()
  } finally {
    loading.value = false
  }
}

const filteredNotices = computed(() =>
  notices.value.filter((n) => (activeTab.value === 'unread' ? !n.read : n.read))
)

const unreadCount = computed(() => notices.value.filter((n) => !n.read).length)

function selectNotice(notice: NoticeItem) {
  currentNotice.value = notice
}

async function markAsRead() {
  if (!currentNotice.value || currentNotice.value.read) return
  try {
    await noticeApi.read(currentNotice.value.id)
    currentNotice.value.read = true
    decrementUnread()
    const nextUnread = notices.value.find(n => !n.read)
    if (nextUnread) currentNotice.value = nextUnread
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
  filteredNotices,
  unreadCount,
  getNoticeTitle,
  getNoticeContent,
  fetchNotices,
  selectNotice,
  markAsRead,
  switchTab,
}

provide(TODO_STORE, store)
onMounted(fetchNotices)
</script>

<template>
  <div class="flex gap-4 p-4 h-full">
    <NoticeList />
    <NoticeDetail />
  </div>
</template>
