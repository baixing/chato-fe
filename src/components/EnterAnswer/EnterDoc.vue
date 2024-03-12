<template>
  <div>
    <el-dialog
      v-model="visible"
      :title="$t('录入文档')"
      :width="isMobile ? '80%' : '40%'"
      class="dialog-box-container"
      :before-close="() => emit('closeDialogVisble', false)"
      :show-close="false"
    >
      <template #header="{ close, titleId, titleClass }">
        <div class="my-header">
          <h4 :id="titleId" :class="titleClass">{{ $t('录入文档') }}</h4>
          <el-icon class="el-icon--left" @click="close" :size="22">
            <Close />
          </el-icon>
        </div>
      </template>
      <el-tabs v-model="activeName">
        <el-tab-pane :label="$t('上传文件')" name="upload-doc">
          <div class="upload-box">
            <div class="description">
              <p>{{ $t('支持文档识别、图片识别、音视频识别。') }}</p>
              <p>
                {{
                  $t(
                    '文档支持 {sizeLimit}MB 以内，图片支持 {sizeLimit}MB 以内，音视频支持 {mediaLimit}MB 以内。',
                    { sizeLimit, mediaLimit }
                  )
                }}
              </p>
              <p>{{ $t('图片及音视频上传后会自动解析成文字存储并学习。') }}</p>
              <p>{{ $t('文档内容中表格和图片可能存在无法学习的情况。') }}</p>
              <p>{{ $t('单次最多上传 {qtyLimit} 个。', { qtyLimit }) }}</p>
            </div>
            <el-upload
              class="upload-ctrl"
              v-model:file-list="uploadFileList"
              :action="apiUpload"
              :accept="acceptFileTypes"
              :before-upload="beforeUpload"
              :on-change="handleChange"
              :on-success="handleSuccess"
              :on-progress="onProgress"
              :on-error="onError"
              :on-exceed="onExceed"
              :limit="qtyLimit"
              multiple
              :headers="headers"
              drag
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                {{ $t('将文件拖到此处，或') }}<em>{{ $t('点击上传') }}</em>
              </div>
            </el-upload>
            <div
              class="text-[#7C5CFC] text-xs cursor-pointer"
              @click="demonstrationFile"
              v-if="demonstrationData.file_url"
            >
              {{ $t('上传示例文档') }}
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane :label="$t('输入文本')" name="input-text">
          <el-form
            ref="ruleFormRef"
            size="large"
            :disabled="inputTextForm.status === 'preview'"
            :rules="rules"
            :model="inputTextForm"
            class="input-text-form special-text-form"
          >
            <el-form-item prop="title">
              <el-input
                type="text"
                v-model="inputTextForm.title"
                :placeholder="$t('文本标题')"
                maxlength="30"
              ></el-input>
            </el-form-item>
            <el-form-item prop="content_html" class="content_html_item">
              <HansInputLimit
                v-model:value="inputTextForm.content_html"
                type="textarea"
                :placeholder="$t('文本内容，请输入 100000 字符以内')"
                :rows="10"
                :limit="limit.text_prompt"
                :specifyInputStrLen="getStringWidth(inputTextForm.content_html || '')"
                class="w-full mb-4"
              />
            </el-form-item>
            <div
              class="text-[#7C5CFC] text-xs cursor-pointer"
              @click="onDemonstration(() => (inputTextForm.content_html = demonstrationData.text))"
              v-if="demonstrationData.text"
            >
              {{ $t('填充示例文本') }}
            </div>
          </el-form>
        </el-tab-pane>
        <el-tab-pane :label="$t('网页抓取')" name="input-url">
          <div class="description">
            <p>
              {{ $t('请避免非法抓取他人网站的侵权行为，保证链接可公开访问，且网站内容可复制') }}
            </p>
            <p>{{ $t('可抓取的网页仅为内容固定不变的静态网页，例如新闻文章、产品介绍等') }}</p>
          </div>
          <el-form
            ref="spliderUrl"
            size="large"
            :disabled="inputTextForm.status === 'preview'"
            :rules="rulesUrl"
            :model="spliderUrlForm"
            class="input-text-form special-text-form"
          >
            <el-form-item prop="urlData">
              <el-input
                type="textarea"
                :rows="10"
                v-model="spliderUrlForm.urlData"
                :placeholder="$t('输入要爬取的网页地址，使用英文,分隔')"
              />
            </el-form-item>
            <div
              class="text-[#7C5CFC] text-xs cursor-pointer"
              @click="onDemonstration(() => (spliderUrlForm.urlData = demonstrationData.web_url))"
              v-if="demonstrationData.web_url"
            >
              {{ $t('填充示例网址') }}
            </div>
          </el-form>
        </el-tab-pane>
        <el-tab-pane :label="$t('公众号抓取')" name="input-public">
          <p class="description">
            {{ $t('避免未经授权抓取他人公众号原创文章的侵权行为') }}
          </p>
          <el-form
            ref="spliderPublic"
            size="large"
            :disabled="inputTextForm.status === 'preview'"
            :rules="rulesPublic"
            label-width="100px"
            label-position="left"
            :model="spliderPublicForm"
            class="input-text-form special-text-form"
          >
            <el-form-item
              prop="title"
              class="text-black"
              :class="{ '!mb-0': demonstrationData.wx_public_url }"
              :label="$t('搜索名称')"
            >
              <el-select
                class="w-full"
                ref="spliderWxPublicEl"
                v-model="spliderPublicForm.publicName"
                filterable
                clearable
                remote
                reserve-keyword
                :placeholder="$t('请输入公众号的名称')"
                :remote-method="getWXPublicListByPublicName"
                :loading="wxPublicListLoading"
              >
                <el-option
                  v-for="item in WXPublicList"
                  :key="item.fakeid"
                  :label="item.nickname"
                  :value="item.nickname"
                >
                  <div class="flex gap-2 items-center">
                    <img :src="item.round_head_img" class="w-6 h-6 object-cover" />
                    {{ item.nickname }}
                  </div>
                </el-option>
              </el-select>
              <div
                v-if="demonstrationData.wx_public_url"
                class="text-[#7C5CFC] text-xs cursor-pointer leading-6"
                @click="onFillWXPublic"
              >
                {{ t('填充示例公众号') }}
              </div>
            </el-form-item>
            <el-form-item prop="content_html" class="text-black" :label="$t('回答来源')">
              <el-select
                class="w-full"
                v-model="spliderPublicForm.content"
                placeholder="请选择公众号"
              >
                <el-option
                  v-for="item in publicContentList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                  :disabled="item.isNeedVip && !needUpgrade"
                  >{{ item.label }}
                  <span v-if="item.isNeedVip && !needUpgrade" class="inline-flex items-center ml-1">
                    (<el-button
                      link
                      type="primary"
                      class="-mr-[2px]"
                      @click="checkRightsTypeNeedUpgrade(ESpaceRightsType.default)"
                    >
                      {{ $t('升级') }}
                    </el-button>
                    {{ $t('后可使用') }})
                  </span></el-option
                >
              </el-select>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <span class="dialog-footer" v-if="inputTextForm.status !== 'preview'">
          <template v-if="showSubmit">
            <el-button @click="() => emit('closeDialogVisble', false)">{{ $t('取消') }}</el-button>
            <el-button
              type="primary"
              :disabled="modalSubmitDisabled"
              :loading="modalSubmitLoading"
              data-script="Chato-doc-submit"
              @click="submitInputText()"
            >
              {{ $t('确认') }}
            </el-button>
          </template>
        </span>
      </template>
    </el-dialog>
  </div>
  <Modal
    v-model:visible="publicDialogVisible"
    title="确认抓取"
    @submit="onSubmit"
    :footerAttrs="{
      submitText: '确认'
    }"
  >
    <div>
      {{ t('全部文章共') }}<span class="text-[#7C5CFC]">{{ spliderPublicForm.maxContent }}</span
      >{{ t('篇，预计需要') }}
      <span class="text-[#7C5CFC]">{{ Math.floor(spliderPublicForm.maxContent / 200) }}</span>
      {{ t('小时，是否确认抓取？') }}
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { getDemonstration } from '@/api/domain'
import * as apiFile from '@/api/file'
import HansInputLimit from '@/components/Input/HansInputLimit.vue'
import Modal from '@/components/Modal/index.vue'
import { useBasicLayout } from '@/composables/useBasicLayout'
import useGlobalProperties from '@/composables/useGlobalProperties'
import useSpaceRights from '@/composables/useSpaceRights'
import { UPLOAD_FILE_TYPES, UPLOAD_FILE_VIDEO_AUDIO_TYPES } from '@/constant/common'
import { PaidCommercialTypes } from '@/constant/space'
import { EDocumentTabType } from '@/enum/knowledge'
import { ESpaceRightsType } from '@/enum/space'
import type { IDemonstration } from '@/interface/domain'
import type { IDocumentForm, IWXPublic } from '@/interface/knowledge'
import { useAuthStore } from '@/stores/auth'
import { getFileByUrl } from '@/utils/cos'
import { $notnull } from '@/utils/help'
import { getStringWidth } from '@/utils/string'
import { useDebounceFn } from '@vueuse/core'
import dayjs from 'dayjs'
import type {
  ElSelect,
  FormInstance,
  FormRules,
  UploadFile,
  UploadFiles,
  UploadRawFile,
  UploadUserFile
} from 'element-plus'
import { ElLoading, ElMessage, ElNotification as Notification } from 'element-plus'
import { storeToRefs } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Props {
  apiUpload: string
  domainId: string | number
  domainName?: string
  dialogVisible: boolean
  defaultForm: IDocumentForm
  sizeLimit?: number
  qtyLimit?: number
  mediaLimit?: number
}

