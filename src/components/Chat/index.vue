<template>
  <div class="container-preview-page bg-white relative">
    <div
      v-if="detail.name_and_avatar_show"
      class="flex items-center justify-center h-14 bg-white mb-0 text-sm font-medium gap-2 shrink-0"
      style="border-bottom: 1px solid #eee"
    >
      <img
        :src="detail.avatar || DefaultAvatar"
        class="w-7 h-7 rounded-full shrink-0 overflow-hidden"
        alt=""
      />
      <span>{{ detail.name || '...' }}</span>
    </div>
    <div
      :class="['flex flex-col h-full w-full overflow-hidden', chatClassName]"
      v-loading="$isLoading"
      element-loading-background="#fffc"
    >
      <div v-if="!history.length" class="empty h-full">
        {{ $t('请在下方输入框提问吧～') }}
      </div>
      <div
        v-else
        class="chat-history chat-center space-y-6"
        @scroll="onChatHistoryScroll"
        ref="refChatHistory"
      >
        <!-- 机器人简介 -->
        <div v-if="detail.desc_show" class="quick-message-container mb-5">
          <div class="quick-span-desc">
            <img :src="detail.avatar || DefaultAvatar" />
            <div class="desc-right">
              <div class="desc-right-title">{{ detail.name || '...' }}</div>
              <span>{{ detail.desc }}</span>
            </div>
          </div>
        </div>
        <template v-for="(item, index) in history" :key="item.id">
          <MessageItem
            v-if="item.displayType !== 'remove'"
            :isLast="index === history.length - 1 && !isLoadingAnswer"
            :message="item"
            :detail="detail"
            :isInternal="isInternal && isChatingPractice"
            :is-loading-answer="isLoadingAnswer"
            :correct-visible="isInternal || (detail.qa_modifiable && !correctTicketExpired)"
            @evaluate="onEvaluate"
            @send-message="submit"
            @show-more-action="onShowMoreAction"
            @receive-question-answer="(mItem) => emit('correctAnswer', mItem)"
            @click-source="(questionId) => emit('showDrawer', questionId, botSlug)"
          />
          <el-divider v-else-if="item.displayType === 'remove'">
            <span class="divider-tip">{{ $t('已清除与历史消息的关联，开始全新的会话') }}</span>
          </el-divider>
        </template>
        <div
          v-show="!isLoadingAnswer && recommendQuestions.length"
          v-loading="recommendQuestionsLoading"
          class="!mt-4 space-y-2"
        >
          <div
            v-for="(item, index) in recommendQuestions"
            :key="`rq_${index}`"
            @click="onClickRecommend(item.question)"
            class="cursor-pointer px-4 py-1 text-[#2F3447] rounded-3xl text-sm leading-6 tracking-[0.13px] border border-solid border-[#E4E7ED] flex items-center justify-between gap-2 transition-opacity hover:opacity-80"
          >
            <span>{{ item.question }}</span>
            <el-icon :size="16"><Right /></el-icon>
          </div>
        </div>
        <div v-if="quotaUpperLimit" class="divider-desc-seesion">
          {{ $t('电力值不足，更多电力值请咨询产品顾问') }}
        </div>
      </div>

      <div
        v-show="isLoadingAnswer"
        data-sensors-click
        id="Chato_chat_stop_click"
        :data-sensors-question-id="sensorsQuestionId"
        class="shrink-0 mb-4 mt-3 mx-auto flex items-center gap-2 text-[#303133] text-xs cursor-pointer px-4 py-3 rounded-md bg-[#F2F3F5] w-fit hover:opacity-80"
        @click="onTerminateRetry"
      >
        <el-icon class="text-base"><VideoPause /></el-icon>{{ $t('终止') }}
      </div>

      <div v-if="detail.shortcuts?.length" class="chat-center quick-message-bottom relative">
        <span
          v-for="(item, index) in detailShortcutsArr"
          :key="index"
          class="quick-item"
          data-sensors-click
          id="Chato_chat_menu_click"
          :data-sensors-menu-name="item.title"
          @click="quickAnswerMessage(item)"
        >
          {{ item.title }}
        </span>
        <div
          v-show="isLoadingAnswer"
          class="absolute top-0 right-0 bottom-0 left-0 cursor-not-allowed bg-[#ffffffa3] z-[1]"
        ></div>
      </div>

      <ChatEnter
        v-model:value="inputText"
        :last-question-id="sensorsQuestionId"
        :hidden-clear="isMidJourneyDomain"
        :disabled="isLoadingAnswer"
        @input-click="scrollChatHistory"
        @clear="clearChatHistory"
        @submit="submit"
        class="chat-center"
      />
      <ChatFooter
        v-if="detail.brand_show"
        :name="detail.brand_name"
        :logo="detail.brand_logo"
        :class="[
          'mb-2 leading-4 text-xs flex justify-center text-[#596780] text-center shrink-0',
          !isCustomerBrand && 'cursor-pointer'
        ]"
        @click="onFooterBrandLink"
      />
    </div>
  </div>
  <ChatMessageMore
    :message="currentMessage"
    :actions="currentMoreActions"
    :position="currentMoreActionPosition"
    @send-message="submit"
    @receive-question-answer="(message) => emit('correctAnswer', message)"
    @play-audio="onPlayAudio"
    @delete-success="onDeleteSuccess"
    @translate-success="onTranslateSuccess"
    @like-dislike-success="onLikeDislikeSuccess"
  />
  <CustomerFormDialog
    v-model:visible="customerFormState.visible"
    :form-id="customerFormState.formId"
    :uid="customerFormState.uId"
  />
  <el-image-viewer v-if="showPreview" :url-list="[previewImageUrl]" @close="showPreview = false" />
  <AudioPlayer />
