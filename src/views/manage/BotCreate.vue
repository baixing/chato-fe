<template>
  <div v-loading="initing" class="bg-[#F2F3F5] flex gap-4 h-full w-full overflow-hidden">
    <div class="bg-white flex-1 flex flex-col h-full overflow-hidden relative">
      <Topbar :center="false" extra-in-mobile class="bot-create-center-padding">
        <el-breadcrumb separator=">">
          <el-breadcrumb-item>
            <a
              @click="onLinkBots"
              class="flex items-center !font-normal !text-[#909399] hover:!text-[#7c5cfc]"
            >
              <svg-icon svg-class="w-4 h-4 mr-1 mt-[-2px]" name="house" />
              {{ t('我的 Bots') }}
            </a>
          </el-breadcrumb-item>
          <el-breadcrumb-item>
            <span class="text-[#303133]">{{ t('创建机器人') }}</span>
          </el-breadcrumb-item>
        </el-breadcrumb>
        <template #extra>
          <span
            @click="chatMobileModalVisible = true"
            class="flex gap-1 items-center cursor-pointer transition-colors text-sm text-[#3D3D3D] hover:text-[#7c5cfc]"
          >
            <svg-icon name="phone-preview" svg-class="w-6 h-6 shrink-0" />
            <span>{{ t('预览') }}</span>
          </span>
        </template>
      </Topbar>
      <div class="bot-create-center-padding mb-16 flex-1 overflow-y-auto bot-create-block">
        <h3 class="text-[#303133] font-medium text-xl mb-6">{{ t('创建机器人') }}</h3>
        <div class="inline-block p-4 bg-[#F2F3F5] rounded-lg mb-10 lg:block">
          <p class="text-xs text-[#596780] leading-5 mb-3">
            {{ t('通过以下两种方式之一，只要 20 秒即可快速填充基础信息') }}
          </p>
          <div class="grid grid-cols-2 gap-5 lg:grid-cols-1 lg:gap-4">
            <div
              v-for="item in createTypeSelectList"
              :key="item.icon"
              @click="onOpenTypeModal(item)"
              class="create-type-card"
            >
              <svg-icon :name="item.icon" svg-class="w-8 h-8 text-[#7c5cfc] shrink-0" />
              <div class="space-y-1">
                <p class="text-[#303133] text-sm font-medium tracking-[0.13px] transition-colors">
                  {{ t(item.name) }}
                </p>
                <p class="text-[#9DA3AF] text-xs transition-colors">{{ t(item.desc) }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="flex gap-4 items-center mb-8">
          <ImgUpload :fixed="true" v-model:img-url="formState.avatar" />
          <HansInputLimit
            v-model:value="formState.name"
            type="text"
            size="default"
            :limit="HansLimit.name"
            :disabled="
              AIGenerateInputDisabled.system_prompt &&
              AIGenerateInputDisabled.desc &&
              AIGenerateInputDisabled.welcome
            "
            class="flex-1"
          />
        </div>

        <div class="create-input-label">
          <SLTitle>{{ t('角色设定') }}</SLTitle>
          <AIGenerateBtn
            v-model:generateStr="formState.system_prompt"
            :role="formState.name"
            :role-requirement="roleRequirement"
            :system-prompt="formState.system_prompt"
            :type="EDomainAIGenerateType.role"
            :disabled="!formState.name || AIGenerateInputDisabled.system_prompt"
            disabled-tip="请填写名字后生成"
            @start="AIGenerateInputDisabled.system_prompt = true"
            @end="AIGenerateInputDisabled.system_prompt = false"
          />
        </div>
        <HansInputLimit
          v-model:value="formState.system_prompt"
          type="textarea"
          :rows="10"
          size="large"
          :limit="HansLimit.system_prompt"
          :disabled="AIGenerateInputDisabled.system_prompt"
          class="w-full mb-8"
        />

        <SLTitle class="mb-4">{{ t('知识') }}</SLTitle>
        <div class="flex gap-4">
          <el-button plain @click="DOCModalVisible = true">
            <template #icon><svg-icon name="document" svg-class="w-4 h-4" /></template>
            {{ t('录入文档') }}
          </el-button>
          <el-button plain @click="onOpenQAModal">
            <template #icon><svg-icon name="qa" svg-class="w-4 h-4" /></template>
            {{ t('录入问答') }}
          </el-button>
        </div>
        <div
          v-loading="uploadFilesListLoading"
          class="mt-4 mb-8 space-y-3 max-h-[240px] overflow-y-auto"
        >
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
            <span class="text-[#7C5CFC]">{{ t(getFileStatusName(item.status)) }}</span>
            <el-button link :icon="Close" @click="onDeleteFile(item.id)" />
          </p>
        </div>

        <div class="create-input-label">
          <SLTitle tips="基于机器人当前名字和角色设定生成">{{ t('角色简介') }}</SLTitle>
          <AIGenerateBtn
            v-model:generateStr="formState.desc"
            :role="formState.name"
            :role-requirement="roleRequirement"
            :system-prompt="formState.system_prompt"
            :type="EDomainAIGenerateType.intro"
            :disabled="!formState.system_prompt || !formState.name || AIGenerateInputDisabled.desc"
            disabled-tip="请填写名字和角色设定后生成"
            @start="AIGenerateInputDisabled.desc = true"
            @end="AIGenerateInputDisabled.desc = false"
          />
        </div>
        <HansInputLimit
          v-model:value="formState.desc"
          type="textarea"
          :rows="6"
          size="large"
          :limit="HansLimit.desc"
          :disabled="AIGenerateInputDisabled.desc"
          class="w-full mb-8"
        />

        <div class="create-input-label">
          <SLTitle tips="基于机器人当前名字和角色设定生成">{{ t('欢迎语') }}</SLTitle>
          <AIGenerateBtn
            v-model:generateStr="formState.welcome"
            :role="formState.name"
            :role-requirement="roleRequirement"
            :system-prompt="formState.system_prompt"
            :type="EDomainAIGenerateType.welcome"
            :disabled="
              !formState.system_prompt || !formState.name || AIGenerateInputDisabled.welcome
            "
            disabled-tip="请填写名字和角色设定后生成"
            @start="AIGenerateInputDisabled.welcome = true"
            @end="AIGenerateInputDisabled.welcome = false"
          />
        </div>
        <HansInputLimit
          v-model:value="formState.welcome"
          type="textarea"
          :rows="6"
          size="large"
          :limit="HansLimit.welcome"
          :disabled="AIGenerateInputDisabled.welcome"
          class="w-full mb-8"
        />
      </div>
      <div
        class="bot-create-center-padding py-4 box-border flex justify-end items-center gap-4 bg-white absolute z-[2] bottom-0 left-0 right-0"
        style="border-top: 1px solid #e4e7ed"
      >
        <el-button :disabled="!canSave" @click="onSave('draft')">{{ t('存为草稿') }}</el-button>
        <el-button :disabled="!canSave" type="primary" @click="onSave()">
          {{ t('保存并创建') }}
        </el-button>
      </div>
    </div>
    <BotCreateChat v-if="!isMobile" />
  </div>

  <BotCreateTypeByTemplateModal
    v-model:visible="templateModalVisible"
    @submit="onTemplateTypeModalSubmit"
  />
  <BotCreateTypeByAIModal
    v-model:visible="AIModalVisible"
    @submit="onAITypeModalSubmit"
    @done="onAITypeModalDone"
    @update-domain-field="onAIUpdateDomainField"
  />
  <EnterQa
    :active-names="EDocumentTabType.inputText"
    :default-form="QAFormState"
    :domain-slug="formState.slug"
    :size-limit="30"
    :qty-limit="qtyLimit"
    :api-upload="apiUploadPath.qa"
    :dialog-visible="QAModalVisible"
    @close-dialog-visble="onCloseEnterModal"
  />
  <EnterDoc
    :domain-id="(formState.id as unknown as string)"
    :defaultForm="DOCFormState"
    :sizeLimit="30"
    :qtyLimit="qtyLimit"
    :apiUpload="apiUploadPath.doc"
    :dialogVisible="DOCModalVisible"
    @setSuccess="onCloseEnterModal"
    @closeDialogVisble="onCloseEnterModal"
  />
  <el-drawer
    v-if="isMobile"
    v-model="chatMobileModalVisible"
    :with-header="false"
    size="100%"
    append-to-body
    class="chat-mobile-chat-drawer relative"
  >
    <BotCreateChat class="!w-full !h-full" />
    <el-icon
      :size="24"
      class="!absolute top-4 right-4 z-[51] !text-[#4F4F4F] cursor-pointer hover:opacity-80"
      @click="chatMobileModalVisible = false"
    >
      <Close />
    </el-icon>
  </el-drawer>
</template>

<script setup lang="ts">
import { createDraftDomain, getDomainDetail, updateDomain } from '@/api/domain'
import { deleteFile, getFilesByDomainId } from '@/api/file'
import AIGenerateBtn from '@/components/AIGenerateBtn/index.vue'
import EnterDoc from '@/components/EnterAnswer/EnterDoc.vue'
import EnterQa from '@/components/EnterAnswer/EnterQa.vue'
import ImgUpload from '@/components/ImgUpload/ImgUpload.vue'
import HansInputLimit from '@/components/Input/HansInputLimit.vue'
import SLTitle from '@/components/Title/SLTitle.vue'
import Topbar from '@/components/Topbar/index.vue'
import { useBasicLayout } from '@/composables/useBasicLayout'
import { currentEnvConfig } from '@/config'
import { USER_ROLES } from '@/constant/common'
import { DebugDomainSymbol } from '@/constant/domain'
import { KnowledgeLearningFinalStatus } from '@/constant/knowledge'
import { EDomainAIGenerateType, EDomainStatus } from '@/enum/domain'
import { EDocumentOperateType, EDocumentTabType } from '@/enum/knowledge'
import type { IDomainInfo } from '@/interface/domain'
import type { IDocumentForm, IDocumentList } from '@/interface/knowledge'
import type { IQAForm } from '@/interface/konwledgeQa'
import { RoutesMap } from '@/router'
import { useBase } from '@/stores/base'
import { getFileStatusName } from '@/utils/formatter'
import { openPreviewUrl } from '@/utils/help'
import SSE from '@/utils/sse'
import { getStringWidth } from '@/utils/string'
import { Close } from '@element-plus/icons-vue'
import { ElLoading, ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import { isEqual } from 'lodash-es'
import { computed, onBeforeUnmount, onMounted, provide, reactive, ref, toRaw, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import BotCreateChat from './components/BotCreateChat.vue'
import BotCreateTypeByAIModal from './components/BotCreateTypeByAIModal.vue'
import BotCreateTypeByTemplateModal from './components/BotCreateTypeByTemplateModal.vue'

const { t } = useI18n()

const createTypeSelectList = [
  { icon: 'collection', name: '选择模版创建', desc: '海量模版助你快速创建' },
  { icon: 'robot-ai', name: 'AI 一键创建', desc: 'AI 生成，匹配度更高' }
]
const defaultAIGenerateInputDisabled = {
  desc: false,
  system_prompt: false,
  welcome: false
}

const route = useRoute()
const router = useRouter()
const { isMobile } = useBasicLayout()

const onLinkBots = () => {
  router.push({ name: RoutesMap.manager.center })
}

const HansLimit = {
  name: 20,
  system_prompt: 900,
  desc: 300,
  welcome: 2000
}
const defaultFormState: Partial<IDomainInfo> = {
  id: 0,
  slug: '',
  avatar: '',
  name: '',
  desc: '',
  system_prompt: '',
  welcome: '',
  avatar_show: true,
  name_show: true,
  desc_show: 0
}
let originalFormState = { ...defaultFormState }
let originalTemplateFormState = {}
let formState = reactive<Partial<IDomainInfo>>({ ...defaultFormState })
let AIGenerateInputDisabled = reactive({ ...defaultAIGenerateInputDisabled })

const chatMobileModalVisible = ref(false)
const templateModalVisible = ref(false)
const AIModalVisible = ref(false)
const roleRequirement = ref('')

// 是否修改过
const isModified = computed(() => !isEqual(formState, originalFormState))
// 选择模板创建，模板回填的字段是否和填写字段完全一致，一致触发「继续优化」逻辑
const isFormStateSameTemplate = computed(() => {
  const { name, system_prompt, desc, welcome } = formState
  return isEqual({ name, system_prompt, desc, welcome }, originalTemplateFormState)
})
const canSave = computed(
  () =>
    (formState.name || formState.system_prompt || formState.desc || formState.welcome) &&
    !AIGenerateInputDisabled.desc &&
    !AIGenerateInputDisabled.system_prompt &&
    !AIGenerateInputDisabled.welcome
)

const syncOriginalFormState = () => {
  originalFormState = toRaw(formState)
}

const onOpenTypeModal = (item: any) => {
  if (item.icon === 'collection') {
    templateModalVisible.value = true
  } else {
    AIModalVisible.value = true
  }
}

const onAIUpdateDomainField = (fieldType: string, fieldValue: string) => {
  let formStateFieldValue = formState[fieldType]
  if (fieldType === 'name') {
    formState[fieldType] = fieldValue
  } else {
    formStateFieldValue += fieldValue
    formState[fieldType] = formStateFieldValue
  }
}

const onTemplateTypeModalSubmit = (
  item: Pick<IDomainInfo, 'name' | 'system_prompt' | 'desc' | 'welcome'>
) => {
  const { name, system_prompt, desc, welcome } = item
  originalTemplateFormState = { name, system_prompt, desc, welcome }
  formState = Object.assign(formState, { name, system_prompt, desc, welcome })
}

const onAITypeModalSubmit = (name: string, roleReq: string) => {
  AIGenerateInputDisabled = Object.assign(AIGenerateInputDisabled, {
    desc: true,
    system_prompt: true,
    welcome: true
  })

  roleRequirement.value = roleReq
  formState = Object.assign(formState, { name, system_prompt: '', desc: '', welcome: '' })
}

const onAITypeModalDone = () => {
  AIGenerateInputDisabled = Object.assign(AIGenerateInputDisabled, defaultAIGenerateInputDisabled)
}

const onImgChange = (value: string) => {
  formState.avatar = value || ''
}
// --------------

const baseStoreI = useBase()

// ---- 文档 & 问答 ----
const qtyLimit = baseStoreI.userInfo.role === USER_ROLES.SUPERMAN ? 1000 : 20 // 同时上传的文件数量限制
const apiUploadPath = computed(() => {
  const uri = `${currentEnvConfig.uploadBaseURL}/chato/api/domains/${formState.id}/files/upload`
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
    } = await getFilesByDomainId(formState.id.toString(), { page: 1, page_size: 1000 })
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
// --------------

const initing = ref(false)
const loading = ref()
const onNewDraft = async () => {
  try {
    initing.value = true
    const {
      data: { data }
    } = await createDraftDomain()

    const { id, slug } = data

    formState = Object.assign(formState, { id, slug })
  } catch (err) {
  } finally {
    initing.value = false
  }
}

const initDomainDetail = async () => {
  try {
    initing.value = true

    const {
      data: { data }
    } = await getDomainDetail(route.params.botId)

    formState = Object.assign(formState, data)
    await initFilesList()
    syncOriginalFormState()
  } catch (err) {
  } finally {
    initing.value = false
  }
}

const checkNeedContinueToEdit = () => {
  return new Promise(async (resolve, reject) => {
    try {
      await ElMessageBox.confirm(
        t('机器人信息完整度低，建议进一步完善机器人信息或文档，全面发挥机器人会话功能'),
        t('继续优化'),
        {
          confirmButtonText: t('优化编辑'),
          cancelButtonText: t('确认创建'),
          type: 'warning'
        }
      )
      reject()
    } catch (e) {
      resolve('')
    }
  })
}

const beforeSaveCheck = () => {
  let msg = ''

  if (getStringWidth(formState.name) > HansLimit.name) {
    msg = t('机器人名称不能超过 {limitNum} 字符', { limitNum: HansLimit.name })
  } else if (getStringWidth(formState.system_prompt) > HansLimit.system_prompt) {
    msg = t('角色设定不能超过 {limitNum} 字符', { limitNum: HansLimit.system_prompt })
  } else if (getStringWidth(formState.desc) > HansLimit.desc) {
    msg = t('角色简介不能超过 {limitNum} 字符', { limitNum: HansLimit.desc })
  } else if (getStringWidth(formState.welcome) > HansLimit.welcome) {
    msg = t('欢迎语不能超过 {limitNum} 字符', { limitNum: HansLimit.welcome })
  }

  if (msg) {
    ElMessage.warning(msg)
    return false
  }

  return true
}

const onSave = async (type?: 'draft') => {
  try {
    if (!type && !beforeSaveCheck()) {
      return
    }
    loading.value = ElLoading.service({
      lock: true,
      text: t('保存中'),
      background: 'rgba(0, 0, 0, 0.7)'
    })

    if (!type && isFormStateSameTemplate.value) {
      await checkNeedContinueToEdit()
    }

    formState.status = type ? EDomainStatus.draft : EDomainStatus.able
    await updateDomain(formState.id, formState)
    syncOriginalFormState()
    ElNotification.success(t('保存成功'))
    router.push({ name: RoutesMap.manager.center, params: { botId: formState.id } })
  } catch (e) {
  } finally {
    loading.value.close()
  }
}

const SSEInstance = new SSE()

const onSSE = (type: EDomainAIGenerateType) => {
  return SSEInstance.request(
    '/prompt/generated',
    {
      role: formState.name,
      role_requirement: '',
      system_prompt: formState.system_prompt,
      generate_type: type
    },
    (str) => {
      switch (type) {
        case EDomainAIGenerateType.intro:
          formState.desc += str
          break
        case EDomainAIGenerateType.role:
          formState.system_prompt += str
          break
        case EDomainAIGenerateType.welcome:
          formState.welcome += str
          break
      }
    }
  )
}

const initByAIGenerate = async () => {
  try {
    AIGenerateInputDisabled = Object.assign(AIGenerateInputDisabled, {
      desc: true,
      system_prompt: true,
      welcome: true
    })

    await onSSE(EDomainAIGenerateType.role)
    const allPromises = [EDomainAIGenerateType.intro, EDomainAIGenerateType.welcome].map((item) =>
      onSSE(item)
    )
    await Promise.all(allPromises)
  } catch (e) {
  } finally {
    AIGenerateInputDisabled = Object.assign(AIGenerateInputDisabled, {
      desc: false,
      system_prompt: false,
      welcome: false
    })
  }
}

provide(DebugDomainSymbol, formState)

watch(
  () => formState.id,
  (v) => {
    v && initFilesList()
  }
)

onBeforeRouteLeave(async (to, from, next) => {
  try {
    if (!isModified.value || !canSave.value) {
      return
    }
    await ElMessageBox.confirm(t('您还未完成机器人创建，是否先存为草稿？'), t('存为草稿'), {
      confirmButtonText: t('确认'),
      cancelButtonText: t('取消'),
      type: 'warning'
    })
    await onSave('draft')
  } catch (e) {
  } finally {
    next()
  }
})

const init = async () => {
  if (route.params.botId) {
    await initDomainDetail()
  } else {
    onNewDraft()
  }

  if (route.params.opt === 'needAI') {
    initByAIGenerate()
  }
}

onMounted(() => {
  init()

  window.onbeforeunload = () => {
    if (isModified.value) {
      return true
    }
  }
})

onBeforeUnmount(() => {
  clearInterval(refreshFilesIntervaler)
  window.onbeforeunload = null
})
</script>

<style lang="scss" scoped>
.bot-create-center-padding {
  @apply px-16 lg:px-4;
}

.bot-create-block {
  .create-type-card {
    @apply flex-1 bg-white rounded-lg px-6 py-4 flex items-center gap-4 cursor-pointer;

    &:hover p:nth-of-type(1) {
      color: #7c5cfc;
    }
  }

  .create-input-label {
    @apply flex items-center justify-between mb-4;
  }
}
</style>