type uploadingListType = UploadRawFile & { startTime: string }

const props = withDefaults(defineProps<Props>(), {
  sizeLimit: 30,
  qtyLimit: 20,
  mediaLimit: 25
})
const demonstrationData = reactive<Partial<IDemonstration>>({})
const { isAllowedCommercialType, checkRightsTypeNeedUpgrade } = useSpaceRights()
const needUpgrade = isAllowedCommercialType(PaidCommercialTypes)
const publicDialogVisible = ref(false)
const emit = defineEmits(['closeDialogVisble', 'setSuccess', 'updateListEvent', 'reloadList'])
const acceptFileTypes = UPLOAD_FILE_TYPES.join(',')
const { isMobile } = useBasicLayout()
const visible = ref<boolean>(false)
const spliderPublicFormName = ref<typeof ElSelect>()
const showSubmit = ref<boolean>(false)
const uploadFileList = ref<UploadUserFile[]>([])
const activeName = ref<EDocumentTabType>(EDocumentTabType.uploadDoc)
const ruleFormRef = ref<FormInstance>()
const spliderUrl = ref()
const spliderPublic = ref()
const authStoreI = useAuthStore()
const { authToken } = storeToRefs(authStoreI)
const WXPublicList = ref<IWXPublic[]>([])
const uploadingList = ref<uploadingListType[]>([])
const publicContentList = [
  {
    label: '最近十条',
    value: 10
  },
  {
    label: '最近二十条',
    value: 20
  },
  {
    label: '最近五十条',
    value: 50
  },
  {
    label: '最近一百条',
    value: 100
  },
  {
    label: '全部',
    value: -1,
    isNeedVip: true
  }
]
const headers = {
  Authorization: 'Bearer ' + authToken.value
}

