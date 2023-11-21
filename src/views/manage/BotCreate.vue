<template>
  <Topbar
    :center="false"
    class="bot-create-center-padding bg-white !border-b border-solid border-0 border-[#E4E7ED]"
  >
    <div class="flex gap-2 items-center cursor-pointer lg:-translate-x-1/2 lg:absolute lg:left-1/2">
      <Avatar
        :avatar="formState.avatar"
        :size="28"
        :name="formState.name.slice(0, 2)"
        :fontSize="'10px'"
      />
      <p class="max-w-[120px] truncate text-sm font-medium">
        {{ formState.name || '角色名称' }}
      </p>
    </div>
    <template #extra />
    <template #secondBar>
      <div
        class="py-4 box-border flex justify-end items-center gap-4 information-padding"
        style="border-top: 1px solid #e4e7ed"
      >
        <el-button :disabled="!canSave" type="primary" @click="onSave()">{{
          $t('保存')
        }}</el-button>
      </div>
    </template>
  </Topbar>
  <div v-loading="initing" class="bg-[#F2F3F5] flex gap-4 h-full w-full overflow-hidden">
    <div class="bg-white flex-1 flex flex-col h-full overflow-hidden relative">
      <el-tabs
        type="card"
        :model-value="activeTab"
        @tab-click="({ paneName }) => onClickTab(paneName)"
        class="chato-card-tab w-full info-tab center"
      >
        <el-tab-pane
          v-for="item in tabComponents"
          :key="item.key"
          :name="item.key"
          :label="$t(item.title)"
          class="h-full overflow-y-auto information-padding"
        >
          <component
            v-if="item.component"
            :is="item.component"
            :onClickTab="onClickTab"
            :onSetDOCModalVisible="onSetDOCModalVisible"
            :avatarShow="false"
            class="w-full h-full"
          />
        </el-tab-pane>
      </el-tabs>
    </div>
    <BotCreateChat v-if="!isMobile" />
  </div>
  <EnterDoc
    :domain-id="(formState.id as unknown as string)"
    :domain-name="formState.name"
    :defaultForm="DOCFormState"
    :sizeLimit="30"
    :qtyLimit="qtyLimit"
    :apiUpload="apiUploadPath.doc"
    :dialogVisible="DOCModalVisible"
    @setSuccess="onCloseEnterModal"
    @closeDialogVisble="onCloseEnterModal"
  />
  <Modal v-model:visible="isBeforeRoute" :footer="true" :show-close="true" title="保存信息">
    <div class="flex">
      <el-icon class="mr-1"><WarningFilled /></el-icon>
      <div class="text-[#606266]">你配置的机器人信息还未保存，是否保存？</div>
    </div>
    <template #footer>
      <!-- <el-button plain @click="onBeforeRoute()">{{ t('不保存') }}</el-button> -->
      <el-button plain @click="onBeforeRoute(onSave, 'draft')">{{ t('仅存为草稿') }}</el-button>
      <el-button type="primary" @click="onBeforeRoute(onSave)">{{ t('确认保存') }} </el-button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import {
  createDraftDomain,
  getDomainDetail,
  getDomainDetailPublic,
  updateDomain
} from '@/api/domain'
import { getFilesByDomainId } from '@/api/file'
import EnterDoc from '@/components/EnterAnswer/EnterDoc.vue'
import Topbar from '@/components/Topbar/index.vue'
import { useBasicLayout } from '@/composables/useBasicLayout'
import { currentEnvConfig } from '@/config'
import { USER_ROLES } from '@/constant/common'
import { DebugDomainSymbol, DomainCreateSymbol } from '@/constant/domain'
import { KnowledgeLearningFinalStatus } from '@/constant/knowledge'
import { EDomainAIGenerateType, EDomainStatus } from '@/enum/domain'
import type { IDomainInfo } from '@/interface/domain'
import type { IDocumentForm, IDocumentList } from '@/interface/knowledge'
import { RoutesMap } from '@/router'
import { useBase } from '@/stores/base'
import SSE from '@/utils/sse'
import { getStringWidth } from '@/utils/string'
import { ElLoading, ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import { isEqual } from 'lodash-es'
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  reactive,
  ref,
  toRaw,
  watch
} from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteLeave, useRoute, useRouter, type RouteLocationNormalized } from 'vue-router'
import BotCreateChat from './components/BotCreateChat.vue'
import BotCreateConfiguration from './components/BotCreateConfiguration.vue'
import BotCreateLui from './components/BotCreateLui.vue'

const defaultAIGenerateInputDisabled = {
  desc: false,
  system_prompt: false,
  welcome: false
}
const scrollContainerRef = ref()
let latestScrollHeight = 0
const route = useRoute()
const router = useRouter()
const { isMobile } = useBasicLayout()
const activeTab = ref<string>('lui')
const DOCFormState = ref<IDocumentForm>({})
const baseStoreI = useBase()
const DOCModalVisible = ref(false)
const isBeforeRoute = ref(false)

