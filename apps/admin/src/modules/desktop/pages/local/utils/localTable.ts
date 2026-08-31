import type { XColDef } from "@3un/ui";
import { h } from "vue";
import Action from "../components/Action.vue";
import type { localListTableTypes } from "@/types/local.ts";



export const localListTable: XColDef<localListTableTypes> = [
  {
    key: 'id',
    title: 'ID',
    align: 'center',
    isDrag: true,
    width: 32,
  },
  {
    key: 'fullKey',
    title: 'KEY',
    align: 'left',
    isDrag: true,
    width: 60,
  },
  {
    key: 'ch',
    title: '中文名称',
    align: 'left',
    isDrag: true,
    width: 90,
  },
  {
    key: 'en',
    title: '英文名称',
    align: 'left',
    isDrag: true,
    width: 90,
  },
  {
    key: 'moduleName',
    title: '归属模块',
    align: 'center',
    isDrag: true,
    width: 50,
  },
  {
    key: 'createTime',
    title: '创建时间',
    align: 'left',
    isDrag: true,
    width: 60,
  },
  {
    key: 'updateTime',
    title: '修改时间',
    align: 'left',
    isDrag: true,
    width: 60,
  },
  {
    key: 'remark',
    title: '备注',
    align: 'left',
    isDrag: true,
    width: 90,
  },
  {
    key: 'action',
    title: '操作',
    align: 'center',
    fixed: "left",
    width: 40,
    render: (_, row) => {
      return h(Action, {row})
    }
  },
]
