import type { Notice, NoticeCreate, NoticeSearch } from '@/inters/notice'
import type { IK } from '@3un/shared'

export const NOTICE_STORE: IK<NoticeStore> = Symbol('notice')

export interface NoticeStore {
  visibleBase: boolean,
  visibleSearch: boolean,

  notices: Notice[],
  formSearch: NoticeSearch,
  formBase: NoticeCreate,

  refresh: boolean,
  index: number | undefined,
}