</template>

<script lang="ts" setup>
import {
  chatToBotHistoryB,
  chatToBotHistoryC,
  clearSession,
  evaluate,
  getChatRecommendQuestions
} from '@/api/chat'
import {
  checkDomainCorrectTicketIsExpired,
  getDomainDetailPublic,
  getDomainQuotaInPlatformC
} from '@/api/domain'
import DefaultAvatar from '@/assets/img/avatar.png'
import AudioPlayer from '@/components/AudioPlayer/index.vue'
import ChatEnter from '@/components/Chat/ChatEnter.vue'
import MessageItem from '@/components/Chat/ChatMessageItem.vue'
import CustomerFormDialog from '@/components/Customer/CustomerFormDialog.vue'
import useAudioPlayer from '@/composables/useAudioPlayer'
import useSSEAudio from '@/composables/useSSEAudio'
import { useSource } from '@/composables/useSource'
import useSpaceRights from '@/composables/useSpaceRights'
import { currentEnvConfig } from '@/config'
import {
  ChatMessageFinalStatus,
  ChatMessageMoreAction,
  SymChatDomainDetail,
  SymChatToken
} from '@/constant/chat'
import { DebugDomainSymbol, MidJourneyDomainSlug } from '@/constant/domain'
import { PaidCommercialTypes } from '@/constant/space'
import { XSSOptions } from '@/constant/xss'
import { EDomainConversationMode } from '@/enum/domain'
import {
  EMessageActionType,
  EMessageDisplayType,
  EMessageEvalution,
  EMessageType,
  EWsMessageStatus
} from '@/enum/message'
import { ESpaceRightsType } from '@/enum/space'
import type { ChatHistoryParams, IChatCommonParams } from '@/interface/chat'
import type { IDomainInfo } from '@/interface/domain'
import type { IMessageItem } from '@/interface/message'
import type { IRecommendQuestion } from '@/interface/question'
import type { ITTSParams } from '@/interface/tts'
import router, { RoutesMap } from '@/router'
import { useAuthStore } from '@/stores/auth'
import { useBase } from '@/stores/base'
import { useSSEStore } from '@/stores/sse'
import { formatChatMessageAnswer } from '@/utils/chat'
import { $notnull, copyPaste, randomString } from '@/utils/help'
import { convertToMarkdown, regReplaceA, removewRegReplaceA } from '@/utils/reg'
import SSE from '@/utils/sse'
import { getStringWidth } from '@/utils/string'
import { isURL } from '@/utils/url'
import shareWeixin from '@/utils/weixinShare'
import { useDebounceFn, useStorage } from '@vueuse/core'
import { ElMessage, ElMessageBox, ElNotification as Notification } from 'element-plus'
import 'highlight.js/styles/default.css'
import { random, remove } from 'lodash'
import { storeToRefs } from 'pinia'
import {
  computed,
  inject,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  reactive,
  ref,
  watch
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import Watermark from 'watermark-plus'
import xss from 'xss'
import ChatFooter from './ChatFooter.vue'
import ChatMessageMore from './ChatMessageMore.vue'

interface Props {
  internalProps?: boolean
  bSlug?: string
  isChatingPractice?: boolean
  isreadRouteParam?: boolean
  chatClassName?: string
  chatByAudio?: boolean
  type?: 'create'
  authLogin?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  internalProps: false,
  bSlug: '',
  isChatingPractice: false,
  isreadRouteParam: false
})

const debugDomain = inject<IDomainInfo>(DebugDomainSymbol, null)

