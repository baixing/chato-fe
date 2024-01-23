<template>
  <div :class="['flex items-start', isQuestionMessage && 'justify-end']">
    <div
      :class="[
        'message-box overflow-hidden w-auto scale-75',
        isQuestionMessage ? 'ml-12 !rounded-br-sm !rounded-tl-2xl' : 'mr-12'
      ]"
      :style="{
        backgroundColor: isQuestionMessage ? internalQuestionBg : '#f2f3f5',
        color: isQuestionMessage ? '#fff' : '#2f3447'
      }"
    >
      <div
        v-if="detectMarkdown(message.content)"
        v-html="renderMarkdown(message.content)"
        class="markdown-container-chato markdown-body"
      />
      <div
        v-else
        v-html="message.content"
        class="whitespace-pre-line break-words"
        style="word-break: break-word"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { EMessageDisplayType } from '@/enum/message'
import type { ICRMMessage } from '@/interface/message'
import { detectMarkdown, renderMarkdown } from '@/utils/markdown'
import { computed } from 'vue'

const props = defineProps<{
  message: ICRMMessage
  questionBg?: string
}>()

const isQuestionMessage = computed(() => props.message.display_type === EMessageDisplayType.answer)
const internalQuestionBg = computed(() => props.questionBg || 'auto')
</script>

<style lang="scss" scoped>
.message-box {
  @apply min-h-[32px] py-3 px-4 leading-normal text-[#2f3447] whitespace-pre-wrap break-all bg-[#f2f3f5] rounded-tr-2xl rounded-bl-2xl rounded-tl-sm rounded-br-2xl text-left text-[15px] max-w-full;
}
</style>