const formEl_Ref = {
  'input-text': ruleFormRef,
  'input-url': spliderUrl,
  'input-public': spliderPublic
}

// 网页
const spliderUrlForm = reactive({
  urlData: ''
})
// 公众号
const spliderPublicForm = reactive({
  publicName: '',
  content: 10,
  maxContent: 0
})
// 文本
const inputTextForm = reactive({
  id: 0,
  title: '',
  content_html: '',
  status: 'create'
})
const limit = reactive({
  text_prompt: 100000
})

const rulesUrl = reactive({
  urlData: [
    { required: true, message: t('请输入网页地址'), trigger: 'blur' }
    // { validator: validatorUrl, trigger: 'blur' }
  ]
})

const rulesPublic = reactive({
  publicData: [{ required: true, message: t('请输入公众号名字'), trigger: 'blur' }]
})

const rules = reactive<FormRules>({
  title: [
    { required: true, message: t('请输入文本标题'), trigger: 'blur' },
    { min: 2, message: t('文本标题最短不少于4个字符'), trigger: 'blur' }
  ],
  content_html: [
    { required: true, message: t('请输入文本内容'), trigger: 'blur' },
    {
      min: 2,
      message: t('文本内容最短不少于4个字符'),
      trigger: 'blur'
    }
  ]
})

