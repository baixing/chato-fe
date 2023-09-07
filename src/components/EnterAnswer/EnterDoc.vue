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
      <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
        <el-tab-pane :label="$t('上传文档')" name="upload-doc">
          <div class="upload-box">
            <p class="description">
              {{
                $t(
                  '格式支持 .pdf .docx .mobi .xlsx .txt .pptx .epub .md .csv，请确保内容可复制，每个{sizeLimit}MB以内，单次最多上传{qtyLimit}个。',
                  { sizeLimit, qtyLimit }
                )
              }}
              <br />
              {{ $t('文档中的表格和图片暂时无法学习。') }}
            </p>
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
          </el-form>
        </el-tab-pane>
        <el-tab-pane :label="$t('网页抓取')" name="input-url">
          <p class="description">
            {{ $t('请避免非法抓取他人网站的侵权行为，保证链接可公开访问，且网站内容可复制') }}
          </p>
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
              ></el-input>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane
          :label="publicTabTile"
          v-if="base.userInfo.role === USER_ROLES.SUPERMAN"
          name="input-public"
        >
          <el-form
            ref="spliderPublic"
            size="large"
            :disabled="inputTextForm.status === 'preview'"
            :rules="rulesPublic"
            :model="spliderPubliceForm"
            class="input-text-form special-text-form"
          >
            <el-form-item prop="publicData">
              <el-input
                type="textarea"
                :rows="10"
                v-model="spliderPubliceForm.publicData"
                :placeholder="$t('请输入要爬取的公众号名称，用英文,分隔')"
              ></el-input>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <span class="dialog-footer" v-if="inputTextForm.status !== 'preview'">
          <template v-if="showSubmit">
            <el-button @click="() => emit('closeDialogVisble', false)">{{ $t('取消') }}</el-button>
            <el-button type="primary" data-script="Chato-doc-submit" @click="submitInputText()">
              {{ $t('确认') }}
            </el-button>
          </template>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import * as apiFile from '@/api/file'
