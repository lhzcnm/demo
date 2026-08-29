import { type XColDef } from '@3un/ui'
import { h } from 'vue'

import type { RechargePackage } from '@/inters/recharge/package'
import PackageAction from '../components/PackageAction.vue'

export const columns: XColDef<RechargePackage> = [
  {
    key: 'id',
    title: '套餐ID',
    isDrag: true,
    width: 72,
    align: 'center'
  },
  {
    key: 'planId',
    title: '所属等级',
    isDrag: true,
    minWidth: 154,
    render: (_, row) => {
      const levelStore = useLevelStore()
      const level = levelStore.levelMap.get(row.planId)
      return h('span', level ? level.pricePlan : '未知等级')
    },
  },
  { key: 'shopName', title: '商品名称', minWidth: 154, isDrag: true, },
  { key: 'shopNameEn', title: '商品名称EN', minWidth: 154, isDrag: true, },
  { key: 'price', title: '价格', minWidth: 108, isDrag: true, },
  { key: 'month', title: '月数', minWidth: 108, isDrag: true, },
  { key: 'createTime', title: '创建时间', width: 180, isDrag: true, },
  {
    key: 'action',
    title: '操作',
    width: 154,
    render: (_, row, index) => {
      return h(PackageAction, { row, index })
    },
  },
]