const { t } = useI18n()
const sseStore = useSSEStore()
const { sseMsgResult } = storeToRefs(sseStore)
const { source } = useSource()
const route = useRoute()
const base = useBase()
const { userInfo } = storeToRefs(base)
const authStoreI = useAuthStore()
const { authToken, uid } = storeToRefs(authStoreI)
const emit = defineEmits(['showDrawer', 'correctAnswer'])
const botSlug = computed(() => {
  if (debugDomain?.slug) {
    return debugDomain.slug
  }
  return props.internalProps
    ? props.isreadRouteParam
      ? (route.params.botSlug as string)
      : props.bSlug
    : (route.params.botSlug as string)
})
const isInternal = props.internalProps || false // 是否处于 Chato 内部环境
const query_p = (route.query.p as string) || ''
const detail = ref<IDomainInfo>({} as IDomainInfo) // 机器人详情
const detailShortcutsArr = computed(() => {
  if (detail.value?.shortcuts) {
    return typeof detail.value?.shortcuts === 'string'
      ? JSON.parse(detail.value.shortcuts)
      : detail.value?.shortcuts
  } else {
    return []
  }
})
const refChatHistory = ref<HTMLDivElement>(null) // 聊天记录容器的 DOM 引用
const inputText = ref('')
const $isLoading = ref<boolean>(true) // 是否处于全屏加载状态
const history = ref<IMessageItem[]>([])
const inputLength = ref<number>(3000)
const continueTarget = ref<HTMLElement>(null)
const socketResult = ref({
  chunk_message: ''
})
const watermark = ref<Watermark>()
const showPreview = ref(false)
const previewImageUrl = ref('')
const sensorsQuestionId = computed(() => history.value?.[history.value.length - 1]?.questionId)

const DefaultChatHistoryPage = {
  total: 0,
  page_count: 0,
  currentTotal: 0
}
let chatHistoryPage = reactive({ ...DefaultChatHistoryPage })
const chatHistoryParams: ChatHistoryParams = reactive({
  page: 1,
  page_size: 10
})

const SSEInstance = new SSE()

// 水印
const watermarkFunc = () => {
  if (watermark.value) return
  watermark.value = new Watermark({
    content: userInfo.value.id || uid.value || 'chato',
    alpha: 0.01,
    onSuccess: () => {},
    onWatermarkNull: () => console.error('watermark error')
  })
  watermark.value.create()
}

// 是否是绘画机器人，通过对话的回答是否包含 mjImage 类型的消息
const isMidJourneyDomain = computed(() => {
  if (!MidJourneyDomainSlug || !detail.value) {
    return false
  }

  return detail.value.slug === MidJourneyDomainSlug
})

const scrollHistory = useDebounceFn(() => {
  if (!refChatHistory.value) return
  const elem = refChatHistory.value
  const { scrollTop } = elem
  if (Math.abs(scrollTop) <= 90) {
    // 翻页
    nextPageHistory()
  }
}, 100)

// 隐藏消息尾部的更多操作
const onHiddenChatMore = () => {
  if (currentMoreActionPosition.value?.top < 0) {
    return
  }

  currentMoreActionPosition.value = {
    top: -9999
  }
}

const onChatHistoryScroll = () => {
  onHiddenChatMore()
  scrollHistory()
}

function nextPageHistory() {
  if (chatHistoryPage.total === chatHistoryPage.currentTotal) return
  chatHistoryParams.page = chatHistoryParams.page + 1
  getHistoryChat(false)
}

let latestScrollHeight = 0
const scrollChatHistory = () => {
  nextTick(() => {
    if (!refChatHistory.value) {
      return
    }
    const { scrollHeight, scrollTop } = refChatHistory.value
    if (latestScrollHeight !== scrollHeight && scrollHeight > scrollTop) {
      latestScrollHeight = scrollHeight
      refChatHistory.value.scrollTo({
        top: scrollHeight,
        behavior: 'smooth'
      })
    }
  })
}

const quotaUpperLimit = ref(false)
const { checkRightsTypeNeedUpgrade } = useSpaceRights()

const checkQuotaInPlatformC = async () => {
  const {
    data: { data: domainQuota }
  } = await getDomainQuotaInPlatformC(botSlug.value)
  quotaUpperLimit.value = domainQuota.total === domainQuota.consumed
}

async function init() {
  $isLoading.value = true
  sseStore.$patch({ sseMsgId: '' })
  history.value = []
  chatHistoryParams.page = 1
  chatHistoryPage = Object.assign(chatHistoryPage, {
    ...DefaultChatHistoryPage
  })
  await getBotInfo()
  if (!isInternal) {
    await checkQuotaInPlatformC()
  }
  const historyChatList = await getHistoryChat()
  const sseMsgId = historyChatList.length ? historyChatList[0].id : ''
  sseStore.$patch({ sseMsgId })
  watermarkFunc()
}

