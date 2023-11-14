<template>
  <div class="flex-1 overflow-y-auto bot-create-block">
    <div class="flex justify-center py-8">
      <AvatarModal
        class="h-[72px] w-[72px]"
        v-model:img-url="formState.avatar"
        :name="formState.name.slice(0, 2)"
        :size="72"
      />
    </div>
    <div class="create-input-label">
      <SLTitle>{{ t('角色名称') }}</SLTitle>
      <div class="flex">
        <div
          v-for="item in createTypeSelectList"
          :key="item.icon"
          @click="onOpenTypeModal(item)"
          class="text-[#7c5cfc] text-sm transition-colors ml-6 flex items-center cursor-pointer"
        >
          <div>{{ t(item.desc) }}</div>
          <svg-icon :name="item.icon" class="!w-4 !h-4 ml-1" />
        </div>
      </div>
    </div>
    <div class="flex gap-4 items-center mb-8">
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
        :link="true"
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

    <SLTitle class="mb-4">{{ t('训练数据') }}</SLTitle>
    <div class="flex gap-4">
      <el-button plain @click="DOCModalVisible = true" class="w-full !h-auto !p-0">
        <div class="py-5">
          <div><svg-icon name="document" svg-class="w-4 h-4 mb-1" /></div>
          <div>{{ t('录入文档') }}</div>
        </div>
      </el-button>
      <el-button plain @click="onOpenQAModal" class="w-full !h-auto !p-0">
        <div class="py-5">
          <div><svg-icon name="qa" svg-class="w-4 h-4 mb-1" /></div>
          <div>{{ t('录入问答') }}</div>
        </div>
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
    :domain-name="formState.name"
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
import EnterDoc from '@/components/EnterAnswer/EnterDoc.vue'
import EnterQa from '@/components/EnterAnswer/EnterQa.vue'
import { currentEnvConfig } from '@/config'
import { USER_ROLES } from '@/constant/common'
import { DomainCreateSymbol } from '@/constant/domain'
import { EDomainAIGenerateType } from '@/enum/domain'
import { EDocumentOperateType, EDocumentTabType } from '@/enum/knowledge'
import type { IDomainInfo } from '@/interface/domain'
import type { IDocumentForm, IDocumentList, IQAForm } from '@/interface/knowledge'
import { useBase } from '@/stores/base'
import { getFileStatusName } from '@/utils/formatter'
import { openPreviewUrl } from '@/utils/help'
import { Close } from '@element-plus/icons-vue'
import { ElMessageBox, ElNotification } from 'element-plus'
import { computed, inject, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import BotCreateTypeByAIModal from './BotCreateTypeByAIModal.vue'
import BotCreateTypeByTemplateModal from './BotCreateTypeByTemplateModal.vue'

const HansLimit = {
  name: 20,
  system_prompt: 900,
  desc: 300,
  welcome: 2000
} as const
const createTypeSelectList = [
  { icon: 'top-right', name: '选择模版创建', desc: '从模版中选择' },
  { icon: 'magic', name: 'AI 一键创建', desc: 'AI 一键创建' }
] as const
const defaultAIGenerateInputDisabled = {
  desc: false,
  system_prompt: false,
  welcome: false
}
const defaultQAFormState: IQAForm = {
  title: '',
  question_id: 0,
  content: '',
  images: [],
  modalType: EDocumentOperateType.create
}
const baseStoreI = useBase()
const qtyLimit = baseStoreI.userInfo.role === USER_ROLES.SUPERMAN ? 1000 : 20
const { t } = useI18n()
const uploadFilesListLoading = ref(false)
const templateModalVisible = ref(false)
const AIModalVisible = ref(false)
const QAModalVisible = ref(false)
const DOCModalVisible = ref(false)
const roleRequirement = ref('')
const uploadFilesList = ref<IDocumentList[]>([])
const DOCFormState = ref<IDocumentForm>({})
const formState = inject(DomainCreateSymbol)
let QAFormState = reactive<IQAForm>({ ...defaultQAFormState })
let AIGenerateInputDisabled = reactive({ ...defaultAIGenerateInputDisabled })

const apiUploadPath = computed(() => {
  const uri = `${currentEnvConfig.uploadBaseURL}/chato/api/domains/${formState.id}/files/upload`
  return {
    qa: `${uri}/qa`,
    doc: `${uri}/document`
  }
})

const onOpenTypeModal = (item: (typeof createTypeSelectList)[number]) => {
  if (item.icon === 'top-right') {
    templateModalVisible.value = true
  } else {
    AIModalVisible.value = true
  }
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

const onAITypeModalSubmit = (name: string, roleReq: string) => {
  AIGenerateInputDisabled = Object.assign(AIGenerateInputDisabled, {
    desc: true,
    system_prompt: true,
    welcome: true
  })

  roleRequirement.value = roleReq
  formState.name = name
  formState.system_prompt = ''
  formState.desc = ''
  formState.welcome = ''
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

const onTemplateTypeModalSubmit = (item: Pick<IDomainInfo, 'name' | 'system_prompt'>) => {
  const { name, system_prompt } = item
  formState.name = name
  formState.system_prompt = system_prompt
}

const onOpenQAModal = () => {
  QAFormState = Object.assign(QAFormState, { ...defaultQAFormState })
  QAModalVisible.value = true
}

const onAITypeModalDone = () => {
  AIGenerateInputDisabled = Object.assign(AIGenerateInputDisabled, defaultAIGenerateInputDisabled)
}

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
