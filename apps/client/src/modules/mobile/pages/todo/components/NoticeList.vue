<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { twJoin } from 'tailwind-merge'
import { TODO_STORE } from '../utils'

const store = inject(TODO_STORE)!
const localStore = useLocalStore()
const { activeTab, filteredNotices, unreadCount, loading, getNoticeTitle, openDetail, switchTab } = store
</script>

<template>
  <div>
    <!-- Tab 切换 -->
    <div class="sticky top-1 z-10 flex gap-6 px-4 py-2 bg-card border-b">
      <button
        :class="twJoin(
          'pb-1 text-sm font-medium border-b-2 transition-colors flex-1',
          activeTab === 'unread'
            ? 'border-primary text-primary'
            : 'border-transparent text-muted-foreground'
        )"
        @click="switchTab('unread')"
      >
        {{ localStore.localData['top_UnreadAnnouncements'] }}
        <XBadge v-if="unreadCount > 0" :value="unreadCount" class="ml-1.5" />
      </button>
      <button
        :class="twJoin(
          'pb-1 text-sm font-medium border-b-2 transition-colors flex-1',
          activeTab === 'read'
            ? 'border-primary text-primary'
            : 'border-transparent text-muted-foreground'
        )"
        @click="switchTab('read')"
      >
        {{ localStore.localData['top_ReadAnnouncements'] }}
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="text-center py-16 text-muted-foreground">
      <Icon icon="lucide:loader-circle" class="size-8 mx-auto mb-3 animate-spin opacity-50" />
      <p class="text-sm">{{ localStore.localData['top_Loading'] }}</p>
    </div>

    <!-- 空状态 -->
    <div
      v-else-if="filteredNotices.length === 0"
      class="text-center py-16 text-muted-foreground"
    >
      <Icon icon="lucide:inbox" class="size-10 mx-auto mb-3 opacity-50" />
      <p class="text-sm">
        {{ activeTab === 'unread' ? localStore.localData['top_NoUnreadAnnouncements'] : localStore.localData['top_NoReadAnnouncements'] }}
      </p>
    </div>

    <!-- 卡片列表 -->
    <div v-else class="px-3 py-3 space-y-2">
      <div
        v-for="notice in filteredNotices"
        :key="notice.id"
        class="bg-card border rounded-lg p-3 active:bg-muted/50 transition-colors"
        @click="openDetail(notice)"
      >
        <div class="flex items-start gap-2">
          <div
            class="mt-1.5 size-2 rounded-full shrink-0"
            :class="notice.read ? 'bg-muted-foreground/40' : 'bg-primary'"
          />
          <div class="flex-1 min-w-0">
            <h3
              class="text-sm font-medium text-foreground truncate"
              :class="{ 'text-muted-foreground': notice.read }"
            >
              {{ getNoticeTitle(notice) }}
            </h3>
            <p class="mt-1 text-[10px] text-muted-foreground/70">
              {{ notice.createTime }}
            </p>
          </div>
          <span
            class="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-medium"
            :class="notice.read
              ? 'bg-muted text-muted-foreground'
              : 'bg-primary/10 text-primary'"
          >
            {{ notice.read ? localStore.localData['top_Read'] : localStore.localData['top_Unread'] }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
