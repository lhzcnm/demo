import type { Notice } from "@/inters/notice"
import type { XColDef } from "@3un/ui"
import { h } from "vue"
import NoticeAction from "../components/NoticeAction.vue"
import NoticeStatusSwitch from "../components/NoticeStatusSwitch.vue"
import NoticeContentPreview from "../components/NoticeContentPreview.vue"

export const columns: XColDef<Notice> = [
  {
    key: "id",
    title: "ID",
    isDrag: true,
    width: 88,
  },
  {
    key: "title",
    title: "公告标题",
    isFilter: true,
    isDrag: true,
    minWidth: 158,
  },
  {
    key: "titleEn",
    title: "英文标题",
    isDrag: true,
    minWidth: 158,
  },
  {
    key: "content",
    title: "中文内容",
    isDrag: true,
    width: 120,
    render: (value, row) => {
      return h(NoticeContentPreview, {
        content: value as string,
        title: row.title,
      })
    }
  },
  {
    key: "contentEn",
    title: "英文内容",
    isDrag: true,
    width: 120,
    render: (value, row) => {
      return h(NoticeContentPreview, {
        content: value as string,
        title: row.titleEn,
      })
    }
  },
  {
    key: "status",
    title: "状态",
    isFilter: true,
    isDrag: true,
    width: 88,
    render: (_, row) => {
      return h(NoticeStatusSwitch, {
        row: row,
      })
    }
  },
  {
    key: "createTime",
    title: "创建时间",
    isDrag: true,
    width: 208,
    render: (value) => (value as string) || "—",
  },
  {
    key: "updateTime",
    title: "更新时间",
    isDrag: true,
    width: 208,
    render: (value) => (value as string) || "—",
  },
  {
    key: "action",
    title: "操作",
    width: 220,
    fixed: "right",
    render: (_, row, index) => {
      return h(NoticeAction, {
        row: row,
        index: index,
      })
    }
  }
]
