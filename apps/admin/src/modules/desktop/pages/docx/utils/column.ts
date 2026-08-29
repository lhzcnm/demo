import IllustrateAction from '../component/IllustrateAction.vue'

import { h } from 'vue'
import { toast } from 'vue-sonner'
import { XButton, type XColDef } from '@3un/ui'

import type { IllustrateItem } from '@/inters/illustrate'
import { illustrateConfirm } from './index'

export const columns: XColDef<IllustrateItem> = [
  {
    key: 'id',
    title: 'ID',
    isDrag: true,
    width: 88,
  },
  {
    key: 'serviceCode',
    title: '说明文档模块',
    isDrag: true,
    minWidth: 128,
    render(value) {
      const router = useRouter()

      function naviRoute() {
        router.push(`/editor/docx/${value}`)
      }

      return h('button', {
        class: 'underline hover:text-success',
        onClick: naviRoute
      }, value)
    }
  },
  {
    key: 'description',
    title: '说明文档描述',
    isDrag: true,
    minWidth: 188,
    cellEmpty: "暂无描述",
    render(value) {
      return value ? value : '暂无描述'
    }
  },
  {
    key: 'serviceDesc',
    title: '富文本预览',
    isDrag: true,
    minWidth: 88,
    render(value, row) {
      const router = useRouter()

      async function handleClick() {
        if (!value) {
          toast.warning('该模块暂无文本')
          return
        }
        if (await illustrateConfirm(value)) {
          router.push(`/editor/docx/${row.serviceCode}`)
        }
      }
      return h(XButton, {
        size: 'sm',
        label: '效果预览',
        variant: 'ghost',
        onClick: handleClick
      })
    }
  },
  // {
  //   key: 'createTime',
  //   title: '创建时间',
  //   width: 128,
  // },
  {
    key: 'updateTime',
    title: '最新更新时间',
    isDrag: true,
    width: 168
  },
  {
    key: 'action',
    title: '操作',
    isDrag: true,
    width: 58,
    fixed: 'right',
    render(_, row, index) {
      return h(IllustrateAction, {
        row,
        index,
      })
    }
  },
]
