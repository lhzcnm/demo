<script setup lang="ts">
import type { XTagColor } from '@3un/ui'
import { Icon } from '@iconify/vue'
import { xconfirm } from '@3un/utils'

import { zNoticeForm, type Notice } from '@/inters/notice'
import { NOTICE_STORE } from '../utils'
import { deleteNotice, publishNotice, updateNotice } from '@/api/notice'
import { toast } from 'vue-sonner'

interface NoticeCardProps {
  index: number
  notice: Notice
}

const { notice, index } = defineProps<NoticeCardProps>()
const store = inject(NOTICE_STORE)!

const isEnabled = computed(() => notice.status === 1)

const status = computed(() => ({
  color: (isEnabled.value ? 'success' : 'danger') as XTagColor,
  label: isEnabled.value ? '启用' : '禁用'
}))

// 提取富文本纯文本摘要
function stripHtml(html: string) {
  if (!html) return '暂无内容'
  const text = html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim()
  return text.length > 40 ? text.slice(0, 40) + '...' : text || '暂无内容'
}

const contentPreview = computed(() => stripHtml(notice.content))
const contentEnPreview = computed(() => stripHtml(notice.contentEn))

// 内容抽屉
const drawerVisible = ref(false)
const drawerContent = ref('')
const drawerTitle = ref('')

function openContent(field: 'zh' | 'en') {
  if (field === 'zh') {
    drawerContent.value = notice.content
    drawerTitle.value = notice.title
  } else {
    drawerContent.value = notice.contentEn
    drawerTitle.value = notice.titleEn || 'English Content'
  }
  drawerVisible.value = true
}

function openUpdate() {
  store.index = index
  store.formBase = zNoticeForm.parse(notice)
  store.visibleBase = true
}

async function handleToggleStatus() {
  try {
    await updateNotice({
      id: notice.id,
      title: notice.title,
      titleEn: notice.titleEn,
      content: notice.content,
      contentEn: notice.contentEn,
      status: isEnabled.value ? 0 : 1,
    })
    toast.success(isEnabled.value ? "已禁用" : "已启用")
    store.refresh = !store.refresh
  } catch { }
}

async function handlePublish() {
  if (!await xconfirm("是否确认发布该公告？发布后前台用户将可见")) return

  try {
    await publishNotice(notice.id)
    toast.success("发布成功")
    store.refresh = !store.refresh
  } catch { }
}

async function handleDelete() {
  if (!await xconfirm("是否确认删除该公告?")) return

  try {
    await deleteNotice([notice.id])
    toast.success("删除成功")
    store.refresh = !store.refresh
  } catch { }
}
</script>

<template>
  <div class="
      rounded-lg border
      bg-card text-foreground
      border-border
      transition-colors
      hover:bg-accent/10
    ">
    <!-- 头部：标题 + 状态 -->
    <div class="flex items-start justify-between px-4 py-3 border-b border-border gap-2">
      <div class="flex flex-col min-w-0 flex-1">
        <span class="text-sm font-medium text-foreground truncate">
          {{ notice.title }}
        </span>
        <span class="text-xs text-muted-foreground truncate mt-0.5">
          {{ notice.titleEn || '—' }}
        </span>
      </div>

      <XTag :color="status.color" :label="status.label" size="sm" class="shrink-0" />
    </div>

    <!-- 中文内容预览 -->
    <button class="w-full text-left px-4 py-2.5 hover:bg-accent/5 transition-colors border-b border-border/50"
      @click="openContent('zh')">
      <div class="flex items-center justify-between mb-1">
        <span class="text-[11px] font-medium text-muted-foreground">中文内容</span>
        <Icon icon="lucide:chevron-right" class="size-3.5 text-muted-foreground/60" />
      </div>
      <p class="text-xs text-foreground/80 line-clamp-2 leading-relaxed">
        {{ contentPreview }}
      </p>
    </button>

    <!-- 英文内容预览 -->
    <button class="w-full text-left px-4 py-2.5 hover:bg-accent/5 transition-colors" @click="openContent('en')">
      <div class="flex items-center justify-between mb-1">
        <span class="text-[11px] font-medium text-muted-foreground">英文内容 / English</span>
        <Icon icon="lucide:chevron-right" class="size-3.5 text-muted-foreground/60" />
      </div>
      <p class="text-xs text-foreground/80 line-clamp-2 leading-relaxed">
        {{ contentEnPreview }}
      </p>
    </button>

    <!-- 底部操作栏 -->
    <div class="
        flex items-center justify-between
        px-4 py-2.5
        border-t border-border
        bg-muted/40
      ">
      <div class="flex flex-col">
        <span class="text-xs text-muted-foreground">ID: {{ notice.id }}</span>
        <span v-if="notice.createTime" class="text-[10px] text-muted-foreground/70 mt-0.5">
          {{ notice.createTime }}
        </span>
      </div>

      <div class="flex items-center text-muted-foreground gap-3">
        <!-- 删除 -->
        <Icon @click="handleDelete" icon="lucide:trash-2" class="size-4" />
        <!-- 启用/禁用 -->
        <Icon @click="handleToggleStatus" :icon="isEnabled ? 'lucide:power-off' : 'lucide:zap'" class="size-4" />
        <!-- 发布 -->
        <Icon @click="handlePublish" icon="lucide:send" class="size-4 hover:text-blue-500 cursor-pointer" />

        <!-- 编辑 -->
        <Icon @click="openUpdate" icon="lucide:clipboard-edit" class="size-4" />
      </div>
    </div>

    <!-- 内容抽屉 -->
    <XDrawer v-model="drawerVisible" :title="drawerTitle" placement="bottom" :height="'75%'">
      <div class="overflow-y-auto h-full">
        <div class="tiptap text-sm leading-relaxed text-foreground" v-html="drawerContent || '暂无内容'" />
      </div>
      <template #footer>
        <div class="p-4 border-t border-border bg-muted/40 flex justify-end">
          <XButton label="关闭" variant="soft" @click="drawerVisible = false" />
        </div>
      </template>
    </XDrawer>
  </div>
</template>
