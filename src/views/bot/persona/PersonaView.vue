<template>
  <div class="personal-container" v-loading="loading">
    <FLTitle>{{ $t('基础规则') }}</FLTitle>
    <el-form
      ref="form"
      :model="formData"
      label-width="90px"
      label-position="top"
      size="large"
      @submit.prevent="onSubmit"
    >
      <el-form-item>
        <template #label>
          <SLTitle class="mb-4">
            <template #tips>
              <dl>
                <dt>{{ $t('首选模型：') }}</dt>
                <dt>
                  {{ $t('- 默认模型集成多个 LLM ，适配您业务场景提供最佳回复方式和内容') }}
                </dt>
                <dt>
                  {{ $t('- ChatGLM 可用字符数最多，在训练和问答中可最大化利用字符数') }}
                </dt>
                <dt>
                  {{ $t('- 文心一言作为国内最知名的模型，拥有较为全面的智能知识体系') }}
                </dt>
                <dt>{{ $t('文档段落索引量：') }}</dt>
                <dt>
                  {{ $t('- 当选择 1-4 段时，系统将读取知识中的信息，根据读取的优先级索引') }}
                </dt>
                <dt>{{ $t('- 段落选择越短则可用字符数越多，反之则越少') }}</dt>
                <dt>
                  {{ $t('- 当选择 0 段时，系统将不再读取知识中的任何信息') }}
                </dt>
              </dl> </template
            >{{ $t('首选模型和文档段落索引量') }}</SLTitle
          >
        </template>
        <div class="flex flex-col gap-4">
          <div class="flex gap-6">
            <el-select v-model="formData.llm">
              <el-option
                v-for="item in DomainLLMTypeOptions"
                :key="item.value"
                :label="$t(item.label)"
                :value="item.value"
                :disabled="item.value === EDomainLLMType.azure4 && needUpgrate"
                class="!h-fit"
              >
                <div class="flex flex-col my-1 gap-[2px]">
                  <p class="leading-5">
                    {{ $t(item.label) }}
                    <span
                      v-if="item.value === EDomainLLMType.azure4 && needUpgrate"
                      class="inline-flex items-center"
                    >
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
                        power: item.value === EDomainLLMType.azure4 ? 40 : 1
                      })
                    }}
                  </p>
                </div>
              </el-option>
            </el-select>
            <el-select v-model="formData.top_k" class="w-24">
              <el-option
                v-for="item in DomainReplyParagraph"
                :key="item.value"
                :label="$t(item.label)"
                :value="item.value"
              />
            </el-select>
          </div>
          <p class="text-[#596780] text-xs leading-4">
            {{ $t('所选模型和段落数不同，将影响背景设定的可用字符数，目前可用')
            }}<span class="text-[#7C5CFC]">{{ InputLimit.system_prompt }}</span
            >{{ $t('个字符') }}
          </p>
        </div>
      </el-form-item>

      <el-form-item class="!mb-0">
        <template #label>
          <SLTitle
            :tips="$t(`机器人将根据以上内容，明确自己的具体职责，请尽量输入重要且精准的要求。`)"
            class="mb-4"
            >{{ $t('角色设定')
            }}<template #extra>
              <div class="flex-1 flex justify-end items-center">
                <AIGenerateBtn
                  ref="generateBtnRef"
                  v-model:generateStr="formData.system_prompt"
                  :type="EDomainAIGenerateType.role"
                  @start="systemPromptDisabled = true"
                  @end="systemPromptDisabled = false"
                />
              </div>
            </template>
          </SLTitle>
        </template>
        <HansInputLimit
          v-model:value="formData.system_prompt"
          type="textarea"
          :rows="10"
          size="large"
          :disabled="systemPromptDisabled"
          :limit="InputLimit.system_prompt"
          class="w-full mb-[22px]"
        />
      </el-form-item>

      <div class="flex gap-10 lg:flex-col lg:gap-0 mb-16">
        <el-form-item :label="$t(`回复长度`)">
          <el-select
            v-model="formData.reply_length"
            class="w-40"
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
        </el-form-item>
        <el-form-item :label="$t(`回复语种`)">
          <el-select v-model="formData.lang" class="w-40" :placeholder="$t(`未指定`)" clearable>
            <el-option
              v-for="(item, index) in DomainReplyLanguage"
              :key="`lang_${index}`"
              :label="$t(item.label)"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t(`回复语气`)">
          <el-select
            v-model="formData.reply_tone"
            multiple
            filterable
            allow-create
            clearable
            default-first-option
            :placeholder="$t(`未指定`)"
            :reserve-keyword="false"
          >
            <el-option
              v-for="(item, index) in DomainReplyToneOfVoice"
              :key="`tone_${index}`"
              :label="$t(item)"
              :value="item"
            />
          </el-select>
        </el-form-item>
      </div>

      <FLTitle>{{ $t('高级规则') }}</FLTitle>
      <el-form-item class="!mb-10">
        <template #label>
          <SLTitle
            :tips="$t(`值为 0 时同一个问题的回复相对固定，值越大回复内容越随机多样具有创造性`)"
            >{{ $t('回复多样性') }}</SLTitle
          >
        </template>
        <div class="w-full flex items-center gap-4">
          <div class="slider-tip">{{ $t('最准确') }}</div>
          <div class="slider-block">
            <el-slider
              v-model="formData.temperature"
              :step="2.5"
              :max="10"
              :min="0"
              show-stops
              :format-tooltip="formatTooltip"
            />
          </div>
          <div class="slider-tip">{{ $t('天马行空') }}</div>
        </div>
      </el-form-item>
      <el-form-item>
        <template #label>
          <SLTitle
            :tips="
              $t(
                `最多可添加 100 个词，每个词最长不超过 20 个字符，如不填写指定回复内容将默认不回复消息`
              )
            "
            >{{ $t('关键词回复') }}</SLTitle
          >
        </template>
        <div class="flex items-center flex-wrap gap-3 w-full">
          <HansInputLimit
            v-if="keywordInputVisible"
            ref="keywordHansInputRef"
            v-model:value="keywordInput"
            type="text"
            size="default"
            :placeholder="$t(`请输入 20 以内的字符关键词`)"
            :limit="InputLimit.keyword"
            class="w-60 lg:w-full"
            @keyupEnter="onKeywordInputConfirm"
            @blurInput="onKeywordInputConfirm"
          />
          <el-tag
            v-for="(item, index) in formData.keyword_block"
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
            v-if="!keywordInputVisible && formData.keyword_block.length <= 100"
            size="small"
            type="primary"
            link
            @click="onShowKeywordInput"
            >{{ $t('添加关键词') }}</el-button
          >
        </div>
      </el-form-item>
      <div class="flex justify-between items-center mb-4">
        <span class="text-sm leading-4 text-[#596780]">{{ $t('触发时默认回复') }}</span>
        <SwitchWithStateMsg
          v-model:value="formData.keyword_block_show"
          size="small"
          :openMsg="`打开`"
          :closeMsg="`关闭`"
          msg-position="left"
        />
      </div>
      <HansInputLimit
        v-model:value="formData.keyword_block_reply"
        type="textarea"
        :autosize="{ minRows: 3, maxRows: 18 }"
        size="large"
        :limit="InputLimit.keywordReply"
        class="w-full mb-[22px]"
      />
      <el-button type="primary" native-type="submit" class="mt-9">{{ $t('保存设定') }}</el-button>
    </el-form>
  </div>
