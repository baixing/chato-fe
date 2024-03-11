<template>
  <div class="input-box" :class="[needAiGenerate ? 'lg:!px-0' : 'lg:!px-3']">
    <el-tooltip
      :disabled="internalEnterDisabled"
      :content="t(`清空历史消息`)"
      placement="top"
      :hide-after="0"
    >
      <span
        data-sensors-click
        id="Chato_chat_delete_click"
        :data-sensors-question-id="internalLastQuestionId"
        :class="['input-icon-btn', internalHiddenClear && '!hidden']"
        @click="() => !internalEnterDisabled && emit('clear')"
      >
        <svg-icon name="chat-clear" svg-class="w-6 h-6 text-[#303133]" />
      </span>
    </el-tooltip>
    <template v-if="chatEnterType === EDomainConversationMode.audio">
      <el-tooltip :disabled="isMobile" :content="t('语音输入')" placement="top" :hide-after="0">
        <span
          @click="onRecording"
          class="mx-14 flex w-12 h-12 rounded-full overflow-hidden bg-[#7C5CFC] items-center justify-center cursor-pointer transition-opacity hover:opacity-80"
        >
          <svg-icon svg-class="w-6 h-6 text-white" name="chat-sound" />
        </span>
      </el-tooltip>
      <el-tooltip :disabled="isMobile" :content="t('切换键盘')" placement="top" :hide-after="0">
        <span class="input-icon-btn" @click="chatEnterType = EDomainConversationMode.text">
          <svg-icon name="chat-keyboard" svg-class="w-6 h-6 text-[#303133]" />
        </span>
      </el-tooltip>
    </template>
    <template v-else>
      <div class="input-box-content">
        <el-input
          resize="none"
          type="textarea"
          :autosize="{ maxRows: 5 }"
          v-model="internalValue"
          :placeholder="t(inputPlaceholder)"
          :disabled="isAiGenerate || internalEnterDisabled"
          @click="emit('inputClick')"
          @keydown.enter="onKeydownEnter"
        />
        <el-tooltip
          :disabled="isAiGenerate || internalEnterDisabled"
          :content="t('语音输入')"
          placement="top"
          :hide-after="0"
        >
          <span @click="(e) => !internalEnterDisabled && onRecording(e)" class="send-btn">
            <svg-icon svg-class="w-6 h-6 text-[#303133]" name="chat-sound" />
          </span>
        </el-tooltip>
        <el-tooltip
          v-if="!internalEnterDisabled"
          :content="t(`发送`)"
          placement="top"
          :hide-after="0"
        >
          <span
            :disabled="internalEnterDisabled"
            @click="() => onSend()"
            data-script="Chato-send-question"
            class="send-btn transition-colors pl-1"
          >
            <svg-icon
              :svg-class="[
                'w-6 h-6 text-[#B5BED0] transition-colors',
                internalValue && '!text-[#7C5CFC]'
              ]"
              name="chat-send"
            />
          </span>
        </el-tooltip>
        <el-tooltip v-else :content="t(`终止`)" placement="top" :hide-after="0">
          <span
            :disabled="!internalEnterDisabled"
            @click="emit('onTerminateRetry')"
            data-script="Chato-send-question"
            class="send-btn transition-colors pl-1"
          >
            <svg-icon
              :svg-class="['w-6 h-6 text-[#303133] transition-colors hover:text-[#7C5CFC]']"
              name="pause"
            />
          </span>
        </el-tooltip>
      </div>
    </template>
    <!-- <el-tooltip
      v-if="needAiGenerate"
      :disabled="internalEnterDisabled"
      :content="t('自动生成')"
      placement="top"
      :hide-after="0"
    >
      <div
        @click="() => onIsAiGenerate(!isAiGenerate)"
        class="input-icon-btn bg-[#7C5CFC]/[.08] lg:bg-transparent"
      >
        <div class="w-full flex justify-center items-center">
          <svg-icon
            svg-class="w-6 h-6 text-[#303133]"
            :name="isAiGenerate ? 'ai-pause' : 'ai-generate'"
          />
        </div>
      </div>
    </el-tooltip> -->
    <div
      v-show="chatRecordingEnterVisible"
      :class="['recorder-container', footerBrandShow && '!-bottom-8']"
    >
      <el-icon size="16" color="#596780" @click="onCloseRecorder" class="close-icon">
        <Close />
      </el-icon>
      <el-input
        v-if="internalValue"
        v-model="internalValue"
        :disabled="isRecording"
        resize="none"
        :rows="4"
        type="textarea"
        class="pr-5"
      />
      <div v-else class="text-center text-sm leading-5 space-y-2 mt-7">
        <p class="font-medium">{{ t('想问什么，说来听听...') }}</p>
        <p class="text-[#9DA3AF] leading-4 text-xs">{{ t('点击下方语音图标可停止录音') }}</p>
      </div>
      <div class="flex gap-10 items-center justify-center relative">
        <el-button
          link
          type="info"
          :disabled="!internalValue"
          @click="onClearRecorder"
          v-if="
            domainDetail.conversation_mode !== EDomainConversationMode.audio ||
            domainDetail?.conversation_arouse_mode !==
              EDomainConversationModeArousalMethod.AutomaticSpeechRecognition
          "
        >
          {{ t('清空') }}
        </el-button>
        <span
          @click="(event) => onRecording(event, internalValue)"
          class="flex w-9 h-9 rounded-full overflow-hidden bg-[#7C5CFC] items-center justify-center cursor-pointer transition-opacity hover:opacity-80"
        >
          <svg-icon svg-class="w-5 h-5 text-white" name="chat-sound" />
        </span>
        <el-button
          link
          type="info"
          :disabled="!internalValue"
          @click="onSendRecorder"
          v-if="
            domainDetail.conversation_mode !== EDomainConversationMode.audio ||
            domainDetail?.conversation_arouse_mode !==
              EDomainConversationModeArousalMethod.AutomaticSpeechRecognition
          "
        >
          {{ t('发送') }}
        </el-button>
        <WaterRipples v-show="isRecording" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import WaterRipples from '@/components/Animations/WaterRipples.vue'
