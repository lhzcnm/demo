import type { NoticeApi } from './types'
import http from '@/utils/http'

export * from './types'

export const noticeApi: NoticeApi = {
  email: (email) => http.get(`send/email/${email}`),
  sms: (phone) => http.get(`send/sms/${phone}`),
  list: () => http.get('message/list'),
  read: (id) => http.post(`message/read/${id}`),
}

// 全局共享的未读公告数量
const _unreadCount = ref(0)

export function useNoticeUnread() {
  const unreadCount = _unreadCount

  async function refreshUnreadCount() {
    try {
      const { data } = await noticeApi.list()
      _unreadCount.value = data.unreadCount ?? 0
    } catch { }
  }

  function decrementUnread() {
    _unreadCount.value = Math.max(0, _unreadCount.value - 1)
  }

  return { unreadCount, refreshUnreadCount, decrementUnread }
}
