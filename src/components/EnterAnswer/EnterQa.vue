<template>
  <div>
    <el-dialog
      v-model="visible"
      :title="$t('录入问答')"
      :width="isMobile ? '85%' : '40%'"
      class="dialog-box-container"
      :before-close="() => emit('closeDialogVisble', false)"
      :show-close="false"
      append-to-body
    >
      <template #header="{ close, titleId, titleClass }">
        <div class="flex justify-between">
          <h4 :id="titleId" :class="titleClass">{{ $t('录入问答') }}</h4>
          <el-icon class="el-icon--left" @click="close" :size="22">
            <Close />
          </el-icon>
        </div>
      </template>
      <el-tabs v-model="activeName">
        <el-tab-pane :label="t('输入问答')" name="input-text">
          <el-form
            ref="ruleFormRef"
            size="large"
            :disabled="inputTextForm.status === 'preview'"
            :rules="rules"
            :model="inputTextForm"
            class="input-text-form special-text-form"
          >
            <el-form-item prop="title">
              <HansInputLimit
                v-model:value="inputTextForm.title"
                type="text"
                :placeholder="t('输入问题，请输入 300 以内的字符。')"
                :limit="limit.titlePrompt"
                :specifyInputStrLen="getStringWidth(inputTextForm.title || '')"
                class="w-full mb-4"
              />
            </el-form-item>
            <el-form-item prop="content_html" class="content_html_item">
              <HansInputLimit
                v-model:value="inputTextForm.content_html"
                type="textarea"
                :placeholder="t('输入答案，请输入 3000 以内的字符。')"
                :rows="isMobile ? 5 : 10"
                :limit="limit.contentHtmlPrompt"
                :specifyInputStrLen="getStringWidth(inputTextForm.content_html || '')"
                class="w-full mb-4"
              />
            </el-form-item>
            <el-form-item prop="img" class="mt-[6px]">
              <ImgUpload
                v-model:imgUrl="inputTextForm.images"
                listType="picture-card"
                :fixed="false"
                :isInitialImg="true"
                accept="image/png, image/jpeg"
                :disabled="inputTextForm.status === 'preview'"
              />
              <span class="text-[#999999] text-xs ml-1">{{ $t('（最多上传 9 张）') }}</span>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane v-if="!hiddenBatch" :label="$t('批量上传')" name="upload-doc">
          <div class="upload-box">
            <p class="description">
              <a
                href="https://afu-1255830993.cos.ap-shanghai.myqcloud.com/chato/CHATO_QA_%E6%A8%A1%E6%9D%BF.xlsx"
                download="https://afu-1255830993.cos.ap-shanghai.myqcloud.com/chato/CHATO_QA_%E6%A8%A1%E6%9D%BF.xlsx"
                >{{ $t('点击此处下载模板') }}</a
              >
              {{ $t('完成填写后再上传，问题总数不超过条10000条') }}
            </p>
            <el-upload
              class="upload-ctrl"
              v-model:file-list="uploadFileList"
              :action="apiUpload"
              :accept="acceptFileTypes"
              :before-upload="beforeUpload"
              :on-success="onSuccess"
              :on-change="handleChangeUploadFile"
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
      </el-tabs>
      <template #footer>
        <span class="dialog-footer" v-if="inputTextForm.status !== 'preview'">
          <template v-if="showSubmit">
            <el-button @click="() => emit('closeDialogVisble', false)">{{ $t('取消') }}</el-button>
            <el-button
              type="primary"
              data-script="Chato-qa-submit"
              @click="submitInputText(ruleFormRef)"
            >
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
import ImgUpload from '@/components/ImgUpload/ImgUpload.vue'
import HansInputLimit from '@/components/Input/HansInputLimit.vue'
import { useBasicLayout } from '@/composables/useBasicLayout'
import { UPLOAD_TEMPLATE_FILE_TYPES } from '@/constant/common'
import { EDocumentTabType } from '@/enum/knowledge'
import type { IQAForm } from '@/interface/konwledgeQa'
import { useAuthStore } from '@/stores/auth'
import { useDomainStore } from '@/stores/domain'
import { $notnull } from '@/utils/help'
import { getStringWidth } from '@/utils/string'
import type { FormInstance, FormRules, UploadFile, UploadFiles, UploadRawFile } from 'element-plus'
import { ElLoading, ElMessage, ElNotification as Notification } from 'element-plus'
import { storeToRefs } from 'pinia'
import { computed, onUnmounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

const { t } = useI18n()
interface Props {
  dialogVisible: boolean
  apiUpload?: string
  sizeLimit?: number
  qtyLimit?: number
  activeNames: EDocumentTabType.uploadDoc | EDocumentTabType.inputText
  defaultForm?: IQAForm
  hiddenBatch?: boolean
  domainSlug?: string
}

const props = defineProps<Props>()
const route = useRoute()
const emit = defineEmits(['closeDialogVisble', 'setSuccess', 'reloadList'])
const { isMobile } = useBasicLayout()
const domainStoreI = useDomainStore()
const { domainInfo } = storeToRefs(domainStoreI)
const currentDomainSlug = computed(
  () => props?.domainSlug || route.params?.botSlug || domainInfo.value?.slug
)
const acceptFileTypes = UPLOAD_TEMPLATE_FILE_TYPES.join(',')
const visible = ref<boolean>(false)
const showSubmit = ref<boolean>(false)
const uploadFileList = ref([])
const activeName = ref<EDocumentTabType.inputText | EDocumentTabType.uploadDoc>(
  EDocumentTabType.inputText
)
const ruleFormRef = ref<FormInstance>()
const authStoreI = useAuthStore()
const { authToken } = storeToRefs(authStoreI)
const headers = {
  Authorization: 'Bearer ' + authToken.value
}

const inputTextForm = reactive({
  id: 0,
  question_id: 0,
  title: '',
  content_html: '',
  images: [],
  status: 'create'
})

const limit = reactive({
  titlePrompt: 300,
  contentHtmlPrompt: 3000
})
const rules = reactive<FormRules>({
  title: [
    { required: true, message: t('请输入问题'), trigger: 'blur' },
    { min: 2, message: t('问题最短不少于4个字符'), trigger: 'blur' }
  ],
  content_html: [
    { required: true, message: t('请输入答案'), trigger: 'blur' },
    {
      min: 2,
      message: t('答案内容最短不少于4个字符'),
      trigger: 'blur'
    }
  ]
})
const $textExceedTitleLimit = computed(() => {
  return getStringWidth(inputTextForm.title || '') > limit.titlePrompt
})

const $textExceedContentLimit = computed(() => {
  return getStringWidth(inputTextForm.content_html || '') > limit.contentHtmlPrompt
})

async function submitInputText(formEl: FormInstance) {
  if (!formEl) return
  if ($textExceedTitleLimit.value)
    return ElMessage.warning(t('问题长度不能超过{length}字符！', { length: limit.titlePrompt }))
  if ($textExceedContentLimit.value)
    return ElMessage.warning(
      t('答案长度不能超过{length}字符！', { length: limit.contentHtmlPrompt })
    )
  await formEl.validate((valid, fields) => {
    if (valid) {
      const loading = ElLoading.service({
        lock: true,
        text: t('保存中'),
        background: 'rgba(0, 0, 0, 0.7)'
      })
      apiFile
        .uploadQa(currentDomainSlug.value, { ...inputTextForm, ticket: route.query.ticket })
        .then(() => {
          Notification.success(t('保存成功'))
          inputTextForm.content_html = ''
          inputTextForm.title = ''
          inputTextForm.images = []
          emit('setSuccess')
          emit('closeDialogVisble')
        })
        .catch(() => {})
        .finally(() => {
          loading.close()
        })
    } else {
      console.log('error submit!', fields)
    }
  })
}

function beforeUpload(rawFile: UploadRawFile) {
  const fileType = rawFile.name.substring(rawFile.name.lastIndexOf('.')).toLowerCase()
  if (!UPLOAD_TEMPLATE_FILE_TYPES.includes(fileType)) {
    Notification.error(t('不支持{fileType}格式', { fileType }))
    return false
  }
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

const handleChangeUploadFile = (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  const allSuccess = uploadFiles.every((u) => u.status === 'success')
  if (uploadFile.status === 'success') {
    emit('reloadList')
  }
  if (allSuccess) {
    emit('setSuccess')
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

function onSuccess(response: any, uploadFile: UploadFile) {
  if (response.code === 200031) {
    return Notification.error(`「${response.data.filename}」已接收，请勿重复上传`)
  }
  if (response.code === 200017) {
    return Notification.error(`「${uploadFile.name}」${response.message}`)
  }
  uploadFileList.value = uploadFileList.value.filter((item) => item.uid !== uploadFile.uid)
}

function onExceed() {
  Notification.warning(
    t('您选择的文件数量过多，每次最多可上传 {qtyLimit} 个文件。', {
      qtyLimit: props.qtyLimit
    })
  )
}

function resetInputTextForm() {
  inputTextForm.question_id = 0
  inputTextForm.content_html = ''
  inputTextForm.title = ''
  inputTextForm.images = []
  inputTextForm.status = 'create'
}

const watchProps = watch(
  props,
  (v: Props) => {
    visible.value = v.dialogVisible
    const obj = v.defaultForm ? { ...v.defaultForm } : {}
    if (v.dialogVisible) {
      resetInputTextForm()
      if (ruleFormRef.value && v) ruleFormRef.value.resetFields()
    }
    if (v.activeNames) {
      activeName.value = v.activeNames
    }
    if ($notnull(obj)) {
      let list = []
      inputTextForm.question_id = obj.question_id || 0
      inputTextForm.content_html = obj.content
      inputTextForm.title = obj.title
      inputTextForm.status = obj.modalType || 'create'
      if ($notnull(obj.images)) {
        list = obj.images
      } else if ($notnull(obj.image)) {
        list = [obj.image]
      }
      inputTextForm.images = list
      if (!obj.question_id) {
        inputTextForm.id = obj.id
        delete inputTextForm.question_id
      }
    } else {
      resetInputTextForm()
    }
  },
  { immediate: true, deep: true }
)

const watchActiveName = watch(
  activeName,
  (v) => {
    showSubmit.value = v === EDocumentTabType.uploadDoc ? false : true
  },
  { immediate: true }
)

onUnmounted(() => {
  watchProps()
  watchActiveName()
})
</script>

<style lang="scss" scoped>
.content_html_item {
  margin-bottom: 0;
  :deep(.el-form-item__error) {
    bottom: 0 !important;
    top: inherit !important;
  }
}

.upload-box {
  :deep(.el-upload-list__item) {
    margin-top: 30px !important;
  }
  .description {
    font-size: 12px;
    margin-bottom: 16px;
    a {
      color: #7c5cfc;
    }
  }
}
</style>