import useAudioPlayer from '@/composables/useAudioPlayer'
import { useBasicLayout } from '@/composables/useBasicLayout'
import useRecognizer from '@/composables/useRecognizer'
import { SymChatDomainDetail } from '@/constant/chat'
import { PaidCommercialTypes } from '@/constant/space'
import { EDomainConversationMode, EDomainConversationModeArousalMethod } from '@/enum/domain'
import type { IDomainInfo } from '@/interface/domain'
import { RoutesMap } from '@/router'
import { debounce } from 'lodash'
import { computed, inject, nextTick, onBeforeUnmount, ref, watch, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

const props = defineProps<{
  value: string
  disabled?: boolean
  lastQuestionId?: number
  hiddenClear?: boolean
  isAiGenerate: boolean
  onIsAiGenerate: (v) => void
  needAiGenerate: boolean
}>()

const emit = defineEmits(['update:value', 'inputClick', 'clear', 'submit', 'onTerminateRetry'])

const { t } = useI18n()
const route = useRoute()
const { isMobile } = useBasicLayout()

const domainDetail = inject<Ref<IDomainInfo>>(SymChatDomainDetail)

const chatRecordingEnterVisible = ref(false)

const chatEnterType = ref<EDomainConversationMode>(EDomainConversationMode.text)

const internalValue = computed({
  get: () => props.value,
  set: (v) => emit('update:value', v)
})
const internalEnterDisabled = computed({
  get: () => props.disabled || audioPlaying.value,
  set: (v) => v
})
const internalHiddenClear = computed(() => props.hiddenClear)
const internalLastQuestionId = computed(() => props.lastQuestionId)
const isAiGenerate = computed(() => props.isAiGenerate)
const inputPlaceholder = computed(() =>
  isMobile.value ? '请输入问题' : '输入问题，换行可通过shift+回车'
)

const inDebug = computed(() => RoutesMap.tranning.roleInfo === route.name)

const footerBrandShow = computed(() => {
  if (PaidCommercialTypes.includes(domainDetail.value.org?.type)) {
    return domainDetail.value.brand_show
  } else {
    return true
  }
})

// 是否语音对话模式的机器人
const isAudioChatModeDomain = computed(
  () => EDomainConversationMode.audio === domainDetail.value?.conversation_mode
)

// --- 语音对话逻辑 start ---
const audioSendTime = 2000

const onAudioSend = debounce(() => {
  onSend()
  chatRecordingEnterVisible.value = false
}, audioSendTime)

const onAudioChat = (str) => {
  if (!isAudioChatModeDomain.value || inDebug.value || !str) {
    return
  }
  if (
    domainDetail.value?.conversation_arouse_mode ===
    EDomainConversationModeArousalMethod.AutomaticSpeechRecognition
  ) {
    chatRecordingEnterVisible.value = true
    onAudioSend()
  }
}
// --- 语音对话逻辑 end ---

const onRecorderUpdateStr = (str) => {
  if (internalEnterDisabled.value) {
    return
  }
  emit('update:value', str)
  onAudioChat(str)
}

const { audioPlaying } = useAudioPlayer()

const onRecorderNeedReopen = (): boolean => {
  let res = false
  if (
    !inDebug.value &&
    isAudioChatModeDomain.value &&
    !isRecording.value &&
    !internalEnterDisabled.value &&
    !audioPlaying.value
  ) {
    res = true
  }
  return res
}

const { startRecording, stopRecording, resetAsr, isRecording } = useRecognizer({
  updateStr: onRecorderUpdateStr,
  checkNeedReopen: onRecorderNeedReopen
})

// 触发录音
const onRecording = (_: MouseEvent, str?: string) => {
  internalValue.value = str || ''
  chatRecordingEnterVisible.value = true
  isRecording.value ? stopRecording() : startRecording(internalValue.value)
}

const onKeydownEnter = (e: KeyboardEvent) => {
  if (!e.shiftKey && e.keyCode === 13) {
    e.cancelBubble = true
    e.stopPropagation()
    e.preventDefault()
    onSend()
  }
}

const onClearRecorder = () => {
  resetAsr()
  nextTick(() => {
    internalValue.value = ''
  })
}

const onCloseRecorder = () => {
  if (isRecording.value) {
    stopRecording()
  }
  onClearRecorder()
  internalEnterDisabled.value = false
  chatRecordingEnterVisible.value = false
}

const onSendRecorder = () => {
  onCloseRecorder()
  onSend(internalValue.value)
}

// 消息发送
const onSend = (val?: string) => {
  !isAiGenerate.value && emit('submit', val)
}

// 语音对话，进来就开启录音
watch([isAudioChatModeDomain, isRecording, internalEnterDisabled, audioPlaying], () => {
  if (
    !isAudioChatModeDomain.value ||
    inDebug.value ||
    domainDetail.value?.conversation_arouse_mode ===
      EDomainConversationModeArousalMethod.ActiveTrigger
  ) {
    return
  }
  if (isRecording.value) {
    if (internalEnterDisabled.value || audioPlaying.value) {
      stopRecording()
      return
    }
  } else {
    if (!audioPlaying.value && !internalEnterDisabled.value) {
      startRecording(internalValue.value)
    }
  }
})

watch(
  domainDetail,
  (v) => {
    if (!v) {
      return
    }

    onCloseRecorder()
    internalValue.value = ''
    chatEnterType.value = domainDetail.value.conversation_mode
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  onCloseRecorder()
})
</script>

<style lang="scss" scoped>
.input-box {
  @apply gap-1 my-2 px-4;

  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  background-color: #fff;
  position: relative;
  box-sizing: border-box;

  .input-icon-btn {
    @apply w-12 h-12 flex items-center justify-center rounded-full shrink-0 cursor-pointer transition-colors hover:bg-[#f2f3f5] lg:w-8 lg:h-8;
  }

  .input-box-content {
    @apply rounded-3xl py-1 pl-4 pr-1;

    flex: 1;
    display: flex;
    align-items: center;
    border: 1px solid #e4e7ed;
    min-height: 44px;
    box-sizing: border-box;
  }

  .send-btn {
    @apply w-9 h-9;

    cursor: pointer;
    border-radius: 100%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    &:hover {
      background-color: #f2f3f5;

      svg {
        color: #7c5cfc;
      }
    }
  }

  :deep(.el-textarea) {
    display: flex;
    align-items: center;
  }

  :deep(.el-textarea__inner) {
    box-shadow: none;
    font-weight: normal;
    flex: 1;
    color: #303133;
    padding: 0 12px 0 0;
    font-size: 15px;
    line-height: 15px;
    min-height: 15px !important;

    &::placeholder {
      color: #9da3af;
    }
  }

  :deep(.el-textarea.is-disabled .el-textarea__inner) {
    color: #303133;
    background-color: transparent;
  }
}

.recorder-container {
  // left-[24%] right-[24%] xl:left-[12%] xl:right-[12%] 2xl:left-[18%] 2xl:right-[18%]
  @apply lg:left-4 lg:right-4 left-4 right-4 h-44 rounded-2xl px-5 py-4 text-sm leading-6;

  position: absolute;
  z-index: 3;
  bottom: 0;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.16);
  box-sizing: border-box;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  color: #303133;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .close-icon {
    @apply right-4 top-4;

    cursor: pointer;
    position: absolute;
    z-index: 2;

    &:hover {
      opacity: 0.8;
    }
  }

  :deep(.el-textarea__inner) {
    padding: 0;
    font-size: 15px;
    line-height: 1.5;
    border: none;
    box-shadow: none;
    color: #303133;
    background-color: transparent;
  }
}

@keyframes ball-animation {
  0% {
    @apply w-11 h-11;
  }

  50% {
    @apply w-20 h-20;
  }

  to {
    @apply w-11 h-11;
  }
}
</style>
