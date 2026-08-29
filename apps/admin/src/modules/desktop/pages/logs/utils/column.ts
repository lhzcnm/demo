import type { XColDef } from '@3un/ui'
import type { Log } from '@/inters/logs'
import { h } from 'vue'

export const columns: XColDef<Log> = [
  {
    key: 'id',
    title: '日志ID',
    isDrag: true,
    width: 72,
  },
  {
    key: 'userId',
    title: '用户ID',
    isDrag: true,
    minWidth: 72,
    render(value) {
      return h('a', {
        href: `/users?uid=${value}`,
        class: 'underline hover:text-success',
        target: '_blank',
        rel: 'opener',
      }, value)
    },
  },
  {
    key: 'ip',
    title: 'IP地址',
    isDrag: true,
    minWidth: 160,
  },
  {
    key: 'region',
    title: '地区',
    isDrag: true,
    isFilter: true,
    minWidth: 200,
  },
  {
    key: 'loginTime',
    title: '登录时间',
    isDrag: true,
    minWidth: 160,
  },
  {
    key: 'logoutTime',
    title: '登出时间',
    isDrag: true,
    minWidth: 160,
  },
]
