<template>
  <div class="h-full container-preview-page bg-white relative flex flex-col">
    <div
      class="flex items-center justify-center h-14 bg-white mb-0 text-sm font-medium gap-2 shrink-0"
      style="border-bottom: 1px solid #eee"
    >
      <img
        :src="`https://afu-1255830993.cos.ap-shanghai.myqcloud.com/chato_image/Chato.png`"
        class="w-7 h-7 rounded-full shrink-0 overflow-hidden"
        alt=""
      />
      <span>{{ `Chato 导航助手` || '...' }}</span>
    </div>

    <div
      class="flex flex-col h-full w-full overflow-hidden"
      v-loading="isLoading"
      element-loading-background="#fffc"
    >
      <div v-if="false" class="empty h-full">
        {{ $t('请在下方输入框提问吧～') }}
      </div>
      <div v-else class="chat-history chat-center space-y-6" ref="refChatHistory">
        <!-- 机器人简介 -->
        <div class="chat-center quick-message-container mb-5">
          <div class="quick-span-desc">
            <img
              :src="`https://afu-1255830993.cos.ap-shanghai.myqcloud.com/chato_image/Chato.png`"
            />
            <div class="desc-right">
              <div class="desc-right-title">{{ `Chato浏览器` || '...' }}</div>
              <span>{{
                `欢迎来到Chato浏览器，您的智能对话伙伴。他会根据你的问题自动匹配最适合的智能机器人来解决你的疑问，所有匹配的机器人皆由Chato所打造。`
              }}</span>
            </div>
          </div>
        </div>
        <template v-for="(item, index) in history" :key="item.id">
          <MessageItem
            class="chat-center"
            v-if="item.displayType !== 'remove'"
            :isLast="index === history.length - 1 && !isLoadingAnswer"
            :message="item"
            :detail="{ message_style: '#7C5CFC' }"
            :isInternal="isInternal && isChatingPractice"
            :is-loading-answer="isLoadingAnswer"
            :correct-visible="false"
            @receive-question-answer="(mItem) => emit('correctAnswer', mItem)"
            @click-source="(questionId) => emit('showDrawer', questionId, botSlug)"
          />
        </template>
      </div>

      <div class="input-box chat-center">
        <el-tooltip
          :disabled="isMobile"
          :content="t(`清空历史消息`)"
          placement="top"
          :hide-after="0"
        >
          <span
            data-sensors-click
            id="Chato_chat_delete_click"
            :class="['input-icon-btn', true && '!hidden']"
            @click="emit('clear')"
          >
            <svg-icon name="chat-clear" svg-class="w-6 h-6 text-[#303133]" />
          </span>
        </el-tooltip>

        <div class="input-box-content">
          <el-input
            class="no-border-input"
            resize="none"
            type="textarea"
            :autosize="{ maxRows: 5 }"
            v-model="internalValue"
            :placeholder="t(inputPlaceholder)"
            :disabled="internalEnterDisabled"
            @click="emit('inputClick')"
            @keydown.enter="() => sendData()"
          />
          <el-tooltip :disabled="isMobile" :content="t(`发送`)" placement="top" :hide-after="0">
            <span
              :disabled="internalEnterDisabled"
              @click="() => sendData()"
              data-script="Chato-send-question"
              class="send-btn transition-colors"
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
        </div>
        <!-- <el-tooltip :disabled="isMobile" :content="t('语音输入')" placement="top" :hide-after="0">
          <span @click="onRecording" class="input-icon-btn">
            <svg-icon svg-class="w-6 h-6 text-[#303133]" name="chat-sound" />
          </span>
        </el-tooltip> -->
        <div
          v-show="internalEnterDisabled"
          class="absolute top-0 right-0 bottom-0 left-0 cursor-not-allowed bg-[#ffffffa3] z-[1]"
        />
        <div
          v-show="chatRecordingEnterVisible"
          :class="['recorder-container', footerBrandShow && '!-bottom-8']"
        >
          <el-icon size="16" color="#596780" class="close-icon">
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
        </div>

        <!-- <div
          class="flex gap-2 items-center justify-center px-5 overflow-hidden h-5"
          @click="() => emit('click')"
        >
          <span class="shrink-0 h-full">
            <img v-if="logo" :src="logo" class="h-full max-w-[66px] object-cover" />
          </span>
          <p class="text-[#596780] text-xs truncate leading-5">{{ name }}</p>
        </div> -->
      </div>
      <ChatFooter
        name="Powered by Chato"
        logo="https://afu-1255830993.cos.ap-shanghai.myqcloud.com/464739782773354496.png"
        :class="[
          'mb-2 leading-4 text-xs flex justify-center text-[#596780] text-center shrink-0',
          !isCustomerBrand && 'cursor-pointer'
        ]"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import MessageItem from '@/components/Chat/ChatMessageItem.vue'

