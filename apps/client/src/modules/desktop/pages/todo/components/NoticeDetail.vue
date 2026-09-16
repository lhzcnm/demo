<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { TODO_STORE } from '../utils'

const store = inject(TODO_STORE)!
const localStore = useLocalStore()
const { currentNotice, getNoticeTitle, getNoticeContent, markAsRead } = store
</script>

<template>
  <section class="flex-1 bg-card rounded-2xl border overflow-hidden flex flex-col">
    <template v-if="currentNotice">
      <div class="flex items-start gap-3 px-6 py-4 border-b">
        <div class="flex-1 min-w-0">
          <h2 class="text-lg font-semibold text-foreground">
            {{ getNoticeTitle(currentNotice) }}
          </h2>
          <p class="mt-1 text-xs text-muted-foreground">
            {{ currentNotice.createTime }}
          </p>
        </div>
        <span
          class="shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium"
          :class="currentNotice.read
            ? 'bg-muted text-muted-foreground'
            : 'bg-primary/10 text-primary'"
        >
          {{ currentNotice.read ? localStore.localData['top_Read'] : localStore.localData['top_Unread'] }}
        </span>
      </div>

      <div
        class="flex-1 px-6 py-5 overflow-y-auto text-sm text-foreground leading-relaxed tiptap"
        v-html="getNoticeContent(currentNotice)"
      />

      <div v-if="!currentNotice.read" class="px-6 py-3 border-t flex justify-end">
        <XButton :label="localStore.localData['top_ReadAnnouncementsBtn']" @click="markAsRead" class="w-full" variant="soft"/>
      </div>
    </template>

    <div
      v-else
      class="flex-1 flex flex-col items-center justify-center text-muted-foreground"
    >
      <Icon icon="lucide:file-text" class="size-12 mb-3 opacity-40" />
      <p class="text-sm">{{ localStore.localData['top_announcementDetails'] }}</p>
    </div>
  </section>
</template>
