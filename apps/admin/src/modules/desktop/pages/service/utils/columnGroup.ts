import GroupAction from '../components/GroupAction.vue'

import { type XColDef, XInputNumber, XSwitch } from "@3un/ui"
import { h } from 'vue'

import type { ServiceGroup } from '@/inters/services'
import { updateServiceGroup } from '@/api/services'

export const columns: XColDef<ServiceGroup> = [ 
  {
    key: 'categoryId',
    title: '服务组ID',
    isDrag: true,
    width: 88,
  },
  {
    key: 'category',
    title: '服务组名称',
    isDrag: true,
    minWidth: 220,
  },
  {
    key: 'categoryLocal',
    title: '服务组名称EN',
    isDrag: true,
    minWidth: 320,
    cellEmpty: '--',
  },
  {
    key: 'orderBy',
    title: '排序(值越大越靠前)',
    isDrag: true,
    width: 164,
    render(value, row) {
      return h(XInputNumber, {
        size: 'sm',
        modelValue: value,
        'onUpdate:modelValue': (val) => {
          const oldVal = row.orderBy
          const response = updateServiceGroup({
            categoryId: row.categoryId,
            orderBy: +val,
          })

          row.orderBy = +val
          response.catch(() => {
            setTimeout(() => row.orderBy = oldVal, 1000)
          })
        },
      })
    },
  },
  {
    key: 'disableCategory',
    title: '禁用',
    isDrag: true,
    width: 98,
    render(value, row) {
      return h(XSwitch, {
        modelValue: value,
        activeValue: 1,
        inactiveValue: 0,
        'onUpdate:modelValue': async (val) => {
          const oldVal = row.disableCategory
          const response = updateServiceGroup({
            categoryId: row.categoryId,
            disableCategory: val,
          })
          
          row.disableCategory = val
          response.catch(() => {
            setTimeout(() => row.disableCategory = oldVal, 1000)
          })
        },
      })
    },
  },
  {
    key: 'action',
    title: '操作',
    width: 88,
    fixed: 'right',
    render: (_, row, index) => h(GroupAction, { row, index })
  }
]
