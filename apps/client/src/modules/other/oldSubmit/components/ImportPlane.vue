<script setup lang="ts">
import { IMEI_TYPE, ua } from '@3un/utils'
import { getSubmitImei, base64ToFile } from '@/utils'
import { toast } from 'vue-sonner'
import * as XLSX from 'xlsx'
import { wxApi } from '@/api/wx'

interface ImportPlaneProps {
  selectedId: number | undefined
  disabled?: boolean
}

interface ImportPlaneEmits {
  (e: 'submit', imeiList: string[], remark: string): void
}

const uStore = useUserStore()
const serviceStore = useServiceStore()
const store = useServiceStore()
const localStore = useLocalStore()

const props = defineProps<ImportPlaneProps>()
const emits = defineEmits<ImportPlaneEmits>()

const open = ref(false)
const imei = ref('')
const remark = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const formatLoading = ref(false)

/**
 * 有效的 IMEI 列表
 * 根据服务的 IMEI 类型进行格式化处理
 */
const validImeiList = computed(() => {
  const service = store.services.get(props.selectedId!)
  const imeiType = service?.imeiType || IMEI_TYPE.NONE

  return getSubmitImei(imei.value, imeiType, service?.domesticSerialType)
})

/**
 * 服务单价
 */
const unitPrice = computed(() => {
  const service = serviceStore.services.get(props.selectedId!)

  if (!service) return "0.00"
  return (service.price ?? 0).toString()
})

/**
 * 服务价格
 */
const servicePrice = computed(() => {
  if (!props.selectedId) return 0

  const service = store.services.get(props.selectedId)

  return service?.price ?? 0
})

/**
 * 可下单数量
 * 根据账户余额和服务价格计算
 */
const usefulCount = computed(() => {
  if (!props.selectedId) return ""
  const credits = Number(uStore.info?.credits ?? 0)
  const price = Number(servicePrice.value || 0)
  if (!credits || !price || Number.isNaN(credits) || Number.isNaN(price)) return "0"
  return Math.floor(credits / price).toString()
})

/**
 * 提交导入
 */
function handleSubmit() {
  if (validImeiList.value.length === 0) {
    toast.warning(localStore.localData['submit_NullImei'])
    return
  }

  emits(
    'submit',
    validImeiList.value,
    remark.value
  )
  open.value = false
  handleClosed()
}

/**
 * 关闭弹窗时清空数据
 */
function handleClosed() {
  remark.value = ''
  imei.value = ''
}

/**
 * 处理拖拽文件
 * @param event - 拖拽事件
 */
async function handleDrop(event: DragEvent) {
  const file = event.dataTransfer!.files[0]
  await handleFile(file)
}

/**
 * 处理文件解析
 * 支持 txt、csv、xlsx、xls 格式
 */
async function handleFile(file: File) {
  const extension = file.name.split('.').pop()!.toLowerCase()
  let text = ''

  try {
    if (['txt', 'csv'].includes(extension)) {
      text = await file.text()
    } else if (['xlsx', 'xls'].includes(extension)) {
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer)
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })
      text = data.flat().filter(Boolean).join('\n')
    }
    const imeiList = getSubmitImei(text, IMEI_TYPE.IMEI_OR_SN, undefined).join('\n')
    imei.value = imeiList
  } catch (error) {
    console.error('[File parse error]', error)
    toast.error(localStore.localData['submit_ImportFileError'])
  }
}

/**
 * 选择文件
 */
function pickFile() {
  fileInput.value?.click()
}

/**
 * 文件选择回调
 */
async function onFilePicked(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) await handleFile(file)
  input.value = ''
}

/**
 * 从微信 localId 获取图片 base64
 */
function getImageData(localId: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    window.wx.getLocalImgData({
      localId,
      fail: (res) => reject(res.errMsg),
      success: ({ localData }) => {
        let base64 = localData
        if (ua.os === 'iOS') {
          base64 = base64.replace(/^data:image\/\w+;base64,/, '')
        }
        resolve(base64)
      },
    })
  })
}

/**
 * 拍照导入
 */
function handlePhoto() {
  if (!ua.isWechat) return
  window.wx.chooseImage({
    sizeType: ['original'],
    sourceType: ['camera'],
    fail: (res) => window.alert(res.errMsg),
    success: (res) => {
      const localId = res.localIds[0]
      formatLoading.value = true
      getImageData(localId).then((data) => {
        const file = base64ToFile(data)
        const formData = new FormData()
        formData.append('file', file)
        const response = wxApi.ocr(formData)
        response.then(({ data }) => {
          const imeiList = getSubmitImei(data, IMEI_TYPE.IMEI_OR_SN, undefined).join('\n')
          const trimed = imei.value.trim()
          imei.value = trimed ? `${trimed}\n${imeiList}` : imeiList
        }).catch((err: any) => {
          if (err.code === 'ECONNABORTED') {
            toast.error(localStore.localData['submit_RequestTimeout'])
          } else {
            toast.error(localStore.localData['submit_RequestError'])
          }
        }).finally(() => {
          formatLoading.value = false
        })
      })
    },
  })
}

