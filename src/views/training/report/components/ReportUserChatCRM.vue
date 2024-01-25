<template>
  <div v-loading="initting" class="flex flex-col gap-3 w-full h-full overflow-hidden">
    <LoadingMore :visible="!initting && chatHistoryLoading" />
    <div ref="chatHistoryEl" class="w-full flex-1 overflow-auto space-y-3 chat-center">
      <template v-if="chatHistory.length">
        <ChatCRMMessage
          v-for="(item, index) in chatHistory"
          :key="`chatHistoryItem${index}`"
          :id="`chat-crm-msg-${index}`"
          :message="item"
          :question-bg="domainInfo.message_style"
        />
      </template>
      <el-empty v-else :description="$t('暂无聊天记录')" />
    </div>
    <div class="chat-center flex items-center gap-2 w-full">
      <el-button round @click="onChangeChatMode" class="!h-full !rounded-3xl">
        {{ $t(isHumanReply ? '转机器人' : '转人工') }}
      </el-button>
      <div v-if="isHumanReply" class="input-container">
        <el-input
          resize="none"
          type="textarea"
          :autosize="{ maxRows: 5 }"
          v-model="inputText"
          :placeholder="$t(inputPlaceholder)"
          @click="scrollChatHistoryBottom"
          @keydown.enter="onKeydownEnter"
        />
        <el-tooltip :content="$t(`发送`)" placement="top" :hide-after="0">
          <span
            @click="onSend"
            data-script="Chato-send-question"
            class="send-btn transition-colors pl-1"
          >
            <svg-icon
              :svg-class="[
                'w-6 h-6 text-[#B5BED0] transition-colors',
                inputText && '!text-[#7C5CFC]'
              ]"
              name="chat-send"
            />
          </span>
        </el-tooltip>
      </div>
      <div
        v-else
        class="input-container !min-h-[46px] bg-neutral-100 text-sm justify-center !px-0 !border-none"
      >
        {{ $t('机器人自动回复中...') }}
      </div>
    </div>
  </div>
  <CustomerFormDialog
    v-model:visible="customerFormState.visible"
    :form-id="customerFormState.formId"
    :title="customerFormState.title"
    :uid="customerFormState.uId"
  />
</template>

<script setup lang="ts">
import { getDomainReplySwitch, updateDomainReplySwitch } from '@/api/domain'
import { getCommonGraph } from '@/api/graph'
import CustomerFormDialog from '@/components/Customer/CustomerFormDialog.vue'
import LoadingMore from '@/components/LoadingMore/index.vue'
import { useBasicLayout } from '@/composables/useBasicLayout'
import { useSource } from '@/composables/useSource'
import { XSSOptions } from '@/constant/xss'
import { EMessageDisplayType } from '@/enum/message'
import type { ChatToBotRes } from '@/interface/chat'
import type { IPage } from '@/interface/common'
import type { ICRMMessage } from '@/interface/message'
import { useChatUserStore } from '@/stores/chatUser'
import { useDomainStore } from '@/stores/domain'
import { useScroll } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  toRaw,
  toRefs,
  watch
} from 'vue'
import xss from 'xss'
import ChatCRMMessage from './ChatCRMMessage.vue'

const props = defineProps<{
  uid: string
}>()

const emit = defineEmits(['send'])

const { isMobile } = useBasicLayout()
const { source } = useSource()
const chatUserStoreI = useChatUserStore()
const { chatUsersMap } = storeToRefs(chatUserStoreI)
const domainStoreI = useDomainStore()
const { domainInfo } = storeToRefs(domainStoreI)

const senderUID = computed(() => props.uid)
const inputPlaceholder = computed(() =>
  isMobile.value ? '请输入回复' : '输入回复内容，换行可通过shift+回车'
)

const customerFormState = reactive<{
  visible: boolean
  formId: string
  uId: string
  title: string
}>({
  visible: false,
  formId: '',
  uId: '',
  title: ''
})

const initting = ref(false)
const inputText = ref('')
const scrollBottom = ref(true)
const chatHistoryEl = ref<HTMLDivElement>()
const chatHistoryLoading = ref(false)
const chatHistory = computed(() => chatUsersMap.value.get(senderUID.value) || [])
const chatHistoryPagination = reactive<IPage>({
  page: 1,
  page_count: 1,
  page_size: 10,
  total: 0
})
const latestChatQuestionId = computed(() => chatHistory.value.at(-1)?.question_id || 0)

const onChangeChatMode = async () => {
  try {
    const updateHumanReplyValue = !isHumanReply.value
    await updateDomainReplySwitch({
      sender_uid: senderUID.value,
      domain_id: domainInfo.value.id,
      human_reply_switch: Number(updateHumanReplyValue)
    })
    isHumanReply.value = updateHumanReplyValue
  } catch (e) {}
}

const { arrivedState } = useScroll(chatHistoryEl, {
  behavior: 'smooth',
  offset: { top: 70 }
})
const { top: scrollToTop } = toRefs(arrivedState)

