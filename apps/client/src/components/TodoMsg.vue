<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { twJoin } from 'tailwind-merge'
import { useNoticeUnread } from '@/api/notice'

const props = defineProps<{
  uiBtn?: string
}>()

const localStore = useLocalStore()

const router = useRouter()
const open = ref(false)
const { unreadCount, refreshUnreadCount } = useNoticeUnread()

watch(open, (val) => {
  if (val) refreshUnreadCount()
})

onMounted(refreshUnreadCount)

function handleClick() {
  open.value = false
  router.push('/todo')
}
</script>

<template>
  <XPopover
    v-model="open"
    close-on-click-outside
  >
    <template #trigger>
      <button :class="twJoin(props.uiBtn, 'relative')" class="bg-muted hover:hover:bg-gray-200 p-2 rounded-full text-muted-foreground transition-colors duration-300">
        <Icon icon="lucide:bell" class="size-5" />
        <XBadge
          v-if="unreadCount > 0"
          :value="unreadCount"
          class="absolute -top-1 -right-2"
        />
      </button>
    </template>

    <div class="w-56">
      <div class="flex items-center justify-between px-3 py-2 border-b border-dashed">
        <h3 class="font-bold">{{ localStore.localData['top_NotificationMessage'] }}</h3>
        <button
          class="p-1.5 rounded hover:bg-muted text-muted-foreground"
          @click="refreshUnreadCount"
        >
          <Icon icon="lucide:refresh-cw" class="size-4" />
        </button>
      </div>

      <div class="p-1">
        <!-- <div
          v-if="unreadCount === 0"
          class="text-center py-8 text-muted-foreground"
        >
          <Icon icon="lucide:check-circle" class="size-6 mx-auto mb-2" />
          <div class="text-sm">暂无待办消息</div>
        </div> -->

        <button
          class="flex items-center space-x-2 px-3 py-1.5 w-full text-left hover:bg-accent/15 rounded"
          @click="handleClick"
        >
          <Icon icon="lucide:clipboard-list" class="size-4" />
          <div class="flex-1 text-sm">{{ localStore.localData['top_Announcement'] }}</div>
          <XBadge v-if="unreadCount > 0" :value="unreadCount" />
        </button>
      </div>
    </div>
  </XPopover>
</template>
