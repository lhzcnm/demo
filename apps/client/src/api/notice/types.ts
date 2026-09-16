import type { R } from '@3un/shared'

export interface NoticeItem {
  id: number
  title: string
  titleEn: string
  content: string
  contentEn: string
  read: boolean
  createTime: string
  publishVersion?: number
}

export interface NoticeListData {
  records: NoticeItem[]
  unreadCount: number
}

export interface NoticeApi {
  email(email: string): R<null>
  sms(phone: string): R<null>
  list(): R<NoticeListData>
  read(id: number): R<null>
}
