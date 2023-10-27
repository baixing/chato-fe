<script setup lang="ts">
import useAudioPlayer from '@/composables/useAudioPlayer'
import { SymChatMessageAudioTTSParams, SymChatToken } from '@/constant/chat'
import {
  EMessageDisplayType,
  EMessageEvalution,
  EMessageType,
  EWsMessageStatus
} from '@/enum/message'
import type { IDomainInfo } from '@/interface/domain'
import type { IMessageItem } from '@/interface/message'
import type { ITTSParams } from '@/interface/tts'
import { generatePreviewImgUrl } from '@/utils/help'
import { detectMarkdown, renderMarkdown } from '@/utils/markdown'
import { computed, inject, provide, ref, type Ref } from 'vue'
import ChatMessageAudio from './ChatMessageAudio.vue'
import ChatMessageStatus from './ChatMessageStatus.vue'

const props = defineProps<{
  message: IMessageItem
  isInternal: boolean
  detail: IDomainInfo
  isLast: boolean
  isLoadingAnswer?: boolean
  correctVisible?: boolean
}>()

const bubbleRef = ref<HTMLDivElement>()

const { checkShowCurrentAudioPlayer } = useAudioPlayer()

const isAnswerMessage = computed(() => props.message.displayType === EMessageDisplayType.answer)
const isQuestionMessage = computed(() => props.message.displayType === EMessageDisplayType.question)
const internalCorrectVisible = computed(() => props.correctVisible)
const internalAudioPlayerId = computed(
  () => `${props.message.questionId}_${isAnswerMessage.value ? 'a' : 'q'}`
)
const audioVisible = computed(
  () => isAnswerMessage.value && checkShowCurrentAudioPlayer(internalAudioPlayerId.value)
)

const emit = defineEmits([
  'clickSource',
  'evaluate',
  'showMoreAction',
  'receiveQuestionAnswer',
  'sendMessage'
])

const messageContent = computed(() => {
  if (props.message.translate) {
    return String(props.message.content + '\n翻译:\n' + props.message.translate).trim()
  }
  return (String(props.message.content) || '-').trim()
})

const onMore = (e, message: IMessageItem) => {
  e.stopPropagation()

  const { x, y } = e.target.getBoundingClientRect()
  const position = {
    left: x,
    top: y + e.target.clientHeight + 4
  }

  emit('showMoreAction', message, position)
}

const mjProgress = computed(() => `${Number(props.message?.progress || 0) * 100}%`)

const chatToken = inject<Ref<string>>(SymChatToken)

const audioTTSParams = computed<ITTSParams>(() => {
  return {
    text: props.message.content,
    audio_key: internalAudioPlayerId.value,
    domain_slug: props.detail.slug,
    token: chatToken.value,
    finish_reason: 'full'
  }
})

provide(SymChatMessageAudioTTSParams, audioTTSParams)
</script>