</template>
<script lang="ts" setup>
import { getDomainDetail, getSystemPromptLimit, updateDomain } from '@/api/domain'
import AIGenerateBtn from '@/components/AIGenerateBtn/index.vue'
import HansInputLimit from '@/components/Input/HansInputLimit.vue'
import SwitchWithStateMsg from '@/components/SwitchWithStateMsg/index.vue'
import FLTitle from '@/components/Title/FLTitle.vue'
import SLTitle from '@/components/Title/SLTitle.vue'
import useSpaceRights from '@/composables/useSpaceRights'
import {
  DomainLLMTypeOptions,
  DomainReplyLanguage,
  DomainReplyLength,
  DomainReplyParagraph,
  DomainReplyToneOfVoice
} from '@/constant/domain'
import { EDomainAIGenerateType, EDomainLLMType } from '@/enum/domain'
import { ESpaceCommercialType, ESpaceRightsType } from '@/enum/space'
import { useDomainStore } from '@/stores/domain'
import { getStringWidth } from '@/utils/string'
import { debouncedWatch } from '@vueuse/core'
import { ElInput, ElNotification as Notification } from 'element-plus'
import { storeToRefs } from 'pinia'
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
const { t } = useI18n()

const route = useRoute()
const domainStoreI = useDomainStore()
const { domainInfo } = storeToRefs(domainStoreI)
const domainId = computed(() => domainInfo.value.id || (route.params.botId as string))
const loading = ref(true)

const DefaultFormState = {
  system_prompt: '',
  welcome: '',
  reply_tone: [],
  temperature: 0,
  reply_length: null,
  lang: null,
  type: 0,
  top_k: 3,
  llm: EDomainLLMType.azure,
  keyword_block: [],
  keyword_block_reply: '',
  keyword_block_show: false
}

let formData = reactive<{
  system_prompt: string
  welcome: string
  reply_tone: string[]
  temperature: number
  reply_length: number
  lang: string
  type: number
  top_k: number
  llm: EDomainLLMType
  keyword_block: string[]
  keyword_block_reply: string
  keyword_block_show: boolean
}>({ ...DefaultFormState })
const InputLimit = reactive({
  system_prompt: 3000,
  welcome: 256,
  keyword: 20,
  keywordReply: 200
})

