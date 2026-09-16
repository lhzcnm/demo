import { zNotice, type Notice, type NoticeCreate, type NoticeSearch, type NoticeUpdate } from '@/inters/notice'
import http from '@/utils/http'

type NoticeListFn = (body: NoticeSearch) => Promise<Notice[]>
export const getNotices: NoticeListFn = async (body) => {
  const { data } = await http.post("/message/list", body)
  return data.list.map((item: Notice) => zNotice.parse(item))
}

type NoticeCreateFn = (body: NoticeCreate) => Promise<void>
export const createNotice: NoticeCreateFn = async (body) => {
  await http.post("/message/add", body)
}

type NoticeUpdateFn = (body: NoticeUpdate) => Promise<void>
export const updateNotice: NoticeUpdateFn = async (body) => {
  await http.put("/message/update", body)
}

type NoticeDeleteFn = (ids: number[]) => Promise<void>
export const deleteNotice: NoticeDeleteFn = async (ids) => {
  await http.post("/message/deleteBatch", ids)
}

type NoticePublishFn = (id: number) => Promise<void>
export const publishNotice: NoticePublishFn = async (id) => {
  await http.post(`/message/publish/${id}`)
}