const demonstrationNameList = [
  '售后客服',
  '培训专家',
  '售前顾问',
  '营销获客',
  '数字分身',
  '内部知识库',
  '私域运营',
  '学习助手',
  '文案创作'
]

const $textExceedLimit = computed(() => {
  return getStringWidth(inputTextForm.content_html + inputTextForm.title || '') > limit.text_prompt
})
const domainName = computed(() => props.domainName || '')

const demonstrationFile = async () => {
  demonstrationSensors()
  const loading = ElLoading.service({
    lock: true,
    text: t('保存中'),
    background: 'rgba(0, 0, 0, 0.7)'
  })
  try {
    const file = await getFileByUrl(demonstrationData.file_url)
    const body = new FormData()
    body.append('file', file)
    fetch(props.apiUpload, {
      method: 'POST',
      headers,
      body
    })
      .then((value) => value.json())
      .then(() => {
        loading.close()
        emit('reloadList')
        emit('setSuccess')
      })
  } catch (error) {
    loading.close()
  }
}

const modalSubmitDisabled = computed(() => {
  if (activeName.value === 'input-public' && !spliderPublicForm.publicName) {
    return true
  } else {
    return false
  }
})

const modalSubmitLoading = ref(false)
const spliderWxPublicEl = ref()
const onFillWXPublic = async () => {
  try {
    demonstrationSensors()
    const fillExampleName = `百姓课堂-${domainName.value}`
    await getWXPublicListByPublicName(fillExampleName)
    spliderWxPublicEl.value.focus()
    spliderPublicForm.publicName = fillExampleName
  } catch (e) {
    spliderPublicForm.publicName = ''
  }
}

const onDemonstration = (cd: Function) => {
  demonstrationSensors()
  cd()
}

const demonstrationSensors = () => {
  $sensors?.track('demonstration_sensors', {
    name: t('使用示例填充'),
    type: 'demonstration_sensors',
    data: {
      time: dayjs().format('YYYY-MM-DD HH:mm:ss')
    }
  })
}

const onSubmit = () => {
  spliderPublicForm.content = spliderPublicForm.maxContent
  publicDialogVisible.value = false
  submitInputText()
}

