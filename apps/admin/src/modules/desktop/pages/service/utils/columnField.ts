import FieldAction from '../components/FieldAction.vue'

import { type XColDef, XInputNumber, XSwitch } from '@3un/ui'
import { h } from 'vue'

import type { ServiceField } from '@/inters/services'
import { updateServiceField } from "@/api/services"

export const columns: XColDef<ServiceField> = [
  {
    key: 'id',
    title: '字段 ID',
    isDrag: true,
    width: 64,
  },
  {
    key: 'serviceId',
    title: '服务',
    // minWidth: 250,
    isDrag: true,
    isFilter: true,
    filterRender(row) {
      if (row.serviceId === 0) {
        return "默认字段"
      }

      const serviceStore = useServiceStore()
      const service = serviceStore.itemMap.get(row.serviceId)

      if (service) {
        return `${service.packageId} - ${service.packageTitle}`
      }

      return "未知服务"
    },
    width: 300,
    render(_, row) {
      if (row.serviceId === 0) {
        return '默认字段(不允许删除)'
      }
      const serviceStore = useServiceStore()
      const service = serviceStore.itemMap.get(row.serviceId)!
      if (!service) return '服务不存在'
      return `${service.packageId} - ${service.packageTitle}`
    },
  },
  {
    key: 'name',
    title: '字段名称',
    isDrag: true,
    width: 128,
  },
  {
    key: 'nameEn',
    title: '字段名称EN',
    isDrag: true,
    width: 208,
  },
  {
    key: 'width',
    title: '字段宽度',
    isDrag: true,
    width: 128,
  },
  {
    key: 'status',
    title: '显示',
    isDrag: true,
    width: 98,
    render(value, row) {
      return h(XSwitch, {
        modelValue: value,
        activeValue: 1,
        inactiveValue: 0,
        'onUpdate:modelValue': async (val) => {
          const oldVal = row.status
          const response = updateServiceField({
            id: row.id,
            status: val,
          })
          
          row.status = val
          response.catch(() => {
            setTimeout(() => row.status = oldVal, 1000)
          })
        },
      })
    }
  },
  {
    key: 'sortNum',
    title: '排序(值越大越靠前)',
    isDrag: true,
    width: 164,
    render(value, row) {
      return h(XInputNumber, {
        size: 'sm',
        modelValue: value,
        'onUpdate:modelValue': (val) => {
          const oldVal = row.sortNum
          const response = updateServiceField({
            id: row.id,
            sortNum: +val,
          })

          row.sortNum = +val
          response.catch(() => {
            setTimeout(() => row.sortNum = oldVal, 1000)
          })
        },
      })
    },
  },
  {
    key: 'action',
    title: '操作',
    width: 120,
    fixed: 'right',
    render: (_, row, index) => {
      return h(FieldAction, { row, index })
    }
  }
]