<template>
  <div
    :class="['flex flex-col items-start', isQuestionMessage && '!flex-row justify-end']"
    :data-id="message.id"
    :data-script="isLast ? 'Chato-lastest-message' : ''"
  >
    <div class="max-w-full" ref="bubbleRef" id="bubbleContainer">
      <div class="flex justify-start items-center">
        <div
          v-if="message.status === EWsMessageStatus.pending"
          class="message-box !rounded-tl-none"
        >
          <div class="cursor-flash"></div>
        </div>
        <div
          v-else
          :class="[
            'message-box relative',
            !message.first && (isQuestionMessage ? 'ml-12 !rounded-br-sm !rounded-tl-2xl' : 'mr-12')
          ]"
          :style="{
            backgroundColor: isQuestionMessage ? detail.message_style : 'auto',
            color: isQuestionMessage ? '#fff' : 'auto'
          }"
        >
          <div
            :class="[
              'absolute bottom-3 flex items-end justify-center text-[#B5BED0] cursor-pointer rounded-full transition-colors hover:text-[#303133]',
              isQuestionMessage ? '-left-5' : '-right-5',
              (message.displayType === EMessageDisplayType.answer &&
                message.questionId &&
                !isLoadingAnswer) ||
              (message.displayType === EMessageDisplayType.question && !isLoadingAnswer)
                ? 'visible'
                : 'invisible'
            ]"
            @click="(e) => onMore(e, message)"
          >
            <svg-icon name="more-vertical" svg-class="w-4 h-4" />
          </div>
          <div
            v-if="
              (message.type === EMessageType.mjImage || message.type === EMessageType.image) &&
              isAnswerMessage
            "
            class="w-[60vw] h-[60vw] max-w-[400px] max-h-[400px] relative"
          >
            <el-image
              v-loading="message.status === EWsMessageStatus.running"
              class="w-full h-full"
              :src="message.content"
              :zoom-rate="1.2"
              :preview-src-list="[generatePreviewImgUrl(message.content)]"
              fit="cover"
              style="--el-mask-color: transparent; --el-loading-spinner-size: 80px"
            />
            <p
              v-show="message.status === EWsMessageStatus.running"
              class="text-lg text-[#7c5cfc] font-medium absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2"
            >
              {{ mjProgress }}
            </p>
          </div>
          <div v-else class="overflow-hidden w-auto markdown-body">
            <ChatMessageAudio v-if="audioVisible" :player-id="internalAudioPlayerId" />
            <div
              v-if="detectMarkdown(messageContent)"
              v-html="renderMarkdown(messageContent)"
              class="markdown-container-chato markdown-body"
            ></div>
            <div
              v-else
              v-html="messageContent"
              class="whitespace-pre-line break-words"
              style="word-break: break-word"
            ></div>
          </div>
        </div>
      </div>
      <!-- TODO: 考虑放消息外层 -->
      <!-- 消息底部逻辑（文档来源、赞踩与修正、消息状态） -->
      <!-- 消息状态：思考中、回答中 -->
      <ChatMessageStatus
        v-if="isAnswerMessage && isLast"
        :message="message"
        :is-loading-answer="isLoadingAnswer"
      />
      <!-- 绘画图片的相关操作 -->
      <div
        v-if="isAnswerMessage && !isLoadingAnswer && message.command?.length"
        class="flex gap-2 items-center flex-wrap mt-3"
      >
        <el-button
          v-for="item in message.command"
          :key="item"
          size="small"
          class="!m-0 !p-1"
          @click="emit('sendMessage', item)"
        >
          {{ item.replace(/\s\d+$/, '') }}
        </el-button>
      </div>
      <div
        v-if="
          isAnswerMessage &&
          message.questionId &&
          !isLoadingAnswer &&
          message.status !== EWsMessageStatus.pending
        "
        class="relative flex justify-start items-center ml-2 text-[#303133] text-sm cursor-pointer"
      >
        <!-- 段落来源 -->
        <div
          v-if="(isInternal || detail.question_ref_source_show) && message.ref_source_len"
          class="flex items-center gap-1 mr-5 h-5 mt-2"
          @click.stop="() => emit('clickSource', message.questionId)"
        >
          <svg-icon name="folder-open" svg-class="w-5 h-5 text-[#303133]" />
          <span class="text-xs mt-[2px]">
            {{ $t('文档：来源于 {num} 个段落', { num: message.ref_source_len }) }}
          </span>
        </div>
        <!-- 赞和踩 -->
        <div
          v-if="
            message.evaluation === EMessageEvalution.like ||
            message.evaluation === EMessageEvalution.dislike
          "
          class="flex items-center gap-2 mr-2 mt-2"
        >
          <el-icon
            :size="18"
            :color="detail.message_style"
            @click="emit('evaluate', message.questionId, EMessageEvalution.none)"
          >
            <svg-icon
              :name="
                message.evaluation === EMessageEvalution.like ? 'good-active' : 'no-good-active'
              "
            />
          </el-icon>
          <!-- 录入正确答案 -->
          <div
            v-show="message.evaluation === EMessageEvalution.dislike && internalCorrectVisible"
            class="py-1 px-2 text-xs rounded-2xl border border-solid border-[#dcdfe6] hover:opacity-80"
            @click="emit('receiveQuestionAnswer', message)"
          >
            {{ $t('修正') }}
          </div>
        </div>
        <div v-else-if="isLast" class="flex items-center gap-2 mt-2">
          <svg-icon
            name="good-default"
            svg-class="w-4 h-4 text-[#303133] cursor-pointer transition-colors hover:!text-[var(--hoverColor)]"
            :style="{ '--hoverColor': detail.message_style }"
            @click="emit('evaluate', message.questionId, EMessageEvalution.like)"
          />
          <svg-icon
            name="no-good-default"
            svg-class="w-4 h-4 text-[#303133] cursor-pointer transition-colors hover:!text-[var(--hoverColor)]"
            :style="{ '--hoverColor': detail.message_style }"
            @click="emit('evaluate', message.questionId, EMessageEvalution.dislike)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.message-box {
  max-width: 100%;
  @apply min-h-[32px] py-3 px-4 leading-normal text-[#2f3447] whitespace-pre-wrap break-all bg-[#f2f3f5] rounded-tr-2xl rounded-bl-2xl rounded-tl-sm rounded-br-2xl text-left text-[15px];
}

.cursor-flash {
  width: 6px;
  height: 16px;
  background: #303133;
  animation: 0.6s flicker infinite;
}

@keyframes flicker {
  from {
    opacity: 0;
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}
</style>
