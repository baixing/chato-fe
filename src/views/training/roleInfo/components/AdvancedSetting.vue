<template>
  <div class="chato-form">
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
          <el-select v-model="currentDomain.llm">
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
          <el-select v-model="currentDomain.top_k" class="w-32">
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
          <span class="text-[#7C5CFC]">{{ currentDomainHansLimit.system_prompt }}</span>
          {{ $t('个字符') }}
        </p>
      </div>
    </div>
    <div class="flex gap-10 lg:flex-col lg:gap-0">
      <div class="chato-form-item">
        <div class="chato-form-label">{{ $t(`回复长度`) }}</div>
        <el-select
          v-model="currentDomain.reply_length"
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
        <el-select v-model="currentDomain.lang" class="w-24" :placeholder="$t(`未指定`)" clearable>
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
          v-model:value="currentDomain.is_session_effective"
          open-msg="开启"
          close-msg="关闭"
        />
      </div>
    </div>
    <div class="chato-form-item relative">
      <div class="chato-form-label">{{ $t('问题推荐') }}</div>
      <div class="flex items-center justify-between">
        <span class="space-x-3">
          <span class="text-[#596780] text-sm leading-5">
            {{ $t('机器人回答问题后，会展示推荐的问题，用户可点击后快速提问') }}
          </span>
          <el-button size="small" type="primary" link @click="() => (exampleVisible = true)">
            {{ $t('查看示例') }}
          </el-button>
        </span>
        <SwitchWithStateMsg
          v-model:value="currentDomain.show_recommend_question"
          open-msg="开启"
          close-msg="关闭"
        />
      </div>
      <SpaceRightsMask :visible="maskVisible" :rightsType="ESpaceRightsType.brand" />
    </div>
    <div class="chato-form-item">
      <div class="chato-form-label flex justify-between items-center">
        <SLTitle
          tips="最多可添加 100 个词，每个词最长不超过 20 个字符，如不填写指定回复内容将默认不回复消息"
        >
          {{ $t('关键词回复') }}
        </SLTitle>
        <SwitchWithStateMsg
          v-model:value="currentDomain.keyword_block_show"
          open-msg="开启"
          close-msg="关闭"
        />
      </div>
      <div v-show="currentDomain.keyword_block_show" class="w-full">
        <div class="flex items-center flex-wrap gap-3">
          <HansInputLimit
            v-if="keywordInputVisible"
            ref="keywordHansInputRef"
            v-model:value="keywordInput"
            type="text"
            size="default"
            :placeholder="$t(`请输入 20 以内的字符关键词`)"
            :limit="currentDomainHansLimit.keyword"
            class="w-60 lg:w-full"
            @keyupEnter="onKeywordInputConfirm"
            @blurInput="onKeywordInputConfirm"
          />
          <el-tag
            v-for="(item, index) in currentDomain.keyword_block"
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
            v-if="!keywordInputVisible && currentDomain.keyword_block?.length <= 100"
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
            v-model:value="currentDomain.keyword_block_reply"
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 18 }"
            size="large"
            :limit="currentDomainHansLimit.keywordReply"
            class="w-full"
          />
        </div>
      </div>
    </div>
    <div class="chato-form-item">
      <SLTitle tips="基于知识库无法回复时，机器人回答内容" class="chato-form-label">
        {{ $t('超纲问题回复') }}
      </SLTitle>
      <div class="exceed-radio flex items-center text-sm mb-4">
        <el-radio-group v-model="currentDomain.not_embedding_return_enabled">
          <el-radio :label="0" size="large">{{ $t('回复使用大模型知识') }}</el-radio>
          <el-radio :label="1" size="large">{{ $t('自定义回复') }}</el-radio>
        </el-radio-group>
      </div>
      <HansInputLimit
        v-if="Number(currentDomain.not_embedding_return_enabled) === 1"
        v-model:value="currentDomain.not_embedding_return_content"
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
        v-model="currentDomain.qa_threshold"
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
        v-model="currentDomain.doc_threshold"
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
        v-model="currentDomain.temperature"
        :step="2.5"
        :max="10"
        :min="0"
        show-stops
        :format-tooltip="(v) => diverstyToolTip[v]"
        class="w-full"
      />
    </div>
  </div>
  <Modal v-model:visible="exampleVisible" title="查看示例" :footer="false">
    <div class="max-h-[65vh] overflow-y-auto">
      <img :src="RecommendQuestionImg" class="w-full object-contain mx-auto" alt="" />
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { getSystemPromptLimit } from '@/api/domain'
import HansInputLimit from '@/components/Input/HansInputLimit.vue'
import Modal from '@/components/Modal/index.vue'
import SpaceRightsMask from '@/components/Space/SpaceRightsMask.vue'
import SwitchWithStateMsg from '@/components/SwitchWithStateMsg/index.vue'
import SLTitle from '@/components/Title/SLTitle.vue'
import useImagePath from '@/composables/useImagePath'
import useSpaceRights from '@/composables/useSpaceRights'
import {
  DomainEditSymbol,
  DomainHansLimitSymbol,
  DomainReplyLanguage,
  DomainReplyLength,
  DomainReplyParagraph,
  DomainReplyToneOfVoice
} from '@/constant/domain'
import { ESpaceCommercialType, ESpaceRightsType } from '@/enum/space'
import type { IDomainInfo, IDomainLLMConfig } from '@/interface/domain'
import { useSpaceStore } from '@/stores/space'
import { getStringWidth } from '@/utils/string'
import { debouncedWatch } from '@vueuse/core'
import { ElInput, ElNotification } from 'element-plus'
import { storeToRefs } from 'pinia'
import { computed, inject, nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const currentDomain = inject<Partial<IDomainInfo>>(DomainEditSymbol)
const currentDomainHansLimit = inject<Record<string, number>>(DomainHansLimitSymbol)

defineProps<{
  domainLLMTypeOptions: IDomainLLMConfig[]
}>()

const { t } = useI18n()
const { ImagePath: RecommendQuestionImg } = useImagePath('recommend-question', 'example')

const diverstyToolTip = {
  0: t('最准确'),
  2.5: t('较准确'),
  5: t('平衡'),
  7.5: t('强创造力'),
  10: t('天马行空')
}

const { isNotAllowedCommercialType, checkRightsTypeNeedUpgrade } = useSpaceRights()
const needUpgrate = computed(() => isNotAllowedCommercialType([ESpaceCommercialType.free]))

const keywordInput = ref('')
const keywordInputVisible = ref(false)
const keywordHansInputRef = ref<InstanceType<typeof ElInput>>()

const exampleVisible = ref(false)

const spaceStoreI = useSpaceStore()
const { currentRights } = storeToRefs(spaceStoreI)
const maskVisible = computed(() => currentRights.value.type === ESpaceCommercialType.free)

const internalReplyTone = computed({
  get: () => (currentDomain.reply_tone ? currentDomain.reply_tone.split(',') : null),
  set: (v) => (currentDomain.reply_tone = v instanceof Array ? v.join(',') : '')
})

const onDelKeyword = (delIndex: number) => {
  const newKeyword = currentDomain.keyword_block.filter((item, index) => index !== delIndex)
  currentDomain.keyword_block = newKeyword
}

const onShowKeywordInput = () => {
  keywordInputVisible.value = true
  nextTick(() => {
    keywordHansInputRef.value?.focus()
  })
}

const onKeywordInputConfirm = () => {
  if (keywordInput.value) {
    if (getStringWidth(keywordInput.value || '') > currentDomainHansLimit.keyword) {
      return ElNotification({
        type: 'warning',
        message: t('关键词字数不允许超过{slot1}字符', {
          slot1: currentDomainHansLimit.keyword
        })
      })
    } else {
      currentDomain.keyword_block.unshift(keywordInput.value)
    }
  }
  keywordInputVisible.value = false
  keywordInput.value = ''
}

const initSystemPromptLimit = async () => {
  const {
    data: { data }
  } = await getSystemPromptLimit({ llm: currentDomain.llm, top_k: currentDomain.top_k })
  currentDomainHansLimit.system_prompt = data.system_prompt_max_token
}

debouncedWatch(
  [() => currentDomain.llm, () => currentDomain.top_k],
  ([llm, topK]) => {
    llm && topK && initSystemPromptLimit()
  },
  { immediate: true, debounce: 300 }
)
</script>

<style lang="scss" scoped>
.exceed-radio {
  :deep(.el-radio__input.is-checked + .el-radio__label) {
    color: #303133;
  }
}
</style>
