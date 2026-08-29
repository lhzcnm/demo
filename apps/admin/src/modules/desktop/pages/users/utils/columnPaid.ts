import { XButton, type XColDef } from "@3un/ui"
import { h } from "vue"

import type { UserPaid } from "@/inters/users"
import { loginUserFront } from "@/api/users"

export const columns: XColDef<UserPaid> = [
  {
    key: "userId",
    title: "ID",
    isDrag: true,
    width: 72,
    render: (value) => {
      return h(
        "a",
        {
          href: `/users?uid=${value}`,
          class: "underline hover:text-success",
        },
        value,
      )
    },
  },
  {
    key: "headImgUrl",
    title: "头像",
    isDrag: true,
    width: 54,
    render(value) {
      const mode = import.meta.env.VITE_APP_MODE
      const defaultAvatar = `/${mode}/default_avatar.jpg`

      return h("img", {
        src: value || defaultAvatar,
        class: "size-7 rounded border",
      })
    },
  },
  {
    key: "userName",
    title: "账号",
    isDrag: true,
    width: 128,
  },
  {
    key: "nickName",
    title: "昵称",
    isDrag: true,
    width: 154,
  },
  {
    key: "credits",
    title: "积分",
    isDrag: true,
    width: 88,
  },
  {
    key: "voucherCredits",
    title: "赠送积分",
    isDrag: true,
    width: 158,
    render: (_, row) => {
      return h("div", { class: "flex flex-col" }, [
        h("span", `查询类: ${row.voucherCredits}`),
        h("span", `解锁类: ${row.unlockCredits}`),
      ]);
    },
  },
  {
    key: "weixinOpenId",
    title: "微信ID",
    isDrag: true,
    minWidth: 320,
  },
  {
    key: "memberExp",
    title: "会员到期时间",
    isDrag: true,
    width: 180,
  },
  {
    key: "loginAction",
    title: "登录前台",
    isDrag: true,
    width: 128,
    render(_, row) {
      const iStore = useSystemStore()
      let frontUrl = iStore.configs["url"]

      if (!frontUrl.endsWith("/")) {
        frontUrl += "/"
      }
      async function handleClick() {
        const newWin = window.open("about:blank")

        try {
          const ticket = await loginUserFront({ userId: row.userId })
          if (newWin) {
            newWin.location.href = `${frontUrl}auth-by-ticket?ticket=${ticket}`
          }
        } catch {
          newWin?.close();
        }
      }
      return h(XButton, {
        size: "sm",
        label: "登录前台",
        // variant: 'soft',
        color: "warning",
        onClick: () => handleClick(),
      })
    },
  },
  {
    key: "remark",
    title: "备注",
    isDrag: true,
    width: 180,
  },
]