import { useBase } from '@/stores/base'
const base = useBase()
const { userInfo } = storeToRefs(base)
import { storeToRefs } from 'pinia'
// import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import { useBasicLayout } from '@/composables/useBasicLayout'
const isLoadingAnswer = ref(false)
const refChatHistory = ref(null)
const isLoading = ref(true)
const internalEnterDisabled = false
const footerBrandShow = false
const isCustomerBrand = false
const chatRecordingEnterVisible = false
const isInternal = false
const { isMobile } = useBasicLayout()
//未展开
const scrollChatHistory = () => {
  nextTick(() => {
    const chatHistory = refChatHistory.value
    if (chatHistory) {
      chatHistory.scrollTop = chatHistory.scrollHeight
    }
  })
}
import { useI18n } from 'vue-i18n'
import ChatFooter from '@/components/Chat/ChatFooter.vue'
const { t } = useI18n()
const emit = defineEmits(['update:value', 'inputClick', 'clear', 'submit'])
// const props = defineProps<{
//   value: string
//   disabled?: boolean
//   lastQuestionId?: number
//   hiddenClear?: boolean
// }>()

const internalValue = ref('')
const inputPlaceholder = computed(() => '输入问题，换行可通过shift+回车')

let userId =
  userInfo.value['mobile'] !== undefined ? userInfo.value['mobile'] : localStorage.getItem('uid')
console.log('userId', userId)
const sendData = async () => {
  const temp = internalValue.value
  // 清空输入框
  internalValue.value = ''
  if (history.value.length === 10 && userId === localStorage.getItem('uid')) {
    ElMessage.warning(t('对话次数已用完，请登录后继续'))
    return
  }
  history.value.push({
    type: 'text',
    displayType: 'question',
    content: temp,
    status: 'done'
  })
  scrollChatHistory()
  if (temp.trim() === '') {
    return
  }
  const response = await fetch('https://test.api.chato.cn/chato/navigator/navigator_backend/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: 'chato.' + userId,
      question: temp.trim(),
      source: 'chato'
    })
  })
  const data = await response.json()
  const answer = data['message']
  history.value.push({
    type: 'text',
    displayType: 'answer',
    content: answer,
    status: 'done'
  })
  scrollChatHistory()
}
import { watch } from 'vue'
import { useStorage } from '@vueuse/core'

const history = ref([])
const freshHistory = async () => {
  const authToken = useStorage<string>('auth_token', '')
  if (authToken.value && !userInfo.value.id) return
  userId =
    userInfo.value['mobile'] !== undefined ? userInfo.value['mobile'] : localStorage.getItem('uid')

  try {
    const response = await fetch(
      'https://test.api.chato.cn/chato/navigator/navigator_backend/search',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'chato.' + userId })
      }
    )
    const data = await response.json()
    history.value = data
      .slice()
      .reverse()
      .map((item) => [
        {
          type: 'text',
          displayType: 'question',
          content: item.question,
          status: 'done'
        },
        {
          type: 'text',
          displayType: 'answer',
          content: item.answer,
          status: 'done'
        }
      ])
      .reduce((A, B) => [...A, ...B], [])
    isLoading.value = false
    scrollChatHistory()
  } catch (error) {
    console.error('Fetch error:', error)
  }
}

watch(base, freshHistory, { immediate: true })
</script>

<style lang="scss" scoped>
.input-box-content {
  @apply rounded-3xl py-1 pl-4 pr-1;

  flex: 1;
  display: flex;
  align-items: center;
  border: none;
  min-height: 44px;
  box-sizing: border-box;
}
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
    border: none;

    &::placeholder {
      color: #9da3af;
    }
  }

  :deep(.el-textarea.is-disabled .el-textarea__inner) {
    color: #303133;
    background-color: transparent;
  }
}

.chat-center {
  @apply px-[24%] lg:px-4 xl:px-[12%] 2xl:px-[18%];
}

.chat-history {
  @apply px-1 py-4;

  flex: auto 1 1;
  box-sizing: border-box;
  max-width: 100vw;
  overflow-x: hidden;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.quick-message-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  .quick-span-desc {
    @apply p-4 rounded-lg;

    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    width: 100%;
    flex-shrink: 0;
    line-height: 1.5;
    color: #2f3447;
    background-color: #f2f3f5;
    cursor: pointer;

    img {
      @apply w-14 h-14;

      border-radius: 100%;
      flex-shrink: 0;
      object-fit: cover;
    }

    .desc-right {
      @apply text-xs leading-5 ml-3;

      color: #596780;
      word-break: break-word;

      .desc-right-title {
        @apply mb-2 text-base;

        color: #3d3d3d;
        font-weight: 500;
      }
    }
  }
}

.empty {
  padding-top: 20vh;
  text-align: center;
  color: $color-minor;
  opacity: 0.5;
}

.quick-message-bottom {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: center;
  padding-top: 8px;

  .quick-item {
    @apply rounded-2xl leading-4 text-xs px-3 py-2 mr-1;

    background: #f2f3f5;
    cursor: pointer;

    &:last-of-type {
      margin-right: 0;
    }
  }
}
</style>
