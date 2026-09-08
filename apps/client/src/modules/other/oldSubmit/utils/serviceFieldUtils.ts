import UnlockRecommendAction from '@/components/UnlockRecommendAction.vue'
import ColumnDelete from '../components/ColumnDelete.vue'
import ColumnFilter from '../components/ColumnFilter.vue'

import type { OrderTableView } from '@/api/orders'
import { serviceApi, type ServiceHeader } from '@/api/services'
import { getLanuagestring } from '@/utils/constant'

import { h } from 'vue'
import { XTag, type XTableV2Column } from '@3un/ui'
import { ASYNC_ORDER_STATUS, ASYNC_ORDER_STATUS_MAP_LOCALE, ORDER_STATUS, ORDER_STATUS_MAP, ServiceFieldType, ua } from '@3un/utils'

interface ProcessedFieldsResp {
  columns: XTableV2Column<OrderTableView>[],
  fields: ServiceHeader[],
}

const fieldRenderType = [
  "index",
  "service",
  "status",
  "html",
  "recommend",
  "text"
] as const

export type FieldRenderType = (typeof fieldRenderType)[number]

const localStore = useLocalStore()
const iStore = useSystemStore()

function renderIndex(key: string, title: string, width: number): XTableV2Column<OrderTableView> {
  return {
    key: key,
    title: title,
    align: 'center',
    width: width,
    render(_, row) {
      return h('span', {}, row.index)
    }
  }
}

function renderService(key: string, title: string, width: number): XTableV2Column<OrderTableView> {
  return {
    key: key,
    title: title,
    width: width,
    render: (_: any, row: OrderTableView) => {
      if (!row || !row.serviceId) {
        return h('span', {}, localStore.localData['submit_ServicePlaceholderTable'])
      }

      return h('span', {}, `${row.serviceId} - ${row.serviceName}`)
      // if (!row || !row.serviceId) return localStore.localData['submit_ServicePlaceholderTable']
      // return `${row.serviceId} - ${row.serviceName}`
    }
  }
}

function renderOrderStatus(key: string, title: string, width: number): XTableV2Column<OrderTableView> {
  return {
    key: key,
    title: title,
    align: 'center',
    width: width,
    render: (value: ORDER_STATUS) => {
      const id = value || ORDER_STATUS.WAIT
      const tag = ORDER_STATUS_MAP[id]
      return h(XTag, {
        label: localStore.localData[tag.key!],
        color: tag.color,
        size: 'sm'
      })
    }
  }
}

function renderRecommend(key: string, title: string, width: number): XTableV2Column<OrderTableView> {
  return {
    key: key,
    title: title,
    width: width,
    isGroup: true,
    identifier: {
      isDelCol: true,
    },
    headerActionRender(col) {
      return h('div', {
        class: 'flex items-center gap-2'
      }, [
        h(ColumnDelete, {
          col: col
        })
      ])
    },
    render(_, row: OrderTableView) {
      if (!row.isStorage && (!row.recommends || row.recommends.length === 0 || row.status !== ORDER_STATUS.SUCCESS)) {
        // return getLanuagestring("no_unlock_recommend", iStore.lang)
        return h('span', {}, getLanuagestring("no_unlock_recommend", iStore.lang))
      }
      return h(UnlockRecommendAction, {
        order: row,
      })
    }
  }
}

function renderText(key: string, title: string, width?: number, minWidth?: number, isDelCol?: boolean): XTableV2Column<OrderTableView> {
  return {
    key: key,
    title: title,
    width: width,
    minWidth: minWidth,
    isGroup: true,
    headerActionRender(col) {
      return h('div', {
        class: 'flex items-center gap-2'
      }, [
        isDelCol && h(ColumnDelete, {
          col: col
        })
      ])
    },
    identifier: {
      ...(isDelCol && { isDelCol: true })
    }
  }
}

function renderHtml(key: string, title: string, width?: number, minWidth?: number): XTableV2Column<OrderTableView> {
  return {
    key: key,
    title: title,
    width: width,
    minWidth: minWidth,
    render(value: string) {
      return h('span', { innerHTML: value })
    }
  }
}

