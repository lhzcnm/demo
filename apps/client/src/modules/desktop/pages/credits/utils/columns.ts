import type { CreditLogItem } from '@/api/user'
import type { XColDef } from '@3un/ui'
import { h } from 'vue'

const store = useServiceStore()
const localStore = useLocalStore()

export function getCreditColumns(): XColDef<CreditLogItem> {

  return [
    {
      key: 'packageId',
      title: localStore.localData['credits_Service'],
      isDrag: true,
      isFilter: true,
      filterRender(row) {
        if (!row.packageId) return '积分充值'
        const service = store.services.get(row.packageId)
        return service ? `${service.id} - ${service.title}` : localStore.localData['credits_ServiceNotFound']
      },
      width: 220,
      render: (value) => {
        if (!value) return '积分充值'
        const service = store.services.get(value)
        return service ? `${service.id} - ${service.title}` : localStore.localData['credits_ServiceNotFound']
      }
    },
    {
      key: 'imeiNo',
      title: 'IMEI',
      isDrag: true,
      isFilter: true,
      width: 180
    },
    {
      key: 'credits',
      title: localStore.localData['credits_Amout'],
      isDrag: true,
      width: 88,
      render: (value: number, row) => {
        const isSubmit = /提交订单|order|订单提交|Code Request/.test(row.description)
        const isReduce = value < 0 || isSubmit
        let label = Math.abs(value).toString()
        let color, text

        if (isReduce) {
          color = 'text-danger'
          text = `-${label}`
        }
        else {
          color = 'text-success'
          text = `+${label}`
        }

        return h('span', { class: color }, text)
      }
    },
    {
      key: 'description',
      title: localStore.localData['credits_Reason'],
      isDrag: true,
      width: 280
    },
    {
      key: 'historyDtTm',
      title: localStore.localData['credits_Time'],
      isDrag: true,
      width: 180
    },
    {
      key: 'ip',
      title: 'IP',
      isDrag: true,
      width: 180
    },
    {
      key: 'comments',
      title: localStore.localData['credits_Comment'],
      isDrag: true,
      minWidth: 180
    }
  ]
}