function getBotInfo() {
  getDomainDetailPublic(botSlug.value)
    .then((res) => {
      detail.value = res.data?.data || {}
      document.title = detail.value.name
      if (
        [RoutesMap.chat.c, RoutesMap.chat.release].includes(route.name as string) &&
        EDomainConversationMode.audio === detail.value.conversation_mode
      ) {
        ElMessageBox.confirm(
          t('当前机器人开启了语音对话模式，为了保证您的对话体验，稍后会请求授权您的麦克风权限。'),
          t('温馨提示'),
          {
            confirmButtonText: t('知道了'),
            showCancelButton: false,
            type: 'warning',
            customClass: '!max-w-[470px]'
          }
        )
      }
      if (props.chatByAudio) {
        detail.value.conversation_mode = EDomainConversationMode.audio
      }
      detail.value.shortcuts =
        $notnull(res.data.data) && res.data.data.shortcuts
          ? JSON.parse(res.data.data.shortcuts)
          : []
      inputLength.value = detail.value.question_max_length
      !sseStore.isExistInPeddingDomains(botSlug.value) && sayWelcome()
      shareWeixinInit(detail.value)
      // 健硕需求p参数
      $notnull(query_p) ? submit(query_p) : ''
    })
    .catch((err) => {})
    .finally(() => {})
}

const scrollBottom = ref(true)

const getHistoryChat = async (scrollBottomTag = true) => {
  scrollBottom.value = scrollBottomTag
  isLoadingAnswer.value = false
  if (isInternal) {
    chatHistoryParams.sender = String(userInfo.value.id) || ''
  } else {
    chatHistoryParams.sender_uid = uid.value
  }
  chatHistoryParams.domain_slug = botSlug.value
  const chatToBotHistory = isInternal ? chatToBotHistoryB : chatToBotHistoryC

  try {
    const res = await chatToBotHistory(chatHistoryParams)
    chatHistoryPage.page_count = res.data.meta.pagination.page_count
    chatHistoryPage.total = res.data.meta.pagination.total
    const list = res.data.data
    chatHistoryPage.currentTotal = chatHistoryPage.currentTotal + list.length
    const newHistory = [...history.value]
    for (let i = 0; i < list.length; i++) {
      const list_item = list[i]
      const question: IMessageItem = {
        type: list_item.type,
        displayType: EMessageDisplayType.question,
        id: `${list_item.id}_q`,
        content: list_item.question,
        questionId: list_item.id,
        evaluation: list_item.evaluation,
        question: list_item.question,
        status: EWsMessageStatus.done
      }
      const answer: IMessageItem = {
        type: list_item.type,
        displayType: EMessageDisplayType.answer,
        id: `${list_item.id}_a`,
        content: formatChatMessageAnswer({ content: list_item.answer }),
        ref_source_len: list_item.ref_source_len,
        questionId: list_item.id,
        evaluation: list_item.evaluation,
        question: list_item.question,
        status:
          list_item.status === EWsMessageStatus.pending ? EWsMessageStatus.done : list_item.status,
        command: list_item.command
      }

      if (!list_item.answer_deleted) {
        newHistory.unshift(...[answer])
      }
      if (!list_item.question_deleted) {
        newHistory.unshift(...[question])
      }
    }

    history.value = newHistory

    // 放到 nextTick 更新：为了不影响正常发送消息滚动到底部的控制
    nextTick(() => {
      scrollBottom.value = true
    })

    return list
  } catch (e) {
  } finally {
    $isLoading.value = false
  }
}

function sayWelcome() {
  if (detail.value.welcome) {
    history.value.push({
      first: true,
      displayType: EMessageDisplayType.answer,
      id: `welcome-a`,
      isWelcome: true,
      content: regReplaceA(detail.value.welcome, {
        class: 'welcome-a',
        id: 'Chato_chat_label_click'
      })
    })
  }
}

const { initAudios, onResetPlayingAudio } = useAudioPlayer()
let lastAudioPlayerId = ''
const onPlayAudio = async (text: string, playerId: string) => {
  const TTSParams: ITTSParams = {
    text,
    audio_key: playerId,
    domain_slug: botSlug.value,
    token: chatToken.value,
    finish_reason: 'full'
  }

  await initAudios(TTSParams, lastAudioPlayerId)
  lastAudioPlayerId = playerId
}

const beforeSubmit = async () => {
  // 未登录状态资源广场对话数限制
  if (props.authLogin && !isInternal && history.value.length >= 6) {
    router.replace({ name: RoutesMap.auth.login })
    return false
  }
  // C 端对话额度限制，B 端对话额度限制走流式
  if (!isInternal && quotaUpperLimit.value) {
    ElMessage.warning(t('电力值不足，更多电力值请咨询产品顾问'))
    return false
  }
  return true
}