function renderDynamicField(key: string, title: string, minWidth: number, isDelCol?: boolean): XTableV2Column<OrderTableView> {
  return {
    key: key,
    title: title,
    width: minWidth,
    minWidth: minWidth,
    isGroup: true,
    isDrag: true,
    flex: true,
    identifier: {
      ...(isDelCol && { isDelCol: true }),
      isFilter: true,
    },
    headerActionRender(col) {
      return h('div', {
        class: 'flex items-center gap-2'
      }, [
        h(ColumnDelete, {
          col: col
        }),
        h(ColumnFilter, {
          col: col
        })
      ])
    },
    render(value: string) {
      return h("div", {
        innerHTML: value
      })
    }
  }
}

function renderSubmitStatus(key: string, title: string, width: number): XTableV2Column<OrderTableView> {
  return {
    key: key,
    title: title,
    width: width,
    render: (value: ORDER_STATUS, row: OrderTableView) => {
      let status
      if (!value) {
        status = ASYNC_ORDER_STATUS_MAP_LOCALE[ASYNC_ORDER_STATUS.ASYNC_SUBMITED]

        if (row.status === ORDER_STATUS.WAIT) {
          status = ASYNC_ORDER_STATUS_MAP_LOCALE[ASYNC_ORDER_STATUS.WAIT]
        }
      } else {
        status = ASYNC_ORDER_STATUS_MAP_LOCALE[value]
      }

      return h(XTag, {
        color: status.color,
        label: localStore.localData[status.key!],
      })
    }
  }
}

const HIDDEN_COLUMNS = ['service', 'recommends', 'credits']

function processServiceFields(fields: ServiceHeader[]): XTableV2Column<OrderTableView>[] {
  const result: XTableV2Column<OrderTableView>[] = []

  for (let i = 0; i < fields.length; i++) {
    const item = fields[i]

    if (HIDDEN_COLUMNS.includes(item.itemKey!)) {
      continue
    }

    if (item.type === ServiceFieldType.Default) {
      const column = processDefaultFieldItem(item)
      result.push(column)
    } else if (item.type === ServiceFieldType.Dynamic) {
      const column = processDynamicFieldItem(item)
      result.push(column)
    }
  }

  return result
}

function processDefaultFieldItem(field: ServiceHeader): XTableV2Column<OrderTableView> {
  const title = !iStore.isEn
    ? field.name
    : field.nameEn

  switch (field.itemKey) {
    case 'index':
      return renderIndex(field.itemKey, title, ua.isMobile? 40 : 50)

    case 'service':
      return renderService(field.itemKey, title, field.width ?? 220)

    case 'imei':
      return renderText(field.itemKey, title, ua.isMobile? 70 : 130, undefined)

    case 'credits':
      return renderText(field.itemKey, title, field.width ?? 158, undefined)

    case 'status':
      return renderOrderStatus(field.itemKey, title, ua.isMobile? 75 : 90)

    case 'result':
      return renderHtml(field.itemKey, title, undefined, field.width ?? 320)

    case 'recommends':
      return renderRecommend(field.itemKey, title, field.width ?? 238)

    case 'remark':
      return renderText(field.itemKey, title, field.width ?? 158, undefined, true)

    case 'submit':
      return renderSubmitStatus(field.itemKey, title, field.width ?? 158)

    default:
      throw new Error()
  }
}

function processDynamicFieldItem(field: ServiceHeader): XTableV2Column<OrderTableView> {
  const title = !iStore.isEn
    ? field.name
    : field.nameEn
      ? field.nameEn
      : field.name

  return renderDynamicField(title, title, field.width!, true)
}

export async function getServiceFields(id: number) {
  const { data } = await serviceApi.header(id)

  return data
}

export async function processedServiceFields(id: number): Promise<ProcessedFieldsResp> {
  const serviceFields = await getServiceFields(id)

  const result: ProcessedFieldsResp = {
    columns: processServiceFields(serviceFields),
    fields: serviceFields
  }

  return result
}