const qtyLimit = baseStoreI.userInfo.role === USER_ROLES.SUPERMAN ? 1000 : 20
let cdFn: Function
// const onLinkBots = () => {
//   router.push({ name: RoutesMap.manager.center })
// }
const apiUploadPath = computed(() => {
  const uri = `${currentEnvConfig.uploadBaseURL}/chato/api/domains/${formState.id}/files/upload`
  return {
    qa: `${uri}/qa`,
    doc: `${uri}/document`
  }
})

const tabComponents = computed(() => {
  const list = [
    { key: 'lui', title: '创建', component: BotCreateLui },
    { key: 'gui', title: '配置', component: BotCreateConfiguration }
  ]
  return !isMobile.value
    ? list
    : [...list, { key: 'preview', title: '预览', component: BotCreateChat }]
})
const currentStep = ref(0)

const onScrollBottom = () => {
  nextTick(() => {
    const { scrollHeight, scrollTop } = scrollContainerRef.value

    if (latestScrollHeight !== scrollHeight && scrollHeight > scrollTop) {
      latestScrollHeight = scrollHeight
      scrollContainerRef.value.scrollTo({
        top: scrollHeight,
        behavior: 'smooth'
      })
    }
  })
}

watch(currentStep, () => {
  onScrollBottom()
})

const onClickTab = (key) => (activeTab.value = key)

const onSetDOCModalVisible = (value: boolean, fn?: Function) => {
  cdFn = fn
  DOCModalVisible.value = value
}

const onCloseEnterModal = () => {
  DOCModalVisible.value = false
  initFilesList()
}

const getRandomColor = () =>
  [
    'avatar://?color=#409EFF',
    'avatar://?color=#7C5CFC',
    'avatar://?color=#FDCF63',
    'avatar://?color=#56DB79'
  ][Math.floor(Math.random() * 4)]

const HansLimit = {
  name: 20,
  system_prompt: 900,
  desc: 300,
  welcome: 2000
}
const defaultFormState: Partial<IDomainInfo> = {
  id: 0,
  slug: '',
  avatar: getRandomColor(),
  name: '',
  desc: '',
  system_prompt: '',
  welcome: '',
  avatar_show: true,
  name_show: true,
  desc_show: 0,
  name_and_avatar_show: 0,
  toc_privacy: 1
}
let originalFormState = { ...defaultFormState }
let originalTemplateFormState = {}
let formState = reactive<Partial<IDomainInfo>>({ ...defaultFormState })
let AIGenerateInputDisabled = reactive({ ...defaultAIGenerateInputDisabled })
provide(DomainCreateSymbol, formState)
const { t } = useI18n()

// 是否修改过
const isModified = () => !isEqual(formState, originalFormState)
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

const uploadFilesListLoading = ref(false)
const uploadFilesList = ref<IDocumentList[]>([])

const initFilesList = async () => {
  try {
    uploadFilesListLoading.value = true
    const {
      data: { data }
    } = await getFilesByDomainId(formState.id.toString(), { page: 1, page_size: 1000 })
    uploadFilesList.value = data
    if (cdFn) {
      cdFn(data)
      cdFn = undefined
    }
  } catch (e) {
  } finally {
    uploadFilesListLoading.value = false
  }
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
    await initDomainDetailBySlug()
    onNewDraft()
  } finally {
    initing.value = false
  }
}

const initDomainDetailBySlug = async () => {
  try {
    initing.value = true

    const {
      data: { data }
    } = await getDomainDetailPublic(route.params.botSlug)
    const { name, system_prompt, avatar } = data
    formState = Object.assign(formState, { name, system_prompt, avatar })
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
let beforeRouteLeave: RouteLocationNormalized
onBeforeRouteLeave(async (to, from, next) => {
  try {
    if (!isModified() || !canSave.value) {
      return
    }
    beforeRouteLeave = to
    isBeforeRoute.value = true
  } catch (e) {
  } finally {
    if (!beforeRouteLeave) next()
  }
})

const onBeforeRoute = async (cd?: (data: any) => Promise<void>, type?: any) => {
  try {
    if (cd) await cd(type)
  } catch (error) {
  } finally {
    const initBeforeRouteLeave = beforeRouteLeave
    beforeRouteLeave = null
    syncOriginalFormState()
    router.push(initBeforeRouteLeave)
  }
}

const init = async () => {
  if (route.params.botId) {
    await initDomainDetail()
  } else if (route.params.botSlug) {
    await initDomainDetailBySlug()
    onNewDraft()
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
    if (isModified()) {
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
:deep(.el-tabs__header) {
  margin: 16px auto;
}
:deep(.el-tabs__content) {
  flex-grow: 1;
}
</style>