import HansInputLimit from '@/components/Input/HansInputLimit.vue'
import { useBasicLayout } from '@/composables/useBasicLayout'
import useGlobalProperties from '@/composables/useGlobalProperties'
import { UPLOAD_FILE_TYPES, USER_ROLES } from '@/constant/common'
import { EDocumentTabType } from '@/enum/knowledge'
import type { IDocumentForm } from '@/interface/knowledge'
import { useAuthStore } from '@/stores/auth'
import { useBase } from '@/stores/base'
import { $notnull } from '@/utils/help'
import { getStringWidth } from '@/utils/string'
import dayjs from 'dayjs'
import type { FormInstance, FormRules, UploadFile, UploadFiles, UploadRawFile } from 'element-plus'
import { ElLoading, ElMessage, ElMessageBox, ElNotification as Notification } from 'element-plus'
import { storeToRefs } from 'pinia'
import { computed, onUnmounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const base = useBase()

interface Props {
  apiUpload: string
  sizeLimit: number
  qtyLimit: number
  domainId: string
  dialogVisible: boolean
  defaultForm: IDocumentForm
  specailTipVisible?: number
}

type uploadingListType = UploadRawFile & { startTime: string }

const props = defineProps<Props>()
const emit = defineEmits([
  'closeDialogVisble',
  'setSuccess',
  'updateListEvent',
  'reloadList',
  'updateSpecailTipVisible'
])
const acceptFileTypes = UPLOAD_FILE_TYPES.join(',')
const { isMobile } = useBasicLayout()
const visible = ref<boolean>(false)
const showSubmit = ref<boolean>(false)
const uploadFileList = ref([])
const activeName = ref<EDocumentTabType>(EDocumentTabType.uploadDoc)
const ruleFormRef = ref<FormInstance>()
const spliderUrl = ref()
const spliderPublic = ref()
const authStoreI = useAuthStore()
const { authToken } = storeToRefs(authStoreI)
const uploadingList = ref<uploadingListType[]>([])
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
const spliderPubliceForm = reactive({
  publicData: ''
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
const $textExceedLimit = computed(() => {
  return getStringWidth(inputTextForm.content_html + inputTextForm.title || '') > limit.text_prompt
})

const publicTabTile = computed(() => {
  return base.userInfo.role === USER_ROLES.SUPERMAN ? t('公众号抓取(仅超人可见)') : t('公众号抓取')
})

const handleClick = (tab) => {
  console.log(tab, activeName.value)
}

async function submitInputText() {
  const formEl = formEl_Ref[activeName.value].value
  if (!formEl) return
  if ($textExceedLimit.value)
    return ElMessage.warning(
      t('文本内容不能超过 {limitText} 字符！', { limitText: limit.text_prompt })
    )
  await formEl.validate((valid, fields) => {
    if (valid) {
      const loading = ElLoading.service({
        lock: true,
        text: t('保存中'),
        background: 'rgba(0, 0, 0, 0.7)'
      })
      let requestFunc = ''
      let requestParams = null
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
          requestFunc = 'uploadPublic'
          requestParams = spliderPubliceForm.publicData.split(',').map((item) => item.trim())
          break
      }
      apiFile[requestFunc](props.domainId, requestParams)
        .then((res) => {
          if (res.data.code === 200) {
            Notification.success(t('保存成功'))
            spliderUrlForm.urlData = ''
            spliderPubliceForm.publicData = ''
            emit('setSuccess')
          } else {
            Notification.error(res.data.msg)
          }
        })
        .catch((err) => {})
        .finally(() => {
          loading.close()
          emit('closeDialogVisble')
          showFirstUp()
        })
    } else {
      console.log('error submit!', fields)
    }
  })
}
function beforeUpload(rawFile: UploadRawFile) {
  const fileType = rawFile.name.substring(rawFile.name.lastIndexOf('.')).toLowerCase()
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
  if (rawFile.size / 1024 / 1024 > props.sizeLimit) {
    Notification.error(
      t('文件 “{fileName}” 体积已超过 {sizeLimit}MB，暂时无法上传。', {
        fileName: rawFile.name,
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
    showFirstUp()
    emit('setSuccess')
  }
}

const handleSuccess = (response: any, uploadFile: UploadFile) => {
  if (response.code === 200031) {
    return Notification.error(`「${response.data.filename}」已接收，请勿重复上传`)
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

function showFirstUp() {
  if (!props.specailTipVisible) {
    ElMessageBox.confirm(
      t(
        '训练素材的学习时长各异，正常情况下 5-10 分钟后生效。 如果上传文件过多或过大，可能超出预期时长，请耐心等待。 切换或关闭该页面不影响 AI 学习素材，可稍后再来查看进度。'
      ),
      t('温馨提示'),
      {
        confirmButtonText: t('我已知晓'),
        dangerouslyUseHTMLString: true,
        showCancelButton: false,
        type: 'warning',
        customClass: '!max-w-[470px]'
      }
    )
      .then(() => {})
      .catch(() => {})
      .finally(() => emit('updateSpecailTipVisible'))
  }
}

function resetInputTextForm() {
  inputTextForm.title = t('文本：') + dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss')
  inputTextForm.id = 0
  inputTextForm.content_html = ''
  inputTextForm.status = 'create'
}

const watchProps = watch(
  props,
  (v) => {
    visible.value = v.dialogVisible
    const defaultForm = v.defaultForm || {}
    if (v.dialogVisible) {
      resetInputTextForm()
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
const watchActiveName = watch(
  activeName,
  (v) => {
    showSubmit.value = v === 'upload-doc' ? false : true
  },
  { immediate: true }
)

onUnmounted(() => {
  watchProps()
  watchActiveName()
})
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
    padding: 5px 24px 0px;
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
  font-size: 12px;
  margin-bottom: 16px;
}
</style>
