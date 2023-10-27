<template>
  <div class="chato-form">
    <div class="w-96 h-96">
      <ImgUpload class="w-96 h-96" />
    </div>
    <div class="chato-form-item flex gap-4 items-center w-full">
      <HansInputLimit
        v-model:value="currentDomain.name"
        type="text"
        :limit="currentDomainHansLimit.name"
        :disabled="
          AIGenerateInputDisabled.system_prompt &&
          AIGenerateInputDisabled.desc &&
          AIGenerateInputDisabled.welcome
        "
        class="flex-1"
      />
    </div>
    <div class="chato-form-item">
      <div class="chato-form-label flex items-center justify-between">
        <SLTitle>{{ $t('角色设定') }}</SLTitle>
        <AIGenerateBtn
          v-model:generateStr="currentDomain.system_prompt"
          :role="currentDomain.name"
          :system-prompt="currentDomain.system_prompt"
          :type="EDomainAIGenerateType.role"
          :disabled="!currentDomain.name || AIGenerateInputDisabled.system_prompt"
          disabled-tip="请填写名字后生成"
          @start="AIGenerateInputDisabled.system_prompt = true"
          @end="AIGenerateInputDisabled.system_prompt = false"
        />
      </div>
      <HansInputLimit
        v-model:value="currentDomain.system_prompt"
        type="textarea"
        :rows="10"
        size="large"
        :limit="currentDomainHansLimit.system_prompt"
        :disabled="AIGenerateInputDisabled.system_prompt"
        class="w-full"
      />
    </div>
    <div class="chato-form-item">
      <SLTitle class="chato-form-label">{{ $t('知识') }}</SLTitle>
      <div class="w-full">
        <div class="flex gap-4 mb-3">
          <el-button plain @click="DOCModalVisible = true">
            <template #icon><svg-icon name="document" svg-class="w-4 h-4" /></template>
            {{ $t('录入文档') }}
          </el-button>
          <el-button plain @click="onOpenQAModal">
            <template #icon><svg-icon name="qa" svg-class="w-4 h-4" /></template>
            {{ $t('录入问答') }}
          </el-button>
        </div>
        <div v-loading="uploadFilesListLoading" class="max-h-[240px] overflow-y-auto space-y-3">
          <p
            v-for="item in uploadFilesList"
            :key="item.id"
            class="flex text-[#606266] text-sm items-center gap-2"
          >
            <svg-icon name="document" svg-class="w-4 h-4" />
            <span
              class="flex-1 truncate transition-colors cursor-pointer hover:text-[#7C5CFC]"
              @click="onPreviewFile(item)"
            >
              {{ item.title }}
            </span>
            <span class="text-[#7C5CFC]">{{ $t(getFileStatusName(item.status)) }}</span>
            <el-button link :icon="Close" @click="onDeleteFile(item.id)" />
          </p>
        </div>
      </div>
    </div>
    <div class="chato-form-item">
      <div class="chato-form-label flex items-center justify-between">
        <SLTitle tips="基于机器人当前名字和角色设定生成">{{ $t('角色简介') }}</SLTitle>
        <AIGenerateBtn
          v-model:generateStr="currentDomain.desc"
          :role="currentDomain.name"
          :system-prompt="currentDomain.system_prompt"
          :type="EDomainAIGenerateType.intro"
          :disabled="
            !currentDomain.system_prompt || !currentDomain.name || AIGenerateInputDisabled.desc
          "
          disabled-tip="请填写名字和角色设定后生成"
          @start="AIGenerateInputDisabled.desc = true"
          @end="AIGenerateInputDisabled.desc = false"
        />
      </div>
      <HansInputLimit
        v-model:value="currentDomain.desc"
        type="textarea"
        :rows="6"
        size="large"
        :limit="currentDomainHansLimit.desc"
        :disabled="AIGenerateInputDisabled.desc"
        class="w-full"
      />
    </div>
    <div class="chato-form-item">
      <div class="chato-form-label flex items-center justify-between">
        <SLTitle tips="基于机器人当前名字和角色设定生成">{{ t('欢迎语') }}</SLTitle>
        <AIGenerateBtn
          v-model:generateStr="currentDomain.welcome"
          :role="currentDomain.name"
          :system-prompt="currentDomain.system_prompt"
          :type="EDomainAIGenerateType.welcome"
          :disabled="
            !currentDomain.system_prompt || !currentDomain.name || AIGenerateInputDisabled.welcome
          "
          disabled-tip="请填写名字和角色设定后生成"
          @start="AIGenerateInputDisabled.welcome = true"
          @end="AIGenerateInputDisabled.welcome = false"
        />
      </div>
      <HansInputLimit
        v-model:value="currentDomain.welcome"
        type="textarea"
        :rows="6"
        size="large"
        :limit="currentDomainHansLimit.welcome"
        :disabled="AIGenerateInputDisabled.welcome"
        class="w-full"
      />
      <p class="text-[#9DA3AF] text-xs mt-4">
        {{
          $t(
            '打开聊天窗口后会主动发送，添加双井号可添加提问示例，例如：#帮我写一则关于xxx的文案#，此类消息不消耗额度。'
          )
        }}
      </p>
    </div>
  </div>

  <EnterQa
    :active-names="EDocumentTabType.inputText"
    :default-form="QAFormState"
    :domain-slug="currentDomain.slug"
    :size-limit="30"
    :qty-limit="qtyLimit"
    :api-upload="apiUploadPath.qa"
    :dialog-visible="QAModalVisible"
    @close-dialog-visble="onCloseEnterModal"
  />
  <EnterDoc
    :domain-id="(currentDomain.id as unknown as string)"
    :defaultForm="DOCFormState"
    :sizeLimit="30"
    :qtyLimit="qtyLimit"
    :apiUpload="apiUploadPath.doc"
    :dialogVisible="DOCModalVisible"
    @setSuccess="onCloseEnterModal"
    @closeDialogVisble="onCloseEnterModal"
  />
