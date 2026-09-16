import type { InjectionKey, Ref, ComputedRef } from 'vue'
import type { NoticeItem } from '@/api/notice'

export interface TodoStore {
  activeTab: Ref<'unread' | 'read'>
  notices: Ref<NoticeItem[]>
  loading: Ref<boolean>
  currentNotice: Ref<NoticeItem | null>
  filteredNotices: ComputedRef<NoticeItem[]>
  unreadCount: ComputedRef<number>
  getNoticeTitle: (n: NoticeItem) => string
  getNoticeContent: (n: NoticeItem) => string
  fetchNotices: () => Promise<void>
  selectNotice: (n: NoticeItem) => void
  markAsRead: () => Promise<void>
  switchTab: (tab: 'unread' | 'read') => void
}

export const TODO_STORE: InjectionKey<TodoStore> = Symbol('TODO_STORE')
