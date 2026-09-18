// Http
export type R<T> = Promise<CR<T>>
export interface CR<T = any> {
  message: string
  code: number
  data: T
}

// Pagination
export interface IPage {
  page: number
  pageSize?: number
}
export interface IList<T> {
  list: T[]
  page: number
  total: number
  pageSize: number
}
