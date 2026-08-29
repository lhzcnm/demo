import type { OssItem } from "@/inters/oss"
import { type XColDef } from "@3un/ui"


export const columns: XColDef<OssItem> = [
  {
    key: 'ossId',
    title: 'OssID',
    isDrag: true,
    width: 128,
  },
  {
    key: 'originalName',
    title: '上传文件名',
    isDrag: true,
    width: 258,
  },
  {
    key: 'fileName',
    title: 'oss文件名',
    isDrag: true,
    minWidth: 208,
  },
  {
    key: 'url',
    title: 'oss下载地址',
    isDrag: true,
    minWidth: 238,
  },
  {
    key: 'createTime',
    title: '上传时间',
    isDrag: true,
    width: 158,
    render(value) {
      return value ?? '--'
    }
  },
  {
    key: 'service',
    title: '服务提供商',
    isDrag: true,
    width: 128,
  },
]
