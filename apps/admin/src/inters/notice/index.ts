import z from 'zod/v4'

import type { WithId } from '@3un/shared'

export const zNotice = z.object({
  id: z.number(),
  title: z.string(),
  titleEn: z.string(),
  content: z.string(),
  contentEn: z.string(),
  status: z.number(),
  publishVersion: z.number().optional(),
  createTime: z.string().optional(),
  updateTime: z.string().optional(),
})

export const zNoticeSearch = z.object({
  title: z.string().optional(),
  status: z.number().optional(),
})

export const zNoticeForm = z.object({
  title: z.string().default(""),
  titleEn: z.string().default(""),
  content: z.string().default(""),
  contentEn: z.string().default(""),
  status: z.number().default(1),
})

export type Notice = z.infer<typeof zNotice>
export type NoticeSearch = z.infer<typeof zNoticeSearch>
export type NoticeCreate = z.infer<typeof zNoticeForm>
export type NoticeUpdate = WithId<NoticeCreate, "id">