/**
 * 扫码导入
 */
function handleScan() {
  if (!ua.isWechat) return
  window.wx.scanQRCode({
    needResult: 1,
    scanType: ['qrCode', 'barCode'],
    fail: (res: any) => window.alert(res?.errMsg || '扫码失败'),
    success: (res: any) => {
      try {
        const raw: string = String(res?.resultStr ?? '')
        let result = raw.split(',')[1]?.trim()
        if (!result) {
          const list = getSubmitImei(raw, IMEI_TYPE.NONE, undefined)
          result = list[0] || ''
        }
        if (!result) return toast.warning(localStore.localData['submit_NullImei'])
        const trimed = imei.value.trim()
        imei.value = trimed ? `${trimed}\n${result}` : result
      } catch (e) {
        console.error('[Scan import error]', e)
        toast.error('扫码解析失败')
      }
    },
  })
}

</script>

<template>
  <!-- 导入按钮 -->
  <XButton @click="open = true" :label="localStore.localData['submit_Import']" variant="outline" icon="ci:folder-upload"
    :size="ua.isMobile ? 'sm' : 'md'" />

  <!-- 导入弹窗 -->
  <XDialog v-model="open" :maskClosable="false" draggable :title="localStore.localData['submit_ImportButton']"
    uiRoot="sm:max-w-2xl z-[60] relative select-none p-0" ui-header="px-4 pt-2" @close="handleClosed">
    <!-- 隐藏文件选择器 -->
    <input ref="fileInput" type="file" accept=".txt,.csv,.xlsx,.xls" class="hidden" @change="onFilePicked" />

    <div class="flex space-x-3 w-full p-2 border-t border-border">
      <!-- IMEI 输入区 -->
      <XTextarea class="text-[16px]" v-model="imei" rows="20" autofocus @dragover.prevent @drop.prevent="handleDrop"
        :placeholder="localStore.localData['submit_old_importToast']" />

      <!-- 右侧操作区 -->
      <section class="flex flex-col justify-between w-[500px] space-y-3">
        <!-- 操作按钮组 -->
        <div class="flex flex-col space-y-2">
          <XButton @click="handleSubmit" :disabled="formatLoading" :loading="formatLoading"
            :label="localStore.localData['submit_old_ConfirmImport']" />
          <XButton @click="pickFile" :label="localStore.localData['submit_old_ImportFile']" />
          <XButton v-if="ua.isWechat" @click="handlePhoto" :disabled="formatLoading"
            :label="localStore.localData['submit_TakePhoto']" />
          <XButton v-if="ua.isWechat" @click="handleScan" :disabled="formatLoading"
            :label="localStore.localData['submit_old_ScanToImport']" />
          <XButton @click="handleClosed" color="danger" variant="soft"
            :label="localStore.localData['submit_old_ClearData']" />
        </div>

        <!-- 备注与信息 -->
        <div class="flex flex-col">
          <div>
            <a href="javascript:void(0)" :title="localStore.localData['submit_ImportValidIMEI']"
              class="text-sm text-muted-foreground hover:bg-muted rounded-md px-2 py-1 -ml-2"
              @click="imei = validImeiList.join('\n')">
              <span class="mr-1">{{ localStore.localData['submit_ImportVaildQuantity'] }}:</span>
              <span class="text-primary">{{ validImeiList.length }}</span>
            </a>


          </div>
          <div class="space-x-2">
            <span class="text-sm text-muted-foreground">
              {{ localStore.localData['submit_ImportBlance'] }}: {{ uStore.info.credits }}
            </span>

            <span class="text-sm text-muted-foreground">
              {{ localStore.localeSlotVal('submit_ImportUnitPrice', { '{price}': unitPrice }) }}
            </span>
          </div>

          <span class="text-sm text-muted-foreground">

            {{ localStore.localeSlotVal('submit_ImportSubmitOrder', { '{count}': usefulCount }) }}
          </span>

          <XTextarea v-model="remark" rows="10" :placeholder="localStore.localData['submit_ImportRemarkPlaceholder']" />
        </div>


      </section>
    </div>
  </XDialog>
</template>