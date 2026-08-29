import TableActions from '../components/TableActions.vue'

import { ORDER_STATUS, ORDER_STATUS_MAP, ORDER_VERIFY, ORDER_VERIFY_MAP } from '@3un/utils'
import { XTag, type XColDef } from '@3un/ui'
import { h } from 'vue'

import type { Order } from '@/api/orders'

const serviceStore = useServiceStore()
const localStore = useLocalStore()

export function getOrderColumns(): XColDef<Order> {
  return [
    { key: 'id', title: 'ID', width: 98, isDrag: true, },
    {
      key: 'serviceId',
      title: localStore.localData['history_TableHeadServuce'],
      isDrag: true,
      isFilter: true,
      filterRender(row) {
        const serviceStore = useServiceStore()

        const service = serviceStore.services.get(row.serviceId)
        if (service) {
          return `${service.id} - ${service.title}`
        }

        return ""
      },
      width: 220,
      render: (value) => {
        const service = serviceStore.services.get(value)
        return service
          ? `${service.id} - ${service.title}`
          : localStore.localData['history_NotFount']
      },
    },
    {
      key: 'imei',
      title: 'IMEI/SN',
      width: 158,
      isDrag: true,
      isFilter: true,
    },
    { key: 'credits', title: localStore.localData['history_TableHeadPoints'], width: 58, isDrag: true, },
    {
      key: 'status',
      title: localStore.localData['history_TableHeadOrderStatus'],
      width: 108,
      isDrag: true,
      render: (value: ORDER_STATUS) => {
        return h(XTag, {
          label: localStore.localData[ORDER_STATUS_MAP[value].key!],
          color: ORDER_STATUS_MAP[value].color,
        })
      }
    },
    {
      key: 'verify',
      title: localStore.localData['history_TableHeadVerifyStatus'],
      isDrag: true,
      width: 108,
      render(value: ORDER_VERIFY) {
        return h(XTag, {
          label: localStore.localData[ORDER_VERIFY_MAP[value].key!],
          color: ORDER_VERIFY_MAP[value].color,
        })
      }
    },
    {
      key: 'result',
      title: localStore.localData['history_TableHeadResult'],
      isDrag: true,
      minWidth: 320,
      render(value: string) {
        return h('div', { innerHTML: value })
      }
    },
    { key: 'createTime', title: localStore.localData['history_TableHeadSubmitTime'], width: 148, thClassName: 'text-center', isDrag: true },
    { key: 'remark', title: localStore.localData['history_TableHeadRemarks'], width: 168, isDrag: true },
    {
      key: 'action',
      title: localStore.localData['history_TableHeadOperation'],
      fixed: 'right',
      width: 158,
      render(_, row, index) {
        return h(TableActions, { row, index })
      }
    }
  ]
}