const submit = async (str = '') => {
  const beforeSubmitCheckRes = await beforeSubmit()
  const text = String(str || inputText.value).trim()

  // 无额度
  if (!beforeSubmitCheckRes) {
    console.error('无对话额度')
    return
  }

  if (!text) {
    inputText.value = ''
    return
  }

  if (getStringWidth(text) > Number(inputLength.value)) {
    Notification.warning(t('问题过长！'))
    return
  }

  // 发送消息时，隐藏终止标识
  isTerminated.value = false
  const msg_id = randomString(32)
  const _id = `${Date.now()}-${Math.random()}`
  inputText.value = ''
  const xssFilterText = xss(text, XSSOptions)
  history.value.push({
    displayType: EMessageDisplayType.question,
    msg_id,
    id: `${_id}-q`,
    content: xssFilterText
  })
  detail.value.show_recommend_question && initRecommendQuestions(xssFilterText)
  commonRequestSocket(xssFilterText, msg_id, _id)
  sseStore.updatePeddingDomains(botSlug.value)
  // 语音播放重置
  onResetPlayingAudio()
}

// 是否被终止
const isTerminated = ref(false)
// 是否正在加载回答的消息内容
const isLoadingAnswer = ref(false)

const chatToken = computed(() => (isInternal ? authToken.value : uid.value))
const needsSSEAudio = computed(
  () => EDomainConversationMode.audio === detail.value.conversation_mode
)
const chatCommonParams = computed<IChatCommonParams>(() => {
  return {
    domain_slug: detail.value.slug,
    token: chatToken.value,
    visitor_type: isInternal ? (props.isreadRouteParam ? 'chat' : 'owner') : 'vistor'
  }
})

// 触发终止和重试
const onTerminateRetry = async () => {
  if (isLoadingAnswer.value) {
    // 终止
    const lastAnswer = history.value[history.value.length - 1]
    if (lastAnswer.displayType !== EMessageDisplayType.answer) {
      Notification.error(t('终止失败：终止触发时，当前消息是预期以外的消息类型'))
      return
    }

    const terminateParams = {
      type: 'close',
      text: removewRegReplaceA(lastAnswer.content),
      cutoff_continue_qid: lastAnswer.questionId,
      ...chatCommonParams.value,
      fake_domain: debugDomain || undefined
    }

    sseStore.terminatedSSEResultMap(lastAnswer, detail.value.slug)
    await SSEInstance.request('/chato/chat/close', terminateParams)
    const SSEAudioDoneParams = {
      chunk_message: '',
      status: EWsMessageStatus.done,
      question_id: lastAnswer.questionId
    }
    needsSSEAudio.value &&
      (await SSETextToAudio({
        sseRes: SSEAudioDoneParams,
        domainSlug: botSlug.value,
        token: chatToken.value
      }))

    if (!lastAnswer.questionId) {
      lastAnswer.content = t('回答已终止')
      lastAnswer.status = EWsMessageStatus.done
      isLoadingAnswer.value = false
      return
    }

    isTerminated.value = true
  }
  isLoadingAnswer.value = false
}

watch(isTerminated, (v) => {
  if (v) {
    const optMsg = history.value[history.value.length - 1]
    // 触发了终止且当前机器人不是 MidJourney，消息后接上继续
    if (!isMidJourneyDomain.value) {
      optMsg.content += regReplaceA(t('#继续#'), {
        class: 'answer-continue',
        'data-cid': optMsg.msg_id || optMsg.questionId
      })
    }
    optMsg.status = EWsMessageStatus.done
  } else if (!isLoadingAnswer.value) {
    let newHistory = [...history.value]
    newHistory = newHistory.map((item) => {
      if (!item.first && item.displayType === EMessageDisplayType.answer) {
        item.content = removewRegReplaceA(item.content)
      }
      return item
    })
    history.value = newHistory
  }
})

function doRequest(message) {
  // 在 Chato 内部和外部，聊天行为差异：
  // - 内部走 authToken；在外部使用 uid
  // - 内部和外部使用不同接口
  // - 内部使用 id 来确定机器人，外部使用 slug 来确定机器人
  socketResult.value = {
    chunk_message: ''
  }

  // 发送请求重置状态：加载回答为是，终止为否
  isLoadingAnswer.value = true
  isTerminated.value = false
  scrollChatHistory()
  sendMsgRequest(message)
}

const { SSETextToAudio } = useSSEAudio()

