import { zOrderUpdateForm, type Order } from '@/inters/orders'
import { ORDER_STORE } from '../utils'

import { ORDER_STATUS, ORDER_STATUS_MAP, SUBMIT_METHOD_MAP } from '@3un/utils'
import { XButton, XTag, type XColDef } from "@3un/ui"
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
    key: 'orderIdFromServer',
    title: '上游订单号',
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
    key: 'codeStatusId',
    title: '订单状态',
    isDrag: true,
    width: 108,
    render(value) {
      return h(XTag, {
        ...ORDER_STATUS_MAP[value],
        solid: true,
      })
    }
  },
  {
    key: 'downloaded',
    title: '已经推送',
    isDrag: true,
    width: 100,
    render(value) {
      return value ? 'YES' : 'NO'
    }
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
    minWidth: 140,
    render(value) {
      return h('span', { innerHTML: value })
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
    key: 'costTime',
    title: '上游耗时',
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
    key: 'requestUpTime',
    title: '请求上游时间',
    isDrag: true,
    width: 168,
    render(_, row) {
      const whiteList = [ORDER_STATUS.PROCESSING, ORDER_STATUS.WAIT]
      if (whiteList.includes(row.codeStatusId)) {
        return h('div', `请求：${row.requestUpTime.slice(5)}`)
      }

      return [
        h('div', `请求：${row.requestUpTime.slice(5)}`),
        h('div', `更新：${row.updateTime.slice(5)}`),
      ]
    }
  },
  {
    key: 'requestedAt',
    title: '订单创建时间',
    isDrag: true,
    width: 164,
    // render(value, row) {
    //   const whiteList = [ORDER_STATUS.PROCESSING, ORDER_STATUS.WAIT]
    //   if (whiteList.includes(row.codeStatusId)) {
    //     return h('div', `请求：${value.slice(5)}`)
    //   }

    //   return [
    //     h('div', `请求：${value.slice(5)}`),
    //     h('div', `更新：${row.updateTime.slice(5)}`),
    //   ]
    // }
  },
  {
    key: 'comments',
    title: '备注',
    isDrag: true,
    width: 120,
  },
  {
    key: 'action',
    title: '操作',
    width: 88,
    fixed: 'right',
    render(_, row, index) {
      const store = inject(ORDER_STORE)!
      function handleUpdate() {
        store.formUpdate = zOrderUpdateForm.parse({
          codeId: row.codeId,
          imeiNo: row.imeiNo,
          code: row.code.split('<br>').join('\n'),
          codeStatusId: row.codeStatusId,
          originalStatus: row.codeStatusId,
          messageFromServer: row.messageFromServer,
          orderIdFromServer: row.orderIdFromServer,
        })

        store.index = index
        store.visibleUpdate = true
      }

      return h(XButton, {
        icon: 'lucide:edit',
        size: 'sm', label: '编辑',
        onClick: handleUpdate,
      })
    }
  },
]
