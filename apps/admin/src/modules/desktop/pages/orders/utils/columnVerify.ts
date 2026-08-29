import OrderVerifyAction from '../components/OrderVerifyAction.vue'
import type { Order } from '@/inters/orders'

import { type XColDef, XTextarea } from '@3un/ui'
import { ORDER_STATUS, SUBMIT_METHOD_MAP } from '@3un/utils'
import { h } from 'vue'

const serviceStore = useServiceStore()

export const columns: XColDef<Order> = [
  {
    key: 'codeId',
    title: '订单号',
    isDrag: true,
    width: 100,
  },
  {
    key: 'packageId',
    title: '服务',
    isDrag: true,
    isFilter: true,
    filterRender(row) {
      const service = serviceStore.itemMap.get(row.packageId)

      if (service) {
        return `${service.packageId} - ${service.packageTitle}`
      }

      return `${row.packageId}`
    },
    width: 225,
    render(value) {
      const serviceStore = useServiceStore()
      const service = serviceStore.itemMap.get(value)
      return service ? `${service.packageId} - ${service.packageTitle}` : '--'
    }
  },
  {
    key: 'userId',
    title: '用户',
    isDrag: true,
    isFilter: true,
    width: 88,
    render(value) {
      return h('a', {
        href: `/users?uid=${value}`,
        class: 'underline hover:text-success',
        // target: '_blank',
        // rel: 'opener',
      }, value)
    },
  },
  {
    key: 'credits',
    title: '积分',
    isDrag: true,
    width: 78,
  },
  {
    key: 'imeiNo',
    title: 'IMEI/SN',
    isDrag: true,
    isFilter: true,
    width: 154,
  },
  {
    key: 'code',
    title: '订单结果',
    isDrag: true,
    minWidth: 280,
    render(value) {
      return h(
        XTextarea, {
          'modelValue': value.split('<br>').join('\n'),
          rows: 6,
        },
      )
    }
  },
  {
    key: 'submitMethod',
    title: '提交方式',
    isDrag: true,
    width: 100,
    render(value) {
      return SUBMIT_METHOD_MAP[value].label
    }
  },
  {
    key: 'requestedAt',
    title: '耗时',
    isDrag: true,
    width: 88,
    render(_, row) {
      const whiteList = [ORDER_STATUS.PROCESSING, ORDER_STATUS.WAIT]
      if (whiteList.includes(row.codeStatusId)) {
        return '--'
      }

      const updateTimeDate = new Date(row.updateTime).getTime()
      const requestedAtDate = new Date(row.requestUpTime).getTime()
      const diffTime = updateTimeDate - requestedAtDate
      const diff = Math.round(diffTime / 1000)
      return diff < 1 ? '<1s' : `${diff}s`
    }
  },
  {
    key: 'updateTime',
    title: '日期',
    isDrag: true,
    width: 164,
    render(value, row) {
      const whiteList = [ORDER_STATUS.PROCESSING, ORDER_STATUS.WAIT]
      if (whiteList.includes(row.codeStatusId)) {
        return h('div', value.slice(5))
      }

      return [
        h('div', row.requestedAt.slice(5)),
        h('div', value.slice(5)),
      ]
    }
  },
  {
    key: 'action',
    title: '操作',
    width: 164,
    fixed: 'right',
    render(_, row, index) {
      return h(OrderVerifyAction, { row, index })
    }
  }
]
