<template>
  <div class="flex-1 overflow-y-auto bot-create-block chato-form bot-create-center-padding">
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
      <el-button plain @click="onSetDOCModalVisible(true)" class="w-full !h-auto !p-0">
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
    <div class="chato-form-item">
      <div class="chato-form-label flex items-center justify-between">
        <SLTitle tips="基于机器人当前名字和角色设定生成">{{ $t('角色简介') }}</SLTitle>
        <AIGenerateBtn
          v-model:generateStr="formState.desc"
          :role="formState.name"
          :system-prompt="formState.system_prompt"
          :type="EDomainAIGenerateType.intro"
          :link="true"
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
        class="w-full"
      />
    </div>
    <div class="chato-form-item">
      <div class="chato-form-label flex items-center justify-between">
        <SLTitle tips="基于机器人当前名字和角色设定生成">{{ t('欢迎语') }}</SLTitle>
        <AIGenerateBtn
          v-model:generateStr="formState.welcome"
          :role="formState.name"
          :system-prompt="formState.system_prompt"
          :type="EDomainAIGenerateType.welcome"
          :link="true"
          :disabled="!formState.system_prompt || !formState.name || AIGenerateInputDisabled.welcome"
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
  <div
    class="bot-create-center-padding cursor-pointer pb-4"
    :class="[!isAdvancedSettings ? '!pb-[60px]' : '']"
  >
    <div
      @click="isAdvancedSettings = !isAdvancedSettings"
      class="bg-[#F2F3F5] rounded-lg h-14 p-3 text-sm flex justify-between items-center"
    >
      <div class="font-medium text-base">{{ $t('高级设置') }}</div>
      <div class="flex items-center text-[#596780]">
        {{ $t(!isAdvancedSettings ? '展开' : '收起') }}
        <el-icon class="ml-1 mr-1">
          <ArrowRight v-if="!isAdvancedSettings" /> <ArrowDown v-else
        /></el-icon>
      </div>
    </div>
  </div>
  <div class="chato-form bot-create-center-padding pb-4" v-if="isAdvancedSettings">
    <div class="chato-form-item">
      <SLTitle class="chato-form-label">
        <template #tips>
          <dl>
            <dt>{{ $t('首选模型：') }}</dt>
            <dt>{{ $t('- 默认模型集成多个 LLM ，适配您业务场景提供最佳回复方式和内容') }}</dt>
            <dt>{{ $t('- ChatGLM 可用字符数最多，在训练和问答中可最大化利用字符数') }}</dt>
            <dt>{{ $t('- 文心一言作为国内最知名的模型，拥有较为全面的智能知识体系') }}</dt>
            <dt>{{ $t('文档段落索引量：') }}</dt>
            <dt>{{ $t('- 当选择 1-4 段时，系统将读取知识中的信息，根据读取的优先级索引') }}</dt>
            <dt>{{ $t('- 段落选择越短则可用字符数越多，反之则越少') }}</dt>
            <dt>{{ $t('- 当选择 0 段时，系统将不再读取知识中的任何信息') }}</dt>
          </dl>
        </template>
        {{ $t('首选模型和文档段落索引量') }}
      </SLTitle>
      <div class="flex flex-col gap-4">
        <div class="flex gap-6">
          <el-select v-model="formState.llm">
            <el-option
              v-for="item in domainLLMTypeOptions"
              :key="item.type"
              :label="$t(item.name)"
              :value="item.type"
              :disabled="item.need_vip && needUpgrate"
              class="!h-fit"
            >
              <div class="flex flex-col my-1 gap-[2px]">
                <p class="leading-5">
                  {{ $t(item.name) }}
                  <span v-if="item.need_vip && needUpgrate" class="inline-flex items-center">
                    (<el-button
                      link
                      type="primary"
                      class="-mr-[2px]"
                      @click="checkRightsTypeNeedUpgrade(ESpaceRightsType.default)"
                    >
                      {{ $t('升级') }}
                    </el-button>
                    {{ $t('后可使用') }})
                  </span>
                </p>
                <p class="text-[#B5BED0] text-xs">
                  {{
                    $t('消耗 {power} 个电力值', {
                      power: item.consume_quota
                    })
                  }}
                </p>
              </div>
            </el-option>
          </el-select>
          <el-select v-model="formState.top_k" class="w-32">
            <el-option
              v-for="item in DomainReplyParagraph"
              :key="item.value"
              :label="$t(item.label)"
              :value="item.value"
            />
          </el-select>
        </div>
        <p class="text-[#596780] text-xs leading-4">
          {{ $t('所选模型和段落数不同，将影响背景设定的可用字符数，目前可用') }}
          <span class="text-[#7C5CFC]">{{ HansLimit.system_prompt }}</span>
          {{ $t('个字符') }}
        </p>
      </div>
    </div>
    <div class="flex gap-10 lg:flex-col lg:gap-0">
      <div class="chato-form-item">
        <div class="chato-form-label">{{ $t(`回复长度`) }}</div>
        <el-select
          v-model="formState.reply_length"
          class="w-24"
          :placeholder="$t(`未指定`)"
          clearable
        >
          <el-option
            v-for="(item, index) in DomainReplyLength"
            :key="`len_${index}`"
            :label="$t(item.label)"
            :value="item.value"
          />
        </el-select>
      </div>
      <div class="chato-form-item">
        <div class="chato-form-label">{{ $t(`回复语种`) }}</div>
        <el-select v-model="formState.lang" class="w-24" :placeholder="$t(`未指定`)" clearable>
          <el-option
            v-for="(item, index) in DomainReplyLanguage"
            :key="`lang_${index}`"
            :label="$t(item.label)"
            :value="item.value"
          />
        </el-select>
      </div>
      <div class="chato-form-item">
        <div class="chato-form-label">{{ $t(`回复语气`) }}</div>
        <el-select
          v-model="internalReplyTone"
          multiple
          filterable
          allow-create
          clearable
          default-first-option
          :placeholder="$t(`未指定`)"
          :reserve-keyword="false"
          class="flex-1 max-w-[160px]"
        >
          <el-option
            v-for="(item, index) in DomainReplyToneOfVoice"
            :key="`tone_${index}`"
            :label="$t(item)"
            :value="item"
          />
        </el-select>
      </div>
    </div>
    <div class="chato-form-item">
      <div class="chato-form-label">
        {{ $t('对话上下文') }}
      </div>
      <div class="flex items-center justify-between">
        <span class="text-[#596780] text-sm leading-5">
          {{ $t('根据上下文的信息进行语义理解、识别指代对象并生成连贯的回答') }}
        </span>
        <SwitchWithStateMsg
          v-model:value="formState.is_session_effective"
          open-msg="开启"
          close-msg="关闭"
        />
      </div>
    </div>
    <div class="chato-form-item">
      <div class="chato-form-label flex gap-[6px] items-center">
        {{ $t('问题推荐') }}
        <SpaceRightsFreeExpUpgrate
          v-if="currentRights.type === ESpaceCommercialType.free"
          :rights-type="ESpaceRightsType.brand"
        />
      </div>
      <div class="flex items-center justify-between relative">
        <span class="space-x-3">
          <span class="text-[#596780] text-sm leading-5">
            {{ $t('机器人回答问题后，会展示推荐的问题，用户可点击后快速提问') }}
          </span>
          <el-button size="small" type="primary" link @click="() => (exampleVisible = true)">
            {{ $t('查看示例') }}
          </el-button>
        </span>
        <SwitchWithStateMsg
          v-model:value="formState.show_recommend_question"
          open-msg="开启"
          close-msg="关闭"
        />
        <SpaceRightsMask :visible="maskVisible" />
      </div>
    </div>
    <div class="chato-form-item">
      <div class="chato-form-label flex justify-between items-center">
        <SLTitle
          tips="最多可添加 100 个词，每个词最长不超过 20 个字符，如不填写指定回复内容将默认不回复消息"
        >
          {{ $t('关键词回复') }}
        </SLTitle>
        <SwitchWithStateMsg
          v-model:value="formState.keyword_block_show"
          open-msg="开启"
          close-msg="关闭"
        />
      </div>
      <div v-show="formState.keyword_block_show" class="w-full">
        <div class="flex items-center flex-wrap gap-3">
          <HansInputLimit
            v-if="keywordInputVisible"
            ref="keywordHansInputRef"
            v-model:value="keywordInput"
            type="text"
            size="default"
            :placeholder="$t(`请输入 20 以内的字符关键词`)"
            :limit="HansLimit.keyword"
            class="w-60 lg:w-full"
            @keyupEnter="onKeywordInputConfirm"
            @blurInput="onKeywordInputConfirm"
          />
          <el-tag
            v-for="(item, index) in formState.keyword_block"
            :key="item"
            class="!text-[#303133] !border-none"
            size="large"
            color="#F2F3F5"
            closable
            :disable-transitions="false"
            @close="onDelKeyword(index)"
          >
            {{ item }}
          </el-tag>
          <el-button
            v-if="!keywordInputVisible && formState.keyword_block?.length <= 100"
            size="small"
            type="primary"
            link
            @click="onShowKeywordInput"
          >
            {{ $t('添加关键词') }}
          </el-button>
        </div>
        <div class="mt-4">
          <p class="text-[#596780] text-xs leading-4 mb-3">{{ $t('触发时默认回复') }}</p>
          <HansInputLimit
            v-model:value="formState.keyword_block_reply"
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 18 }"
            size="large"
            :limit="HansLimit.keywordReply"
            class="w-full"
          />
        </div>
      </div>
    </div>
    <div class="chato-form-label flex justify-between items-center">
      <SLTitle
        tips="是否开放机器人被互联网用户访问 (如百度索引、文心一言等平台）"
        class="chato-form-label"
      >
        {{ $t('公开访问权限') }}
      </SLTitle>
      <SwitchWithStateMsg v-model:value="formState.toc_privacy" open-msg="开启" close-msg="关闭" />
    </div>
    <div class="chato-form-item">
      <SLTitle tips="基于知识库无法回复时，机器人回答内容" class="chato-form-label">
        {{ $t('超纲问题回复') }}
      </SLTitle>
      <div class="exceed-radio flex items-center text-sm mb-4">
        <el-radio-group v-model="formState.not_embedding_return_enabled">
          <el-radio :label="0" size="large">{{ $t('回复使用大模型知识') }}</el-radio>
          <el-radio :label="1" size="large">{{ $t('自定义回复') }}</el-radio>
        </el-radio-group>
      </div>
      <HansInputLimit
        v-if="Number(formState.not_embedding_return_enabled) === 1"
        v-model:value="formState.not_embedding_return_content"
        type="textarea"
        :rows="3"
        size="large"
        :placeholder="$t(`请输入自定义回复内容`)"
        :limit="500"
        class="w-full"
      />
    </div>
    <div class="chato-form-item">
      <SLTitle tips="数值越高所匹配的QA知识越精准，但知识数量可能变少" class="chato-form-label">
        {{ $t('QA相关性') }}
      </SLTitle>
      <el-slider
        v-model="formState.qa_threshold"
        :step="5"
        :max="85"
        :min="40"
        show-stops
        class="w-full"
      />
    </div>
    <div class="chato-form-item">
      <SLTitle
        tips="数值越高所匹配的文档知识越精准，但来源文档数量可能变少"
        class="chato-form-label"
      >
        {{ $t('文档相关性') }}
      </SLTitle>
      <el-slider
        v-model="formState.doc_threshold"
        :step="5"
        :max="85"
        :min="40"
        show-stops
        class="w-full"
      />
    </div>
    <div class="chato-form-item">
      <SLTitle
        tips="值为 0 时同一个问题的回复相对固定，值越大回复内容越随机多样具有创造性"
        class="chato-form-label"
      >
        {{ $t('回复多样性') }}
      </SLTitle>
      <el-slider
        v-model="formState.temperature"
        :step="2.5"
        :max="10"
        :min="0"
        show-stops
        :format-tooltip="(v) => diverstyToolTip[v]"
        class="w-full"
      />
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
  <Modal v-model:visible="exampleVisible" title="查看示例" :footer="false">
    <div class="max-h-[65vh] overflow-y-auto">
      <img :src="RecommendQuestionImg" class="w-full object-contain mx-auto" alt="" />
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { getSystemPromptLimit } from '@/api/domain'
import { deleteFile } from '@/api/file'
import { getCommonGraph } from '@/api/graph'
import EnterQa from '@/components/EnterAnswer/EnterQa.vue'
import useImagePath from '@/composables/useImagePath'
import useSpaceRights from '@/composables/useSpaceRights'
import { currentEnvConfig } from '@/config'
import { SUPPORT_LLM_CONFIG, USER_ROLES } from '@/constant/common'
import {
  DomainCreateSymbol,
  DomainReplyLanguage,
  DomainReplyLength,
  DomainReplyParagraph,
  DomainReplyToneOfVoice
} from '@/constant/domain'
import { FreeCommercialTypeExperienceDay } from '@/constant/space'
import { EDomainAIGenerateType } from '@/enum/domain'
import { EDocumentOperateType, EDocumentTabType } from '@/enum/knowledge'
import { ESpaceCommercialType, ESpaceRightsType } from '@/enum/space'
import type { IDomainInfo, IDomainLLMConfig } from '@/interface/domain'
import type { IDocumentList, IQAForm } from '@/interface/knowledge'
import { useBase } from '@/stores/base'
import { useSpaceStore } from '@/stores/space'
import { getFileStatusName } from '@/utils/formatter'
import { openPreviewUrl } from '@/utils/help'
import { getStringWidth } from '@/utils/string'
import { getSpecifiedDateSinceNowDay } from '@/utils/timeRange'
import { Close } from '@element-plus/icons-vue'
import { debouncedWatch } from '@vueuse/core'
import { ElInput, ElMessageBox, ElNotification } from 'element-plus'
import { storeToRefs } from 'pinia'
import { computed, inject, nextTick, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import BotCreateTypeByAIModal from './BotCreateTypeByAIModal.vue'
import BotCreateTypeByTemplateModal from './BotCreateTypeByTemplateModal.vue'

const { t } = useI18n()

const HansLimit = reactive({
  name: 20,
  system_prompt: 900,
  desc: 300,
  welcome: 2000,
  keyword: 20,
  brandName: 40,
  keywordReply: 200
})

const diverstyToolTip = {
  0: t('最准确'),
  2.5: t('较准确'),
  5: t('平衡'),
  7.5: t('强创造力'),
  10: t('天马行空')
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
const internalReplyTone = computed({
  get: () => (formState.reply_tone ? formState.reply_tone.split(',') : null),
  set: (v) => (formState.reply_tone = v instanceof Array ? v.join(',') : '')
})
defineProps<{
  onSetDOCModalVisible: (value: boolean) => void
}>()
const { ImagePath: RecommendQuestionImg } = useImagePath('recommend-question', 'example')
const baseStoreI = useBase()
const qtyLimit = baseStoreI.userInfo.role === USER_ROLES.SUPERMAN ? 1000 : 20
const uploadFilesListLoading = ref(false)
const templateModalVisible = ref(false)
const AIModalVisible = ref(false)
const QAModalVisible = ref(false)
const isAdvancedSettings = ref(false)
const keywordInputVisible = ref(false)
const keywordInput = ref('')
const DOCModalVisible = ref(false)
const roleRequirement = ref('')
const uploadFilesList = ref<IDocumentList[]>([])
const formState = inject(DomainCreateSymbol)
let QAFormState = reactive<IQAForm>({ ...defaultQAFormState })
let AIGenerateInputDisabled = reactive({ ...defaultAIGenerateInputDisabled })
const domainLLMTypeOptions = ref<IDomainLLMConfig[]>([])
const keywordHansInputRef = ref<InstanceType<typeof ElInput>>()
const { isNotAllowedCommercialType, checkRightsTypeNeedUpgrade } = useSpaceRights()
const needUpgrate = computed(() => isNotAllowedCommercialType([ESpaceCommercialType.free]))
const spaceStoreI = useSpaceStore()
const exampleVisible = ref(false)
const { currentRights } = storeToRefs(spaceStoreI)
const apiUploadPath = computed(() => {
  const uri = `${currentEnvConfig.uploadBaseURL}/chato/api/domains/${formState.id}/files/upload`
  return {
    qa: `${uri}/qa`,
    doc: `${uri}/document`
  }
})
const { orgInfo } = storeToRefs(baseStoreI)
const specifiedBetweenDay = getSpecifiedDateSinceNowDay(orgInfo.value.created)
const maskVisible = computed(
  () =>
    currentRights.value.type === ESpaceCommercialType.free &&
    specifiedBetweenDay > FreeCommercialTypeExperienceDay
)
onMounted(async () => {
  await initLLMConfigOption()
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

const onDelKeyword = (delIndex: number) => {
  const newKeyword = formState.keyword_block.filter((item, index) => index !== delIndex)
  formState.keyword_block = newKeyword
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
    } = await getCommonGraph<IDocumentList[]>(`chato_domains/${formState.id.toString()}/files`, {
      page: 1,
      size: 1000
    })
    //  getFilesByDomainId(formState.id.toString(), { page: 1, page_size: 1000 })
    uploadFilesList.value = data
  } catch (e) {
  } finally {
    uploadFilesListLoading.value = false
  }
}

const onShowKeywordInput = () => {
  keywordInputVisible.value = true
  nextTick(() => {
    keywordHansInputRef.value?.focus()
  })
}

const onKeywordInputConfirm = () => {
  if (keywordInput.value) {
    if (getStringWidth(keywordInput.value || '') > HansLimit.keyword) {
      return ElNotification({
        type: 'warning',
        message: t('关键词字数不允许超过{slot1}字符', {
          slot1: HansLimit.keyword
        })
      })
    } else {
      formState.keyword_block.unshift(keywordInput.value)
    }
  }
  keywordInputVisible.value = false
  keywordInput.value = ''
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

const initLLMConfigOption = async () => {
  // const res = await domainLLMConfigAPI()
  // const domainLLMList = res.data.data
  domainLLMTypeOptions.value = SUPPORT_LLM_CONFIG
  if (!formState.llm && SUPPORT_LLM_CONFIG.length > 0) {
    formState.llm = SUPPORT_LLM_CONFIG[0].type
  }
}

const initSystemPromptLimit = async () => {
  const {
    data: { data }
  } = await getSystemPromptLimit({ llm: formState.llm, top_k: formState.top_k })
  HansLimit.system_prompt = data.system_prompt_max_token
}

debouncedWatch(
  [() => formState.llm, () => formState.top_k],
  ([llm, topK]) => {
    llm && topK && initSystemPromptLimit()
  },
  { immediate: true, debounce: 300 }
)
</script>
<style lang="scss" scoped>
.bot-create-center-padding {
  @apply px-16 lg:px-4;
}
:deep(.el-collapse-item__arrow) {
  @apply px-16 lg:px-4 w-auto;
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