const diverstyToolTip = {
  0: t('最准确'),
  2.5: t('较准确'),
  5: t('平衡'),
  7.5: t('强创造力'),
  10: t('天马行空')
}

const formatTooltip = (val) => {
  return diverstyToolTip[val]
}

const $systemPromptExceedLimit = computed(() => {
  return getStringWidth(formData.system_prompt || '') > InputLimit.system_prompt
})

const onSubmit = async () => {
  if ($systemPromptExceedLimit.value) {
    return Notification({
      type: 'warning',
      message: t('身份设定字数不允许超过{slot1}字符', {
        slot1: InputLimit.system_prompt
      })
    })
  } else if (getStringWidth(formData.keyword_block_reply || '') > InputLimit.keywordReply) {
    return Notification({
      type: 'warning',
      message: t('关键词默认回复字数不允许超过{slot1}字符', {
        slot1: InputLimit.keywordReply
      })
    })
  }
  onSubmitCommon()
}

const onSubmitCommon = async () => {
  loading.value = true
  try {
    const saveParams: any = { ...formData }
    !saveParams.reply_length && (saveParams.reply_length = 0)
    saveParams.reply_tone = formData.reply_tone.join(',')
    await updateDomain(domainId.value, saveParams)
    await domainStoreI.initDomainList(route)
    Notification.success(t('保存成功'))
    generateBtnRef.value?.resetCount()
  } catch (err) {
  } finally {
    loading.value = false
  }
}

const initDomainDetail = async () => {
  loading.value = true
  try {
    const {
      data: { data: detail }
    } = await getDomainDetail(domainId.value)
    const detailState = {
      system_prompt: detail.system_prompt,
      welcome: detail.welcome,
      reply_tone: detail.reply_tone ? detail.reply_tone.split(',') : [],
      temperature: detail.temperature,
      reply_length: detail.reply_length || null,
      lang: detail.lang,
      type: detail.type,
      top_k: detail.top_k,
      llm: detail.llm || DefaultFormState.llm,
      keyword_block: detail.keyword_block || DefaultFormState.keyword_block,
      keyword_block_reply: detail.keyword_block_reply,
      keyword_block_show: detail.keyword_block_show
    }

    const newFormState = {
      ...DefaultFormState,
      ...detailState
    }

    formData = Object.assign(formData, newFormState)
  } catch (e) {
  } finally {
    loading.value = false
  }
}

const keywordInput = ref('')
const keywordInputVisible = ref(false)
const keywordHansInputRef = ref<InstanceType<typeof ElInput>>()

const onDelKeyword = (delIndex: number) => {
  const newKeyword = formData.keyword_block.filter((item, index) => index !== delIndex)
  formData.keyword_block = newKeyword
}

const onShowKeywordInput = () => {
  keywordInputVisible.value = true
  nextTick(() => {
    keywordHansInputRef.value?.focus()
  })
}

const onKeywordInputConfirm = () => {
  if (keywordInput.value) {
    if (getStringWidth(keywordInput.value || '') > InputLimit.keyword) {
      return Notification({
        type: 'warning',
        message: t('关键词字数不允许超过{slot1}字符', {
          slot1: InputLimit.keyword
        })
      })
    } else {
      formData.keyword_block.unshift(keywordInput.value)
    }
  }
  keywordInputVisible.value = false
  keywordInput.value = ''
}

const generateBtnRef = ref()

const initSystemPromptLimit = async () => {
  const {
    data: { data }
  } = await getSystemPromptLimit({ llm: formData.llm, top_k: formData.top_k })
  InputLimit.system_prompt = data.system_prompt_max_token
}

const { isNotAllowedCommercialType, checkRightsTypeNeedUpgrade } = useSpaceRights()
const needUpgrate = computed(() => isNotAllowedCommercialType([ESpaceCommercialType.free]))

const systemPromptDisabled = ref(false)

function init() {
  initDomainDetail()
}

watch(domainId, (v) => v && init(), { immediate: true })

debouncedWatch(
  [() => formData.llm, () => formData.top_k],
  () => {
    initSystemPromptLimit()
  },
  { immediate: true, debounce: 300 }
)
</script>
<style lang="scss" scoped>
.personal-container {
  width: auto;
  max-width: 992px;

  :deep(.el-form-item__label) {
    font-size: 14px;
    color: #3d3d3d;
    padding: 0;
    font-weight: 500;
    margin-bottom: 16px;
  }

  :deep(.el-tag .el-tag__close) {
    color: #3d3d3d;
    &:hover {
      background-color: #dedede;
    }
  }
}

.slider-block {
  display: flex;
  margin-left: 6px;
  margin-right: 4px;
  align-items: center;
  flex: 1;

  .slider-block .el-slider {
    margin-top: 0;
    margin-left: 12px;
  }
}

.slider-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