async function submitInputText() {
  if (activeName.value === EDocumentTabType.inputPublic && spliderPublicForm.content === -1) {
    spliderPublicForm.maxContent = await getPublicContent()
    publicDialogVisible.value = true
    return
  }

  const formEl = formEl_Ref[activeName.value].value
  if (!formEl) return
  if ($textExceedLimit.value)
    return ElMessage.warning(
      t('文本内容不能超过 {limitText} 字符！', { limitText: limit.text_prompt })
    )
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      const loading = ElLoading.service({
        lock: true,
        text: t('保存中'),
        background: 'rgba(0, 0, 0, 0.7)'
      })
      let requestFunc = ''
      let requestParams = null
      let requestParamsPath = null
      switch (activeName.value) {
        case 'input-text':
          requestFunc = 'uploadText'
          requestParams = inputTextForm
          break
        case 'input-url':
          requestFunc = 'uploadURL'
          requestParams = spliderUrlForm.urlData.split(',').map((item) => item.trim())
          break
        default:
          requestFunc = 'uploadPublicAsync'
          requestParams = [spliderPublicForm.publicName]
          requestParamsPath = {
            count:
              spliderPublicForm.content === -1
                ? await getPublicContent()
                : spliderPublicForm.content
          }
          break
      }
      apiFile[requestFunc](props.domainId, requestParams, requestParamsPath)
        .then((res) => {
          const { data } = res.data
          if (requestFunc === 'uploadPublicAsync') {
            Notification.success(
              t(`已爬`) +
                data.result.length +
                t(`条；重复`) +
                data.repeated.length +
                t(`条；剩余`) +
                (spliderPublicForm.content - data.result.length - data.repeated.length) +
                t(`条`)
            )
          } else {
            Notification.success(t('保存成功'))
          }
          spliderUrlForm.urlData = ''
          spliderPublicForm.publicName = ''
          spliderPublicForm.content = 10
          emit('setSuccess')
        })
        .catch((err) => {})
        .finally(() => {
          loading.close()
          spliderPublicForm.publicName = ''
          spliderPublicForm.content = 10
          emit('closeDialogVisble')
        })
    } else {
      console.log('error submit!', fields)
    }
  })
}

const getPublicContent = async () => {
  try {
    modalSubmitLoading.value = true
    const res = await apiFile.getWXPublicCount({ name: spliderPublicForm.publicName })
    return Number(res.data.data)
  } finally {
    modalSubmitLoading.value = false
  }
}

const wxPublicListLoading = ref(false)

const getWXPublicListByPublicName = useDebounceFn(async (name: string) => {
  if (!name || wxPublicListLoading.value) {
    WXPublicList.value = []
    return
  }

  try {
    wxPublicListLoading.value = true
    const res = await apiFile.getWXPublicList({ name })
    WXPublicList.value = res.data.data
  } catch (e) {
    throw new Error(e)
  } finally {
    wxPublicListLoading.value = false
  }
}, 1000)

function beforeUpload(rawFile: UploadRawFile) {
  const fileType = rawFile.name.substring(rawFile.name.lastIndexOf('.')).toLowerCase()
  const size = rawFile.size / 1024 / 1024
  if (!UPLOAD_FILE_TYPES.includes(fileType)) {
    Notification.error(t('不支持{fileType}格式', { fileType }))
    return false
  }
  uploadingList.value.push({
    ...rawFile,
    name: rawFile.name,
    size: rawFile.size,
    type: rawFile.type,
    startTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
  })

  if (UPLOAD_FILE_VIDEO_AUDIO_TYPES.includes(fileType) && size > props.mediaLimit) {
    Notification.error(
      t('文件 “{name}” 体积已超过 {mediaLimit}MB，暂时无法上传。', {
        name: rawFile.name,
        mediaLimit: props.mediaLimit
      })
    )
    return false
  }
  if (UPLOAD_FILE_TYPES.includes(fileType) && size > props.sizeLimit) {
    Notification.error(
      t('文件 “{name}” 体积已超过 {sizeLimit}MB，暂时无法上传。', {
        name: rawFile.name,
        sizeLimit: props.sizeLimit
      })
    )
    return false
  }
}

function onError(err) {
  const errMessage = err.message || ''
  const errName = err.name || ''
  if (errMessage.includes(t('该文件已上传'))) {
    Notification.error(t('您上传的文件已存在，无需重复上传。'))
  } else if (errName === 'UploadAjaxError' && errMessage.includes('fail to post')) {
    Notification.error(t('文件体积已超过限制，暂时无法上传。'))
  }
}

