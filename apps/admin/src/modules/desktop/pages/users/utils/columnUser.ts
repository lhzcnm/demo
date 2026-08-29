import UserAction from '../components/UserAction.vue'

import { XButton, XSwitch, type XColDef } from '@3un/ui'
import { USER_ROLE_MAP } from '@3un/utils'
import { h } from 'vue'

import type { User } from '@/inters/users'
import { loginUserFront, updateUser } from '@/api/users'

export const columns: XColDef<User> = [
  {
    key: 'userId',
    title: 'ID',
    isDrag: true,
    width: 72,
  },
  {
    key: 'headImgUrl',
    title: '头像',
    isDrag: true,
    width: 54,
    render(value) {
      const mode = import.meta.env.VITE_APP_MODE
      const defaultAvatar = `/${mode}/default_avatar.jpg`

      return h('img', {
        src: value || defaultAvatar,
        class: 'size-7 rounded border',
      })
    },
  },
  {
    key: 'userName',
    title: '账号',
    isDrag: true,
    width: 128,
  },
  {
    key: 'nickName',
    title: '昵称',
    isDrag: true,
    width: 154,
  },
  {
    key: 'pricePlanId',
    title: '会员等级',
    isDrag: true,
    width: 108,
    render(value) {
      const levelStore = useLevelStore()
      const level = levelStore.levelMap.get(value)
      return level ? level.pricePlan : '未知'
    },
  },
  {
    key: 'role',
    title: '角色',
    isDrag: true,
    width: 108,
    render(value) {
      return USER_ROLE_MAP[value].label
    },
  },
  {
    key: 'credits',
    title: '积分',
    isDrag: true,
    width: 88,
  },
  {
    key: 'voucherCredits',
    title: '赠送积分',
    isDrag: true,
    width: 158,
    render: (_, row) => {
      return h(
        "div",
        { class: "flex flex-col" },
        [
          h("span", `查询类: ${row.voucherCredits}`),
          h("span", `解锁类: ${row.unlockCredits}`)
        ]
      )
    }
  },
  {
    key: 'weiXinOpenid',
    title: '微信ID',
    isDrag: true,
    minWidth: 320,
  },
  {
    key: 'addedAt',
    title: '注册时间',
    isDrag: true,
    width: 180,
  },
  {
    key: 'loginAction',
    title: '登录前台',
    isDrag: true,
    width: 128,
    render(_, row) {
      const iStore = useSystemStore()
      let frontUrl = iStore.configs['url']

      if (!frontUrl.endsWith('/')) {
        frontUrl += '/'
      }
      async function handleClick() {
        const newWin = window.open('about:blank')
        
        try {
          const ticket = await loginUserFront({ userId: row.userId })
          if (newWin) {
            newWin.location.href = `${frontUrl}auth-by-ticket?ticket=${ticket}`
          }
        } catch {
          newWin?.close()
        }
      }
      return h(XButton, {
        size: 'sm',
        label: '登录前台',
        // variant: 'soft',
        color: 'warning',
        onClick: () => handleClick()
      })
    }
  },
  {
    key: 'showApi',
    title: '是否显示ApiKey',
    isDrag: true,
    width: 128,
    render(_, row) {
      return h(XSwitch, {
        modelValue: row.showApi,
        "onUpdate:modelValue": async (val: boolean) => {
          const oldVal = row.showApi
          try {
            await updateUser({
              ...row,
              userId: row.userId,
              showApi: val
            })

            row.showApi = val
          } catch {
            setTimeout(() => row.showApi = oldVal, 1000)
          }
        }
      })
    }
  },
  {
    key: 'heartbeatEnabled',
    title: '心跳检测',
    isDrag: true,
    width: 128,
    render(_, row) {
      return h(XSwitch, {
        modelValue: row.heartbeatEnabled,
        "onUpdate:modelValue": async (val: boolean) => {
          const oldVal = row.heartbeatEnabled
          try {
            await updateUser({
              ...row,
              userId: row.userId,
              heartbeatEnabled: val
            })
            row.heartbeatEnabled = val
          } catch {
            setTimeout(() => row.heartbeatEnabled = oldVal, 1000)
          }
        }
      })
    }
  },
  {
    key: 'disableUser',
    title: '禁用',
    isDrag: true,
    width: 128,
    render(value, row) {
      return h(XSwitch, {
        modelValue: value,
        'onUpdate:modelValue': async (val) => {
          const oldVal = row.disableUser
          const response = updateUser({
            ...row,
            userId: row.userId,
            disableUser: val,
          })

          row.disableUser = val
          response.catch(() => {
            setTimeout(() => row.disableUser = oldVal, 1000)
          })
        },
      })
    },
  },
  {
    key: 'action',
    title: '操作',
    width: 98,
    fixed: 'right',
    render(_, row, index) {
      return h(UserAction, { row, index })
    },
  },
]
