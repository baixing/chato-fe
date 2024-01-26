<template>
  <ContentLayout center-full class="bg-white overflow-hidden relative">
    <Topbar :title="$t('创建机器人')" :center="false" />
    <div
      class="bg-[#8466FA] rounded-lg w-full flex items-center justify-between gap-2 p-8 relative mb-6 overflow-hidden lg:p-4"
    >
      <div class="text-white text-sm relative z-[2] lg:text-xs">
        <p class="text-2xl font-medium mb-4 lg:text-xl">{{ $t('基于知识轻松定制机器人') }}</p>
        <p class="leading-5">
          {{
            $t(
              '只需上传学习素材，即可获得独特个性和超强能力的专属助理机器人，帮助您的企业释放难以想象的产出与价值。'
            )
          }}
        </p>
      </div>
      <img src="@/assets/img/create-bot-personal.png" class="w-24 object-contain" />
      <img
        src="@/assets/img/create-bot-circle-bg.png"
        class="absolute -top-[55%] -left-[10%] z-[1] w-4/5 max-w-[1000px] object-left-top object-cover lg:w-full lg:-top-4 lg:-left-1/2"
      />
    </div>
    <el-tabs v-model="activeTab" class="chato-tab-primary">
      <el-tab-pane :label="$t('公众号抓取')" :name="EDocumentTabType.inputPublic">
        <p class="desc">
          {{ $t('请确保网站内容可复制，请避免非法抓取他人网站的侵权行为') }}
        </p>
        <el-input v-model="formState.wxPublic" :placeholder="$t('请输入要爬取的公众号名称')" />
      </el-tab-pane>
      <el-tab-pane :label="$t('网页抓取')" :name="EDocumentTabType.inputUrl">
        <p class="desc">
          {{ $t('请避免非法抓取他人网站的侵权行为，保证链接可公开访问，且网站内容可复制') }}
        </p>
        <p class="desc">
          {{ $t('可抓取的网页仅为内容固定不变的静态网页，例如新闻文章、产品介绍等') }}
        </p>
        <el-input v-model="formState.webUrl" :placeholder="$t('输入要爬取的网页地址')" />
      </el-tab-pane>
      <el-tab-pane :label="$t('上传文件')" :name="EDocumentTabType.uploadDoc">
        <div class="desc space-y-1">
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
          v-model:file-list="uploadFileList"
          :action="apiUpload"
          :accept="acceptFileTypes"
          :before-upload="beforeUpload"
          :on-success="handleSuccess"
          :on-error="onError"
          :on-exceed="onExceed"
          :on-remove="onRemove"
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
      </el-tab-pane>
      <el-tab-pane :label="$t('输入文本')" :name="EDocumentTabType.inputText">
        <el-input
          type="text"
          v-model="formState.textTitle"
          :placeholder="$t('文本标题')"
          maxlength="30"
          autocomplete="off"
        />
        <HansInputLimit
          v-model:value="formState.textContent"
          type="textarea"
          :placeholder="$t('文本内容，请输入 100000 字符以内')"
          :rows="10"
          :limit="100000"
          class="w-full mt-4"
        />
      </el-tab-pane>
    </el-tabs>
    <div
      class="absolute bottom-0 left-0 right-0 border-t border-l-0 border-r-0 border-b-0 border-solid border-[#E4E7ED] px-16 lg:px-4 py-3 flex justify-end"
    >
      <el-button type="primary" :loading="saving" @click="onSave">
        {{ $t('去创建') }}
      </el-button>
    </div>
  </ContentLayout>
</template>

<script setup lang="ts">
import { updateDomain } from '@/api/domain'
import { deleteFile, uploadText, uploadURL } from '@/api/file'
import { postCommonGraph } from '@/api/graph'
import HansInputLimit from '@/components/Input/HansInputLimit.vue'
import Topbar from '@/components/Topbar/index.vue'
import { currentEnvConfig } from '@/config'
import { UPLOAD_FILE_TYPES, UPLOAD_FILE_VIDEO_AUDIO_TYPES } from '@/constant/common'
import { EDocumentTabType } from '@/enum/knowledge'
import type { IDomainInfo } from '@/interface/domain'
import ContentLayout from '@/layout/ContentLayout.vue'
import { RoutesMap } from '@/router'
import { useAuthStore } from '@/stores/auth'
import { useBase } from '@/stores/base'
import {
  ElNotification,
  dayjs,
  type UploadFile,
  type UploadRawFile,
  type UploadUserFile
} from 'element-plus'
import { cloneDeep } from 'lodash'
import { storeToRefs } from 'pinia'
import { computed, onMounted, reactive, ref, toRaw } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const sizeLimit = 30
const qtyLimit = 20
const mediaLimit = 25

const { t } = useI18n()
const router = useRouter()
const base = useBase()

const { userInfo } = storeToRefs(base)

const activeTab = ref<EDocumentTabType>(EDocumentTabType.inputPublic)
const initing = ref(true)
let formState = reactive<{
  id: number
  slug: string
  wxPublic: string
  webUrl: string
  textTitle: string
  textContent: string
}>({
  id: null,
  slug: '',
  wxPublic: '',
  webUrl: '',
  textTitle: t('文本：') + dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'),
  textContent: ''
})