function handleChange(uploadFile: UploadFile, uploadFiles: UploadFiles) {
  const allSuccess = uploadFiles.every((u) => u.status === 'success')
  if (uploadFile.status === 'success') {
    pretreatmentTracker(uploadFile.uid)
    emit('reloadList')
  }
  if (allSuccess) {
    emit('setSuccess')
  }
}

const handleSuccess = (response: any, uploadFile: UploadFile) => {
  if (response.code === 200031) {
    return Notification.error(`「${response.data.filename}」已接收，请勿重复上传`)
  }
  if (response.code === 200017) {
    return Notification.error(`「${uploadFile.name}」${response.message}`)
  }
  if (response.code !== 200) {
    return Notification.error(response.message)
  }
  uploadFileList.value = uploadFileList.value.filter((item) => item.uid !== uploadFile.uid)
}

const { $sensors } = useGlobalProperties()
function pretreatmentTracker(uid: number) {
  for (let i = 0; i < uploadingList.value.length; i++) {
    const current = uploadingList.value[i]
    if (uid === current.uid) {
      $sensors?.track('upload_time', {
        name: t('文档上传时间'),
        type: 'upload_time',
        data: { ...current, endTime: dayjs().format('YYYY-MM-DD HH:mm:ss') }
      })
      uploadingList.value.splice(i, 1)
    }
  }
}

// 上传过程可能比较耗时，因此加上 Loading 改善体验
function onProgress(event) {
  if (event.percent === 100) {
    emit('updateListEvent')
  }
}

function onExceed() {
  Notification.warning(
    t('您选择的文件数量过多，每次最多可上传 {qtyLimit} 个文件。', { qtyLimit: props.qtyLimit })
  )
}

const getDemonstrationInit = async () => {
  const res = await getDemonstration(domainName.value)
  const { data } = res.data
  demonstrationData.file_url = data.file_url
  demonstrationData.text = data.text
  demonstrationData.web_url = data.web_url
  demonstrationData.wx_public_url = data.wx_public_url
}

async function resetInputTextForm() {
  inputTextForm.title = t('文本：') + dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss')
  inputTextForm.id = 0
  inputTextForm.content_html = ''
  inputTextForm.status = 'create'
  demonstrationData.file_url = undefined
  demonstrationData.text = undefined
  demonstrationData.web_url = undefined
  demonstrationData.wx_public_url = undefined
  if (demonstrationNameList.includes(domainName.value)) await getDemonstrationInit()
}

watch(
  props,
  async (v) => {
    console.log(v)
    visible.value = v.dialogVisible
    const defaultForm = v.defaultForm || {}
    if (v.dialogVisible) {
      await resetInputTextForm()
      if (ruleFormRef.value && v) ruleFormRef.value.resetFields()
    }
    // 预览和编辑模式
    if ($notnull(defaultForm)) {
      inputTextForm.title = defaultForm.title
      inputTextForm.id = defaultForm.id
      inputTextForm.content_html = defaultForm.content_html
      inputTextForm.status = defaultForm.status
      activeName.value = EDocumentTabType.inputText
    } else {
      resetInputTextForm()
    }
  },
  { immediate: true, deep: true }
)

watch(
  activeName,
  (v) => {
    showSubmit.value = v === 'upload-doc' ? false : true
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
:deep(.el-dialog__header) {
  margin-bottom: 0 !important;
  margin-right: 0 !important;
}

:deep(.dialog-box-container) {
  .my-header {
    cursor: pointer;
    color: #54595e !important;
    @apply flex items-center justify-between;

    :deep(.el-dialog__title) {
      color: #54595e !important;
    }
  }

  .el-dialog__body {
    padding: 5px 24px 0;
  }

  .el-upload-list {
    padding-bottom: 10px;
  }
}

.content_html_item {
  :deep(.el-form-item__error) {
    bottom: 0 !important;
    top: inherit !important;
  }
}

.upload-box {
  :deep(.el-upload-list__item) {
    margin-top: 30px !important;
  }
}

.description {
  @apply text-xs leading-5 mb-3;
}
</style>
