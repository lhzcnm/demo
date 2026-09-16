<script setup lang="ts">
import { TODO_STORE } from '../utils'

const store = inject(TODO_STORE)!
const localStore = useLocalStore()
const { visible, currentNotice, getNoticeTitle, getNoticeContent, markAsRead } = store
</script>

<template>
  <XDialog
    v-model="visible"
    :title="currentNotice ? getNoticeTitle(currentNotice) : ''"
    ui-root="max-w-[90vw] max-h-[80vh]"
  >
    <template #default>
      <div v-if="currentNotice" class="max-h-96 overflow-auto">
        <div class="flex items-center justify-between mb-3">
          <p class="text-xs text-muted-foreground">{{ currentNotice.createTime }}</p>
          <span
            class="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
            :class="currentNotice.read
              ? 'bg-muted text-muted-foreground'
              : 'bg-primary/10 text-primary'"
          >
            {{ currentNotice.read ?  localStore.localData['top_Read'] : localStore.localData['top_Unread'] }}
          </span>
        </div>
        <div
          class="overflow-y-auto text-sm text-foreground leading-relaxed tiptap"
          style="max-height: 50vh"
          v-html="getNoticeContent(currentNotice)"
        />
      </div>
    </template>
    <template #footer>
      <XButton
        v-if="currentNotice && !currentNotice.read"
        size="sm"
        variant="soft"
        :label="localStore.localData['top_ReadAnnouncementsBtn']"
        class="w-full mt-4"
        @click="markAsRead"
      />
      <!-- <XButton
        v-else
        size="sm"
        label="关闭"
        variant="soft"
        class="w-full mt-4"
        @click="visible = false"
      /> -->
    </template>
  </XDialog>
</template>