const onNewDraft = async () => {
  try {
    initing.value = true
    const {
      data: { data }
    } = await postCommonGraph<IDomainInfo>('chato_domains/save', {
      creator_id: userInfo.value.id,
      updater_id: userInfo.value.id,
      org: userInfo.value.org.id,
      desc_show: 0,
      name: '',
      status: 2,
      avatar: 'https://afu-1255830993.cos.ap-shanghai.myqcloud.com/447479457016221696.png'
    })
    // createDraftDomain()

    const { id, slug } = data

    formState = Object.assign(formState, { id, slug })
  } catch (err) {
  } finally {
    initing.value = false
  }
}

onMounted(() => {
  onNewDraft()
})

// ----- 文件上传 -----
const acceptFileTypes = UPLOAD_FILE_TYPES.join(',')
const uploadFileList = ref<UploadUserFile[]>([])
const authStoreI = useAuthStore()
const { authToken } = storeToRefs(authStoreI)
const uploadingList = ref<UploadRawFile[]>([])
const headers = {
  Authorization: 'Bearer ' + authToken.value
}
const apiUpload = computed(
  () => `${currentEnvConfig.uploadBaseURL}/chato/api/domains/${formState.id}/files/upload/document`
)

const beforeUpload = (rawFile: UploadRawFile) => {
  const fileType = rawFile.name.substring(rawFile.name.lastIndexOf('.')).toLowerCase()
  const size = rawFile.size / 1024 / 1024
  if (!UPLOAD_FILE_TYPES.includes(fileType)) {
    ElNotification.error(t('不支持{fileType}格式', { fileType }))
    return false
  }
  uploadingList.value.push({
    ...rawFile,
    name: rawFile.name,
    size: rawFile.size,
    type: rawFile.type
  })

  if (UPLOAD_FILE_VIDEO_AUDIO_TYPES.includes(fileType) && size > mediaLimit) {
    ElNotification.error(
      t('文件 “{name}” 体积已超过 {mediaLimit}MB，暂时无法上传。', {
        name: rawFile.name,
        mediaLimit: mediaLimit
      })
    )
    return false
  }
  if (UPLOAD_FILE_TYPES.includes(fileType) && size > sizeLimit) {
    ElNotification.error(
      t('文件 “{name}” 体积已超过 {sizeLimit}MB，暂时无法上传。', {
        name: rawFile.name,
        sizeLimit: sizeLimit
      })
    )
    return false
  }
}

const onError = (err) => {
  const errMessage = err.message || ''
  const errName = err.name || ''
  if (errMessage.includes(t('该文件已上传'))) {
    ElNotification.error(t('您上传的文件已存在，无需重复上传。'))
  } else if (errName === 'UploadAjaxError' && errMessage.includes('fail to post')) {
    ElNotification.error(t('文件体积已超过限制，暂时无法上传。'))
  }
}

const onRemove = async (uploadFile: UploadFile) => {
  const fileId = (uploadFile.response as any)?.data?.id
  deleteFile(fileId)
}

const handleSuccess = (response: any, uploadFile: UploadFile) => {
  let errorMsg = ''

  if (response.code === 200031) {
    errorMsg = `「${response.data.filename}」已接收，请勿重复上传`
  } else if (response.code === 200017) {
    errorMsg = `「${uploadFile.name}」${response.message}`
  }

  if (errorMsg) {
    ElNotification.error(errorMsg)
    const newFileList = cloneDeep(toRaw(uploadFileList.value))
    const lastIndex = newFileList.findLastIndex((item) => item.name === response.data.filename)
    lastIndex > -1 && newFileList.splice(lastIndex, 1)
    uploadFileList.value = newFileList
  }
}

const onExceed = () => {
  ElNotification.warning(
    t('您选择的文件数量过多，每次最多可上传 {qtyLimit} 个文件。', { qtyLimit })
  )
}

const saving = ref(false)
// const canSave = computed(() =>
//   Boolean(
//     formState.webUrl ||
//       formState.wxPublic ||
//       formState.textContent ||
//       uploadFileList.value.length > 0
//   )
// )

const onSave = async () => {
  try {
    saving.value = true
    let finalCreateDomainName = ''
    switch (activeTab.value) {
      case EDocumentTabType.inputPublic:
        finalCreateDomainName = formState.wxPublic
        break
      case EDocumentTabType.uploadDoc:
        finalCreateDomainName = (uploadFileList.value?.[0].name || '').split('.')[0]
        break
    }

    if (formState.textContent) {
      const saveTextParams = {
        title: formState.textTitle,
        content_html: formState.textContent,
        id: 0,
        status: 'create'
      }
      await uploadText(formState.id, saveTextParams)
    }
    if (formState.webUrl) {
      const {
        data: { data: urlRes }
      } = await uploadURL(formState.id, [formState.webUrl])
      urlRes.length && (finalCreateDomainName = urlRes[0].title)
    }
    if (formState.wxPublic) {
      // TODO:接口更新
      // uploadPublicAsync(formState.id, [formState.wxPublic])
    }

    // 输入文本或异常结果状态的兜底机器人名字
    !finalCreateDomainName && (finalCreateDomainName = t('AI智能助手'))
    const domainParams: Partial<IDomainInfo> = {
      id: formState.id,
      name: finalCreateDomainName
    }
    await updateDomain(formState.id, domainParams)
    await router.push({
      name: RoutesMap.manager.create,
      params: { botId: formState.id, opt: 'needAI' }
    })
  } catch (e) {
    ElNotification.error(t('解析异常'))
  } finally {
    saving.value = false
  }
}
</script>

<style lang="scss" scoped>
.desc {
  @apply text-xs text-[#9DA3AF] leading-4 mb-2;
}
</style>
