import UnlockAction from '../components/UnlockAction.vue'
import { UNLOCK_STORE } from '.'

import type { Unlock } from '@/inters/services'
import { XButton, type XColDef } from '@3un/ui'
import { h } from 'vue'

export const columns: XColDef<Unlock> = [
  {
    key: 'packageId',
    title: '服务 ID',
    width: 64,
  },
  {
    key: 'name',
    title: '服务名称',
    width: 280,
  },
  {
    key: 'operator',
    title: '触发关键字',
    minWidth: 154,
  },
  {
    key: 'convertCode',
    title: '转换码',
    minWidth: 250,
    render(value, _, index) {
      const store = inject(UNLOCK_STORE)!

      function openConvert() {
        store.visibleConvert = true
        store.index = index
      }

      return h(
        'div',
        { class: 'flex items-center space-x-2' },
        [
          h(XButton, { size: 'sm', label: '编辑', onClick: openConvert }),
          h('span', `${value.length} 条转换码`),
        ],
      )
    }
  },
  {
    key: 'action',
    title: '操作',
    width: 154,
    render: (_, row, index) => h(UnlockAction, { row, index })
  }
]