async function sendMsgRequest(message) {
  const params = {
    ...message,
    type: isMidJourneyDomain.value ? 'mj_image' : 'chat',
    source: source.value,
    ...chatCommonParams.value,
    navit_msg_id: isMidJourneyDomain.value ? random(1000000, 9999999) : undefined,
    fake_domain: debugDomain || undefined
  }

  sseStore.$patch({ sseMsgId: message.msg_id })
  try {
    let sseUrl = '/chato/sse'
    isMidJourneyDomain.value && (sseUrl += '/mj')
    const SSEFetching = SSEInstance.request(
      sseUrl,
      params,
      async (res) => {
        sseStore.setSSEResultMap(res)
        needsSSEAudio.value &&
          (await SSETextToAudio({ sseRes: res, domainSlug: botSlug.value, token: chatToken.value }))
      },
      {
        responseAll: true
      }
    )
    sseStore.setAbortControllerMap(detail.value.slug, SSEInstance.abortCtrl)
    await SSEFetching
  } catch (err) {
    history.value[history.value.length - 1].status = EWsMessageStatus.error
    history.value[history.value.length - 1].content = err
    isLoadingAnswer.value = false
  }
}

const generateMessage = (data) => {
  isLoadingAnswer.value = ChatMessageFinalStatus.includes(data.status) ? false : true
  continueTarget.value && (continueTarget.value.innerText = t('继续'))
  // socket 返回消息需要更改的问题和答案 index
  let currentQuestionIndex: number
  let currentAnswerIndex: number
  history.value.map((item, index) => {
    if (item?.msg_id === data.msg_id || item?.questionId === data.question_id) {
      if (item.displayType === EMessageDisplayType.question) {
        currentQuestionIndex = index
      } else if (item.displayType === EMessageDisplayType.answer) {
        currentAnswerIndex = index
      }
    }
  })

  if (isNaN(Number(currentQuestionIndex)) || isNaN(Number(currentAnswerIndex))) {
    return
  }

  const currentProgress = history.value[currentAnswerIndex].progress || 0

  const currentAnswer: IMessageItem = {
    ...history.value[currentAnswerIndex],
    type: data.type,
    content: data.chunk_message,
    status: data.status,
    ref_source_len: data.ref_source_len,
    questionId: data.question_id,
    evaluation: null,
    progress: data.progress > currentProgress ? data.progress : currentProgress,
    command: data.command
  }

  if (data.finish_reason === 'length') {
    currentAnswer.content += regReplaceA(t('#继续#'), {
      class: 'answer-continue',
      'data-cid': data.msg_id
    })
  }

  if (ChatMessageFinalStatus.includes(data.status)) {
    // 对话无额度，权益弹窗
    if (EWsMessageStatus.forbid_quota === data.status) {
      const quotaType = isMidJourneyDomain.value
        ? ESpaceRightsType.paintQuota
        : ESpaceRightsType.quota
      checkRightsTypeNeedUpgrade(quotaType)
    }
  }

  history.value[currentAnswerIndex] = currentAnswer

  history.value[currentQuestionIndex] = {
    ...history.value[currentQuestionIndex],
    questionId: data.question_id
  }
}

// 特殊处理：继续
function commonRequestSocket(text: string, msg_id: string, _id: string) {
  // 先发一条友好的回复
  setTimeout(() => {
    history.value.push({
      displayType: EMessageDisplayType.answer,
      msg_id,
      id: `${_id}-a`,
      content: '',
      status: EWsMessageStatus.pending,
      question: text
    })
    setTimeout(() => {
      doRequest({ text: text, msg_id })
    }, 0)
  }, 500)
}

// 赞和踩
const onEvaluate = async (questionId: number, evValue: EMessageEvalution) => {
  try {
    const current = history.value.find(
      (item) => item.questionId === questionId && item.displayType === EMessageDisplayType.answer
    )
    if (!current) {
      return
    }

    if (current.evaluation === evValue) {
      current.evaluation = null
    } else {
      current.evaluation = evValue
    }
    await evaluate(questionId, { evaluation: current.evaluation })
  } catch (e) {}
}

// 清除历史对话记录关联，slug 参数透传基于展馆需求，临时 hard code，后期可直接 del
const onClearHistoryRelation = async (slug?: string) => {
  const params = {
    visitor_type: isInternal ? 'owner' : 'vistor',
    domain_slug: slug || detail.value.slug,
    token: chatToken.value
  }
  const res = await clearSession(params)

  return res
}

// 清除会话记录
async function clearChatHistory() {
  const lastHistory = history.value.slice(-1)
  if (!lastHistory.length || lastHistory[0].displayType === EMessageDisplayType.remove) return
  try {
    const { data } = await onClearHistoryRelation()
    if (data.code === 200) {
      const newHistory = [...history.value]
      const newHistoryLastIndex = newHistory.length - 1
      if (newHistory[newHistoryLastIndex].content) {
        newHistory[newHistoryLastIndex].content = removewRegReplaceA(
          newHistory[newHistoryLastIndex].content
        )
      }

      newHistory.push({
        id: randomString(32),
        displayType: EMessageDisplayType.remove
      })

      recommendQuestions.value = []
      history.value = newHistory
    } else {
      Notification.error(data.msg)
    }
  } catch (err) {}
}