const onMoreChatHistory = async () => {
  if (chatHistoryPagination.page === chatHistoryPagination.page_count) {
    return
  }
  scrollBottom.value = false
  chatHistoryPagination.page++
  const { newCount } = await initChatHistory(chatHistoryPagination.page)
  document.getElementById(`chat-crm-msg-${newCount}`).scrollIntoView()
  nextTick(() => {
    scrollBottom.value = true
  })
}

watch(scrollToTop, (v) => {
  v && onMoreChatHistory()
})

let latestScrollHeight = 0
const scrollChatHistoryBottom = () => {
  nextTick(() => {
    if (!chatHistoryEl.value) {
      return
    }
    const { scrollHeight, scrollTop } = chatHistoryEl.value
    if (latestScrollHeight !== scrollHeight && scrollHeight > scrollTop) {
      latestScrollHeight = scrollHeight
      chatHistoryEl.value.scrollTo({
        top: scrollHeight,
        behavior: 'smooth'
      })
    }
  })
}

const initChatHistory = async (page = 1) => {
  try {
    chatHistoryLoading.value = true
    const {
      data: { data, pagination }
    } = await getCommonGraph<ChatToBotRes[]>('chato_questions', {
      filter: `sender_uid=="${senderUID.value}" and domain_id=="${domainInfo.value.id}"`,
      page: page,
      size: chatHistoryPagination.page_size,
      sort: '-id'
    })
    //  chatToBotHistoryC({
    //   sender_uid: senderUID.value,
    //   domain_slug: domainInfo.value.slug,
    //   page,
    //   page_size: chatHistoryPagination.page_size
    // })

    const newChatHistory = [...toRaw(chatHistory.value)]
    let newCount = 0
    data.forEach((item, index) => {
      const question: ICRMMessage = {
        id: uuidv4(),
        sender_uid: senderUID.value,
        display_type: EMessageDisplayType.question,
        content: item.question,
        question_id: item.id,
        source: item.source
      }
      const answer: ICRMMessage = {
        id: uuidv4(),
        sender_uid: senderUID.value,
        display_type: EMessageDisplayType.answer,
        content: item.answer,
        question_id: item.id,
        source: item.source
      }

      if (item.answer && !item.answer_deleted) {
        newChatHistory.unshift(answer)
        newCount++
      }

      if (item.question && !item.question_deleted) {
        newChatHistory.unshift(question)
        newCount++
      }
    })
    chatUserStoreI.setUserChatMessages(senderUID.value, newChatHistory)
    chatHistoryPagination.page = pagination.page
    chatHistoryPagination.page_count = pagination.page_count

    return { data, newCount }
  } catch (e) {
  } finally {
    chatHistoryLoading.value = false
  }
}

const onKeydownEnter = (e: KeyboardEvent) => {
  if (!e.shiftKey && e.keyCode === 13) {
    e.cancelBubble = true
    e.stopPropagation()
    e.preventDefault()
    onSend()
  }
}

const onSend = async () => {
  const text = String(inputText.value).trim()
  inputText.value = ''
  const xssFilterText = xss(text, XSSOptions)
  const newChatMessgae: ICRMMessage = {
    sender_uid: senderUID.value,
    content: xssFilterText,
    question_id: latestChatQuestionId.value,
    source: source.value,
    display_type: EMessageDisplayType.question
  }
  emit('send', newChatMessgae)
}

const onElClick = (event) => {
  const target = (event.target || event.srcElement) as HTMLElement
  if (target?.id === 'Chato-customer-collect-form') {
    event.stopPropagation()
    customerFormState.formId = target.getAttribute('data-form-id')
    customerFormState.uId = target.getAttribute('data-uid')
    customerFormState.visible = true
    customerFormState.title = target.innerText
  }
}

const isHumanReply = ref(false)

const initReplyConfig = async () => {
  try {
    const {
      data: { data }
    } = await getDomainReplySwitch(domainInfo.value.id, senderUID.value)
    isHumanReply.value = data
  } catch (e) {}
}

const init = async () => {
  try {
    initting.value = true
    chatHistoryPagination.page = 1
    chatHistoryPagination.page_count = 1
    chatUserStoreI.setUserChatMessages(senderUID.value, [])
    initReplyConfig()
    await initChatHistory()
  } catch (e) {
  } finally {
    initting.value = false
  }
}

watch(
  [() => domainInfo.value.slug, senderUID],
  ([slug, uid]) => {
    slug && uid && init()
  },
  { immediate: true }
)

watch(
  chatHistory,
  () => {
    scrollBottom.value && scrollChatHistoryBottom()
  },
  { immediate: true, deep: true }
)

onMounted(() => {
  document.addEventListener('click', onElClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onElClick)
})
</script>

<style lang="scss" scoped>
.chat-center {
  @apply px-3;
}

.input-container {
  @apply box-border rounded-3xl py-1 pl-4 pr-1 flex-1 flex items-center border border-solid border-[#e4e7ed] min-h-[44px];

  .send-btn {
    @apply w-9 h-9 cursor-pointer rounded-full box-border flex items-center justify-center shrink-0 hover:bg-[#f2f3f5];
    &:hover {
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
</style>