</template>

<script setup lang="ts">
import { deleteFile, getFilesByDomainId } from '@/api/file'
import DefaultAvatar from '@/assets/img/avatar.png'
import AIGenerateBtn from '@/components/AIGenerateBtn/index.vue'
import EnterDoc from '@/components/EnterAnswer/EnterDoc.vue'
import EnterQa from '@/components/EnterAnswer/EnterQa.vue'
import ImgUpload from '@/components/NewImgUpload/ImgUpload.vue'
// import ImgUpload from '@/components/ImgUpload/index.vue'
import HansInputLimit from '@/components/Input/HansInputLimit.vue'
import SLTitle from '@/components/Title/SLTitle.vue'
import { currentEnvConfig } from '@/config'
import { USER_ROLES } from '@/constant/common'
import { DomainEditSymbol, DomainHansLimitSymbol } from '@/constant/domain'
import { KnowledgeLearningFinalStatus } from '@/constant/knowledge'
import { EDomainAIGenerateType } from '@/enum/domain'
import { EDocumentOperateType, EDocumentTabType } from '@/enum/knowledge'
import type { IDomainInfo } from '@/interface/domain'
import type { IDocumentForm, IDocumentList, IQAForm } from '@/interface/knowledge'
import { useBase } from '@/stores/base'
import { getFileStatusName } from '@/utils/formatter'
import { openPreviewUrl } from '@/utils/help'
import * as url from '@/utils/url'
import { Close } from '@element-plus/icons-vue'
import { ElMessageBox, ElNotification } from 'element-plus'
import { computed, inject, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
// import { imgBlob } from '@/constant/uploadImg'

const currentDomain = inject<Partial<IDomainInfo>>(DomainEditSymbol)
const currentDomainHansLimit = inject<Record<string, string>>(DomainHansLimitSymbol)

const defaultAIGenerateInputDisabled = {
  desc: false,
  system_prompt: false,
  welcome: false
}
let AIGenerateInputDisabled = reactive({ ...defaultAIGenerateInputDisabled })

const { t } = useI18n()
const baseStoreI = useBase()

// ---- 文档 & 问答 ----
const qtyLimit = baseStoreI.userInfo.role === USER_ROLES.SUPERMAN ? 1000 : 20 // 同时上传的文件数量限制
const apiUploadPath = computed(() => {
  const uri = `${currentEnvConfig.uploadBaseURL}/chato/api/domains/${currentDomain.id}/files/upload`
  return {
    qa: `${uri}/qa`,
    doc: `${uri}/document`
  }
})
const defaultQAFormState: IQAForm = {
  title: '',
  question_id: 0,
  content: '',
  images: [],
  modalType: EDocumentOperateType.create
}
const DOCFormState = ref<IDocumentForm>({})
let QAFormState = reactive<IQAForm>({ ...defaultQAFormState })

const QAModalVisible = ref(false)
const DOCModalVisible = ref(false)
const uploadFilesListLoading = ref(false)
const uploadFilesList = ref<IDocumentList[]>([])

const initFilesList = async () => {
  try {
    uploadFilesListLoading.value = true
    const {
      data: { data }
    } = await getFilesByDomainId(currentDomain.id.toString(), { page: 1, page_size: 1000 })
    uploadFilesList.value = data
  } catch (e) {
  } finally {
    uploadFilesListLoading.value = false
  }
}

const onOpenQAModal = () => {
  QAFormState = Object.assign(QAFormState, { ...defaultQAFormState })
  QAModalVisible.value = true
}

let refreshFilesIntervaler = null
watch(
  uploadFilesList,
  (v) => {
    if (!v.length && refreshFilesIntervaler) {
      clearInterval(refreshFilesIntervaler)
    } else {
      const needsRefresh = v.some((item) => !KnowledgeLearningFinalStatus.includes(item.status))

      if (needsRefresh && !refreshFilesIntervaler) {
        refreshFilesIntervaler = setInterval(() => initFilesList(), 10000)
      }

      if (!needsRefresh) {
        clearInterval(refreshFilesIntervaler)
      }
    }
  },
  { immediate: true }
)

const onDeleteFile = async (fileId: number) => {
  try {
    await ElMessageBox.confirm(t('删除后将影响机器人的训练结果，不可恢复！'), t('确认删除'), {
      confirmButtonText: t('确认'),
      cancelButtonText: t('取消'),
      type: 'warning'
    })
    await deleteFile(fileId)
    ElNotification.success(t('删除成功'))
    initFilesList()
  } catch (e) {}
}

const onCloseEnterModal = () => {
  QAModalVisible.value = false
  DOCModalVisible.value = false
  initFilesList()
}

const onPreviewFile = (file: IDocumentList) => {
  if (file.type === 'text') {
    QAFormState = Object.assign(QAFormState, {
      title: file.title,
      content: file.content_html,
      id: file.id,
      images: file.images,
      modalType: EDocumentOperateType.preview
    })
    QAModalVisible.value = true
  } else {
    openPreviewUrl(file.raw_file_url)
  }
}

onBeforeUnmount(() => {
  clearInterval(refreshFilesIntervaler)
})
// --------------

// ---- 上传头像 ----
// const apiUpload = url.join(currentEnvConfig.uploadBaseURL, '/chato/api/file/upload/file')
// const uploadConfig = {
//   uploadType: 1, // 1: 直接上传; 2: 打开图库上传
//   cropProps: {
//     aspectRatio: [1, 1], // 默认裁剪比例
//     autoAspectRatio: true // 是否允许修改裁剪比例
//   },
//   showUploadList: {
//     // 可操作按钮
//     showCropIcon: true,
//     showRemoveIcon: true
//   },
//   maxLength: 1, // 限制上传数量
//   apiUploadPath: apiUpload, // 上传路径
//   itemWidth: 48,
//   itemHeight: 48,
//   uploadFillet: true, // 是否圆角
//   uploadBtnText: '', // 上传文案
//   uploadBg: DefaultAvatar
// } as ImgUplaodProps
// const onImgChange = (value: any) => {
//   currentDomain.avatar = value?.url || ''
// }
// --------------
</script>