const correctTicketExpired = ref(true)

const checkCorrectTicketExpired = async () => {
  if (route.name !== RoutesMap.chat.release || !route.query.ticket) {
    return
  }

  const {
    data: { data }
  } = await checkDomainCorrectTicketIsExpired({
    ticket: route.query.ticket,
    slug: botSlug.value
  })
  correctTicketExpired.value = data
}

const currentMessage = ref<IMessageItem>()
const currentMoreActionPosition = ref()

const currentMoreActions = computed<EMessageActionType[]>(() => {
  if (!route.name || !currentMessage.value) {
    return []
  }

  let currentActionType
  if (isMidJourneyDomain.value) {
    currentActionType = 'viewMidjourney'
  } else {
    currentActionType = route.name === RoutesMap.chat.release ? 'viewC' : 'viewTranning'
  }

  const currentMessageIndex = history.value.findIndex((item) => item.id === currentMessage.value.id)
  const isLastQuestion = currentMessageIndex === history.value.length - 1

  let actions = ChatMessageMoreAction[currentActionType][currentMessage.value.displayType]

  if (!isLastQuestion) {
    actions = actions.filter((item) => item !== EMessageActionType.expand)
  }

  if (!currentMessage.value.questionId) {
    actions = actions.filter((item) => item !== EMessageActionType.delete)
  }

  if (currentActionType === 'viewC' && actions?.length) {
    actions = actions.filter((item) =>
      detail.value.qa_modifiable && !correctTicketExpired.value
        ? true
        : item !== EMessageActionType.fix
    )
  }

  return actions
})

// 消息尾部的更多操作
const onShowMoreAction = (message: IMessageItem, position) => {
  currentMessage.value = message
  currentMoreActionPosition.value = position
}

function quickAnswerMessage(obj, wel = false) {
  if (isURL(obj.response)) {
    return window.open(`/link?target=${obj.response}`)
  }
  history.value.push({
    displayType: EMessageDisplayType.question,
    msg_id: randomString(32),
    id: `${randomString(32)}-q`,
    content: obj.title
  })
  if (wel) return
  const timer = setTimeout(() => {
    if (obj.response) {
      history.value.push({
        displayType: EMessageDisplayType.answer,
        msg_id: randomString(32),
        id: `${randomString(32)}-a`,
        type: EMessageType.text,
        content: convertToMarkdown(
          obj.response,
          $notnull(obj.images) ? obj.images : $notnull(obj.image) ? [obj.image] : []
        )
      })
    }
    clearInterval(timer)
  }, 100)
}

function shareWeixinInit(detail) {
  const shareObj = {
    title: detail.name,
    link: encodeURI(location.href),
    desc: detail.desc,
    imgUrl: detail.avatar
  }
  shareWeixin(shareObj)
}

// 底部品牌设置
const isCustomerBrand = computed(() => PaidCommercialTypes.includes(detail.value.org?.type))

const handleCopyButtonClick = (e) => {
  e.stopPropagation()
  copyPaste(e.target.querySelector('.text').innerHTML)
}

const onFooterBrandLink = () => {
  if (isCustomerBrand.value) {
    return
  }

  if (window.self !== window.top) {
    window.top.location.href = currentEnvConfig.wwwBaseURL
  } else {
    router.push('/')
  }
}

const onDeleteSuccess = (questionId: number, messageDisplayType: EMessageDisplayType) => {
  remove(
    history.value,
    (item) => item.questionId === questionId && item.displayType === messageDisplayType
  )
}

const onTranslateSuccess = (questionId: number, text: string) => {
  const cur = history.value.find(
    (item) => item.questionId === questionId && item.displayType === EMessageDisplayType.answer
  )
  cur && (cur.translate = text)
}

const onLikeDislikeSuccess = (questionId: number, likeVal: EMessageEvalution) => {
  const cur = history.value.find(
    (item) => item.questionId === questionId && item.displayType === EMessageDisplayType.answer
  )
  cur && (cur.evaluation = likeVal)
}

const chatHisListener = (event) => {
  const target = event.target
  if (target instanceof HTMLElement) {
    const content = target.getAttribute('data-chref')
    const msg_id = target.getAttribute('data-cid')

    if (target.classList.contains('welcome-a') && $notnull(content) && !isLoadingAnswer.value) {
      submit(content)
    }
    if (
      target.classList.contains('answer-continue') &&
      $notnull(content) &&
      target.innerText !== '...'
    ) {
      continueTarget.value = target
      // 继续加载回答
      target.innerText = '...'
      isLoadingAnswer.value = true
      history.value[history.value.length - 1].status = EWsMessageStatus.continue
      doRequest({
        text: content,
        msg_id,
        cutoff_continue_qid: history.value[history.value.length - 1].questionId
      })
    }
  }
}

