import type { Intercept } from '@/inters/intercept'
import { deleteIntercept } from '@/api/intercept'
import { INTERCEPT_STORE } from '.'

import { XButton, type XColDef } from '@3un/ui'
import { toast } from 'vue-sonner'
import { h } from 'vue'

export const columns: XColDef<Intercept> = [
  {
    key: 'id',
    title: '拦截ID',
    isDrag: true,
    width: 72,
  },
  {
    key: 'ip',
    title: '拦截IP',
    isDrag: true,
    width: 128,
  },
  {
    key: 'createTime',
    title: '创建时间',
    isDrag: true,
    width: 180,
  },
  {
    key: 'expireTime',
    title: '过期时间',
    isDrag: true,
    width: 180,
  },
  {
    key: 'comments',
    title: '备注',
    isDrag: true,
    minWidth: 280,
  },
  {
    key: 'action',
    title: '操作',
    width: 108,
    render: (_, row, index) => {
      const store = inject(INTERCEPT_STORE)!
      function handleDelete() {
        deleteIntercept(row.id).then(() => {
          store.intercepts.splice(index, 1)
          toast.success('解除成功')
        })
      }

      return h(XButton, {
        label: '解除',
        size: 'sm',
        color: 'danger',
        icon: 'lucide:trash-2',
        onClick: handleDelete,
      })
    },
  },
]
