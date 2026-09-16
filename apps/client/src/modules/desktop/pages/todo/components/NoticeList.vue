<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { twJoin } from 'tailwind-merge'
import { TODO_STORE } from '../utils'

const store = inject(TODO_STORE)!
const localStore = useLocalStore()
const { activeTab, filteredNotices, unreadCount, loading, currentNotice, getNoticeTitle, fetchNotices, selectNotice, switchTab } = store
</script>

<template>
  <aside class="w-[480px] shrink-0 flex flex-col bg-card rounded-2xl border overflow-hidden">
    <!-- 顶部标题栏 -->
    <div class="flex items-center gap-3 px-5 py-4 border-b">
      <h1 class="text-lg font-semibold text-foreground">{{ localStore.localData['top_AnnouncementList'] }}</h1>
      <div class="flex-1" />
      <button
        class="p-1.5 rounded-full hover:bg-accent/20 text-muted-foreground transition-colors"
        @click="fetchNotices"
      >
        <Icon icon="lucide:refresh-cw" class="size-4" />
      </button>
    </div>

    <!-- Tab 切换 -->
    <div class="flex w-full px-5 pt-2 border-b gap-6">
      <button
        :class="twJoin(
          'pb-3 text-sm font-medium border-b-2 transition-colors flex-1',
          activeTab === 'unread'
            ? 'border-primary text-primary'
            : 'border-transparent text-muted-foreground hover:text-foreground'
        )"
        @click="switchTab('unread')"
      >
        {{ localStore.localData['top_UnreadAnnouncements'] }}
        <XBadge v-if="unreadCount > 0" :value="unreadCount" class="ml-1.5" />
      </button>
      <button
        :class="twJoin(
          'pb-3 text-sm font-medium border-b-2 transition-colors  flex-1',
          activeTab === 'read'
            ? 'border-primary text-primary'
            : 'border-transparent text-muted-foreground hover:text-foreground'
        )"
        @click="switchTab('read')"
      >
        {{ localStore.localData['top_ReadAnnouncements'] }}
      </button>
    </div>

    <!-- 卡片列表 -->
    <div class="flex-1 p-3 space-y-2 overflow-y-auto">
      <div v-if="loading" class="text-center py-16 text-muted-foreground">
        <Icon icon="lucide:loader-circle" class="size-8 mx-auto mb-3 animate-spin opacity-50" />
        <p class="text-sm">{{ localStore.localData['top_Loading'] }}</p>
      </div>

      <div
        v-else-if="filteredNotices.length === 0"
        class="text-center py-16 text-muted-foreground"
      >
        <Icon icon="lucide:inbox" class="size-10 mx-auto mb-3 opacity-50" />
        <p class="text-sm">
          {{ activeTab === 'unread' ? localStore.localData['top_NoUnreadAnnouncements'] : localStore.localData['top_NoReadAnnouncements'] }}
        </p>
      </div>

      <div
        v-for="notice in filteredNotices"
        :key="notice.id"
        :class="twJoin(
          'group relative bg-card border rounded-xl p-4 cursor-pointer transition-all',
          currentNotice?.id === notice.id
            ? 'border-primary shadow-sm'
            : 'hover:border-primary/60 hover:shadow-md'
        )"
        @click="selectNotice(notice)"
      >
        <div class="flex items-start gap-3">
          <div
            class="mt-1.5 size-2 rounded-full shrink-0"
            :class="notice.read ? 'bg-muted-foreground/40' : 'bg-primary'"
          />
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2">
              <h3
                class="text-sm font-semibold text-foreground truncate"
                :class="{ 'text-muted-foreground': notice.read }"
              >
                {{ getNoticeTitle(notice) }}
              </h3>
              <span
                class="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                :class="notice.read
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-primary/10 text-primary'"
              >
                {{ notice.read ? localStore.localData['top_Read'] : localStore.localData['top_Unread'] }}
              </span>
            </div>
            <p class="mt-2 text-[10px] text-muted-foreground/70">
              {{ notice.createTime }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>
