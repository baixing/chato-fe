<template>
  <el-form :model="currentDomain" label-width="auto" label-position="top" class="chato-form">
    <el-form-item>
      <template #label>
        <SLTitle>
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
      </template>
      <div class="flex flex-col gap-4">
        <div class="flex gap-6">
          <el-select v-model="currentDomain.llm">
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
    </el-form-item>
    <div class="flex gap-10 lg:flex-col lg:gap-0">
      <el-form-item :label="$t(`回复长度`)">
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
      </el-form-item>
      <el-form-item :label="$t(`回复语种`)">
        <el-select v-model="currentDomain.lang" class="w-24" :placeholder="$t(`未指定`)" clearable>
          <el-option
            v-for="(item, index) in DomainReplyLanguage"
            :key="`lang_${index}`"
            :label="$t(item.label)"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t(`回复语气`)" class="flex-1 max-w-[160px]">
        <el-select
          v-model="internalReplyTone"
          multiple
          filterable
          allow-create
          clearable
          default-first-option
          :placeholder="$t(`未指定`)"
          :reserve-keyword="false"
          class="w-full"
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
    <el-form-item>
      <template #label>
        <SLTitle
          :tips="$t(`值为 0 时同一个问题的回复相对固定，值越大回复内容越随机多样具有创造性`)"
        >
          {{ $t('回复多样性') }}
        </SLTitle>
      </template>
      <el-slider
        v-model="currentDomain.temperature"
        :step="2.5"
        :max="10"
        :min="0"
        show-stops
        :format-tooltip="(v) => diverstyToolTip[v]"
        class="w-full"
      />
    </el-form-item>
    <el-form-item>
      <template #label>
        <div class="flex justify-between items-center">
          <SLTitle
            :tips="
              $t(
                `最多可添加 100 个词，每个词最长不超过 20 个字符，如不填写指定回复内容将默认不回复消息`
              )
            "
          >
            {{ $t('关键词回复') }}
          </SLTitle>
          <SwitchWithStateMsg
            v-model:value="currentDomain.keyword_block_show"
            size="small"
            openMsg="开启"
            closeMsg="关闭"
            msg-position="left"
          />
        </div>
      </template>
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
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { getSystemPromptLimit } from '@/api/domain'
import HansInputLimit from '@/components/Input/HansInputLimit.vue'
import SwitchWithStateMsg from '@/components/SwitchWithStateMsg/index.vue'
import SLTitle from '@/components/Title/SLTitle.vue'
import useSpaceRights from '@/composables/useSpaceRights'
import {
  DomainEditSymbol,
  DomainHansLimitSymbol,
  DomainLLMTypeOptions,
  DomainReplyLanguage,
  DomainReplyLength,
  DomainReplyParagraph,
  DomainReplyToneOfVoice
} from '@/constant/domain'
import { EDomainLLMType } from '@/enum/domain'
import { ESpaceCommercialType, ESpaceRightsType } from '@/enum/space'
import type { IDomainInfo } from '@/interface/domain'
import { getStringWidth } from '@/utils/string'
import { debouncedWatch } from '@vueuse/core'
import { ElInput, ElNotification } from 'element-plus'
import { computed, inject, nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const currentDomain = inject<Partial<IDomainInfo>>(DomainEditSymbol)
const currentDomainHansLimit = inject<Record<string, number>>(DomainHansLimitSymbol)

const { t } = useI18n()

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
