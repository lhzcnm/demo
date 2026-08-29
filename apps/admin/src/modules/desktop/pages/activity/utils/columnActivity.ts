import type { Activity } from "@/inters/activity"
import type { XColDef } from "@3un/ui"
import { ACTIVITY_STATUS, ACTIVITY_STATUS_MAP, xconfirm } from "@3un/utils"
import { h } from "vue"
import ActivityAction from "../components/ActivityAction.vue"
import { ACTIVITY_STORE } from "."

export const columns: XColDef<Activity> = [
  {
    key: "id",
    title: "ID",
    isDrag: true,
    width: 88,
  },
  {
    key: "name",
    title: "活动名",
    isFilter: true,
    isDrag: true,
    minWidth: 158,
  },
  {
    key: "status",
    title: "活动状态",
    width: 208,
    isFilter: true,
    isDrag: true,
    render: (value) => {
      const status = ACTIVITY_STATUS_MAP[value as ACTIVITY_STATUS]

      return h("span", {
        class: status.class,
      }, status.label)
    }
  },
  {
    key: "startTime",
    title: "活动开始时间",
    isDrag: true,
    width: 208,
  },
  {
    key: "endTime",
    title: "活动结束时间",
    isDrag: true,
    width: 208,
  },
  {
    key: "createdAt",
    title: "活动创建时间",
    isDrag: true,
    width: 208,
  },
  // {
  //   key: "sortOrder",
  //   title: "活动排序",
  //   width: 208,
  // },
  {
    key: "description",
    title: "活动描述",
    isDrag: true,
    width: 128,
    render: (_, __, index) => {
      const store = inject(ACTIVITY_STORE)!
      
      function handleClick() {
        xconfirm(store.activities[index].description)
      }

      return h("button", {
        class: "text-primary hover:text-success",
        onClick: handleClick
      }, "查看描述")
    }
  },
  {
    key: "action",
    title: "操作",
    width: 88,
    fixed: "right",
    render: (_, row, index) => {
      return h(ActivityAction, {
        row: row,
        index: index,
      })
    }
  }
]