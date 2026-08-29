import UpstreamAction from '../components/UpstreamAction.vue'

import { XSwitch, type XColDef, XTag } from '@3un/ui'
import { API_TYPE_MAP } from '@3un/utils'
import { h } from 'vue'

import { zUpstream, type Upstream } from '@/inters/upstream'
import { updateUpstream } from '@/api/upstream'
import { toast } from 'vue-sonner'

async function updateApiItem(row: Upstream) {
  await updateUpstream({
    apiId: row.apiId,
    apiTitle: row.apiTitle,
    disableApi: row.disableApi,
    apiKey: row.apiKey,
    serverUrl: row.serverUrl,
    accountId: row.accountId,
    apiType: row.apiType
  })
  toast.success('更新成功')
}

export const columns: XColDef<Upstream> = [
  {
    key: 'apiId',
    title: 'APIID',
    isDrag: true,
    width: 68
  },
  {
    key: 'apiTitle',
    title: 'API名称',
    isDrag: true,
    width: 225,
    edit: {
      trigger: 'dblclick',
      dataType: 'string',
      outside: {
        close: true,
        save: true,
      },
      async onSaveEdit(row, val) {
        row.apiTitle = val
        await updateApiItem(zUpstream.parse(row))
      }
    },
    render(value) {
      return h('div', value)
    }
  },
  {
    key: 'serverUrl',
    title: 'API地址',
    isDrag: true,
    minWidth: 350,
    edit: {
      trigger: 'dblclick',
      dataType: 'string',
      outside: {
        close: true,
        save: true,
      },
      async onSaveEdit(row, val) {
        row.serverUrl = val
        await updateApiItem(zUpstream.parse(row))
      }
    },
    render(value) {
      const [url, query] = value.split('?')
      if (query) {
        const list = query.split('&')
        return h('div', [
          h('div', { class: 'underline' }, url),
          ...list.map((item: string) => {
            const [key, value] = item.split('=')
            return h('div', `${key}：${value || '--'}`)
          }),
        ])
      }

      return h('div', url)
    },
  },
  {
    key: 'accountId',
    title: '用户名',
    isDrag: true,
    width: 108,
    cellEmpty: '--',
    edit: {
      trigger: 'dblclick',
      dataType: 'string',
      outside: {
        close: true,
        save: true,
      },
      async onSaveEdit(row, val) {
        row.accountId = val
        await updateApiItem(zUpstream.parse(row))
      }
    },
    render(value) {
      return h('div', value)
    }
  },
  {
    key: 'apiKey',
    title: 'API密钥',
    isDrag: true,
    width: 300,
    cellEmpty: '--',
    edit: {
      trigger: 'dblclick',
      dataType: 'string',
      outside: {
        close: true,
        save: true,
      },
      async onSaveEdit(row, val) {
        row.apiKey = val
        await updateApiItem(zUpstream.parse(row))
      }
    },
    render(value) {
      return h('div', value)
    }
  },
  {
    key: 'apiType',
    title: 'API类型',
    isDrag: true,
    isFilter: true,
    filterRender(row) {
      return API_TYPE_MAP[row.apiType].label
    },
    width: 128,
    render(value) {
      return h(XTag, API_TYPE_MAP[value])
    },
  },
  {
    key: 'disableApi',
    title: '禁用',
    isDrag: true,
    width: 128,
    render(value, row) {
      return h(XSwitch, {
        modelValue: value,
        'onUpdate:modelValue': async (val) => {
          const oldVal = row.disableApi
          const response = updateUpstream({
            apiId: row.apiId,
            disableApi: val,
          })

          row.disableApi = val
          response.catch(() => {
            setTimeout(() => row.disableApi = oldVal, 1000)
          })
        },
      })
    },
  },
  {
    key: 'action',
    title: '操作',
    width: 154,
    fixed: 'right',
    render(_, row, index) {
      return h(UpstreamAction, { row, index })
    },
  },
]