const customerFormState = reactive<{
  visible: boolean
  formId: string
  uId: string
}>({
  visible: false,
  formId: '',
  uId: ''
})

const onElClick = (event) => {
  onHiddenChatMore()
  const target = event.target || event.srcElement
  if (target?.id === 'Chato-customer-collect-form') {
    event.stopPropagation()
    customerFormState.formId = target.getAttribute('data-form-id')
    customerFormState.uId = target.getAttribute('data-uid')
    customerFormState.visible = true
  }
}

const recommendQuestionsLoading = ref(false)
const recommendQuestions = ref<IRecommendQuestion[]>([])

const initRecommendQuestions = async (question: string) => {
  try {
    recommendQuestions.value = []
    recommendQuestionsLoading.value = true
    const {
      data: { data }
    } = await getChatRecommendQuestions({ ...chatCommonParams.value, question })
    recommendQuestions.value = data.recommends
    scrollChatHistory()
  } catch (e) {
  } finally {
    recommendQuestionsLoading.value = false
  }
}

const onClickRecommend = (ques: string) => {
  submit(ques)
  recommendQuestions.value = []
}

watch(refChatHistory, (v) => {
  v && v.addEventListener('click', chatHisListener)
})

watch(
  history,
  () => {
    scrollBottom.value && scrollChatHistory()
  },
  { deep: true }
)

let observer

onMounted(() => {
  document.addEventListener('click', onElClick)

  observer = new MutationObserver((mutationsList) => {
    for (let mutation of mutationsList) {
      if (mutation.type === 'childList') {
        const copyBtns = document.querySelectorAll('.copy-btn-code')
        // 移除旧的点击事件监听器
        copyBtns.forEach((btn) => {
          btn.removeEventListener('click', handleCopyButtonClick)
        })

        // 添加新的点击事件监听器
        copyBtns.forEach((btn) => {
          btn.addEventListener('click', handleCopyButtonClick)
        })
      }
    }
  })

  observer.observe(document.body, { childList: true, subtree: true })

  window.showPreview = (imageUrl: string) => {
    previewImageUrl.value = imageUrl
    showPreview.value = true
  }
})

onBeforeUnmount(() => {
  observer.disconnect()
  document.removeEventListener('click', onElClick)
  refChatHistory.value?.removeEventListener('click', chatHisListener)
  watermark.value && watermark.value.destroy()
})

watch(
  botSlug,
  (v) => {
    recommendQuestions.value = []
    if (v) {
      init()
    } else {
      $isLoading.value = false
    }
  },
  { immediate: true }
)

watch(
  () => route.query.ticket,
  () => checkCorrectTicketExpired(),
  { immediate: true }
)

watch(
  sseMsgResult,
  (v) => {
    v && generateMessage(v)
  },
  { deep: true }
)

watch(
  debugDomain,
  (v) => {
    if (!v) {
      return
    }

    detail.value = { ...detail.value, ...v }
    if (!v.show_recommend_question && recommendQuestions.value.length) {
      recommendQuestions.value = []
    }

    if (v.welcome) {
      const hisWelcomeItem = history.value.find((item) => item.isWelcome)
      if (hisWelcomeItem) {
        hisWelcomeItem.content = regReplaceA(v.welcome, {
          class: 'welcome-a',
          id: 'Chato_chat_label_click'
        })
      } else if (props.type) {
        sayWelcome()
      }
    } else {
      const newHistory = history.value.filter((item) => !item.isWelcome)
      history.value = newHistory
    }
  },
  { immediate: true, deep: true }
)

provide(SymChatDomainDetail, detail)
provide(SymChatToken, chatToken)

defineExpose({
  onClearHistoryRelation
})
</script>
<style lang="scss" scoped>
.chat-history {
  @apply px-1 py-4;
  flex: auto 1 1;
  box-sizing: border-box;
  max-width: 100vw;
  overflow-x: hidden;
  overflow-y: auto;
}

.chat-center {
  @apply px-[24%] lg:px-4 xl:px-[12%] 2xl:px-[18%];
}
.container-preview-page {
  width: 100%;
  margin: 0 auto;
  overflow: hidden;
  height: 100%;
  touch-action: manipulation;
  display: flex;
  flex-direction: column;
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

.divider-tip {
  @apply text-xs;
  color: #dcdfe6;
}

.divider-desc-seesion {
  @apply mb-3 rounded-lg text-xs;
  text-align: center;
  color: #9da3af;
}

.empty {
  padding-top: 20vh;
  text-align: center;
  color: $color-minor;
  opacity: 0.5;
}
</style>
