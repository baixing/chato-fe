<template>
  <div class="container-preview-page bg-white relative parent-element">
    <div
      v-if="detail.name_and_avatar_show && avatarShow"
      class="flex items-center justify-center h-14 bg-white mb-0 text-sm font-medium gap-2 shrink-0"
      style="border-bottom: 1px solid #eee"
    >
      <Avatar
        :avatar="detail.avatar || DefaultAvatar"
        :size="28"
        :name="detail.name.slice(0, 2)"
        class="w-7 h-7 rounded-full shrink-0 overflow-hidden"
      />
      <span>{{ detail.name.slice(0, 11) || '...' }}</span>
      <span
        class="flex w-fit cursor-pointer rounded-full absolute z-[999] top-0 right-0 h-14 items-center text-base pr-5"
      >
        <svg-icon
          @click="copyText(link)"
          name="share"
          svg-class="text-[#303133] mt-1 mr-1 w-6 h-6"
        />
        <svg-icon
          v-show="!isInternal && !!detail.customer_limit.payment_limit_switch"
          @click="chatMoreVisible = true"
          name="more"
          svg-class="text-[#303133] mt-1 ml-2 w-6 h-6"
        />
      </span>
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
            :correct-visible="
              (!isResource && isInternal) || (detail.qa_modifiable && !correctTicketExpired)
            "
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
            v-for="(item, index) in recommendQuestions.filter((_, index) => index < 3)"
            data-sensors-click
            id="Chato_chat_recommend_question_click"
            :data-sensors-recommend-base-question="recommendBaseQuestion"
            :data-sensors-recommend-click-question="item.question"
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
        :needAiGenerate="needAiGenerate"
        :is-ai-generate="isAiGenerate"
        :on-is-ai-generate="(v) => (isAiGenerate = v)"
        @input-click="scrollChatHistory"
        @clear="clearChatHistory"
        @submit="submit"
        @onTerminateRetry="onTerminateRetry"
        class="chat-center"
      />
      <ChatFooter
        v-if="detail.brand_show && brandShow"
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
    :title="customerFormState.title"
    :uid="customerFormState.uId"
  />
  <ChatMoreNavigator
    :domainInfo="detail"
    v-model:value="chatMoreVisible"
    @handleActivatePackage="payModalVisible = true"
  />
  <ChatPayModal :domainInfo="detail" v-model:value="payModalVisible" />
  <AudioPlayer />
</template>

<script lang="ts" setup>
import { postWeixinH5Login } from '@/api/auth'
import { clearSession, getChatRecommendQuestions } from '@/api/chat'
import {
  checkDomainCorrectTicketIsExpired,
  getDomainDetailPublic,
  getDomainQuotaInPlatformC
} from '@/api/domain'
import { getCommonGraph, postCommonGraph } from '@/api/graph'
import DefaultAvatar from '@/assets/img/avatar.png'
import AudioPlayer from '@/components/AudioPlayer/index.vue'
import ChatEnter from '@/components/Chat/ChatEnter.vue'
import MessageItem from '@/components/Chat/ChatMessageItem.vue'
import CustomerFormDialog from '@/components/Customer/CustomerFormDialog.vue'
import useAudioPlayer from '@/composables/useAudioPlayer'
import useGlobalProperties from '@/composables/useGlobalProperties'
import useSSEAudio from '@/composables/useSSEAudio'
import { useSource } from '@/composables/useSource'
import useSpaceRights from '@/composables/useSpaceRights'
import { useWebSocketConnect } from '@/composables/useWebSocket'
import { currentEnvConfig } from '@/config'
import {
  ChatMessageFinalStatus,
  ChatMessageMoreAction,
  SymChatDomainDetail,
  SymChatToken
} from '@/constant/chat'
import { CHATO_BAIXING_APP_ID } from '@/constant/common'
import { DebugDomainSymbol, MidJourneyDomainSlug } from '@/constant/domain'
import { PaidCommercialTypes } from '@/constant/space'
import { XSSOptions } from '@/constant/xss'
import { EDomainConversationMode, EDomainConversationModeArousalMethod } from '@/enum/domain'
import {
  EMessageActionType,
  EMessageDisplayType,
  EMessageEvalution,
  EMessageType,
  EWsMessageStatus
} from '@/enum/message'
import { EWeixinH5LoginType } from '@/enum/order'
import { ESpaceRightsType } from '@/enum/space'
import type { ChatHistoryParams, ChatToBotRes, IChatCommonParams } from '@/interface/chat'
import type { IDomainInfo } from '@/interface/domain'
import type { IMessageItem } from '@/interface/message'
import type { IRecommendQuestion } from '@/interface/question'
import type { ITTSParams } from '@/interface/tts'
import router, { RoutesMap } from '@/router'
import { useAuthStore } from '@/stores/auth'
import { useBase } from '@/stores/base'
import { cuserStore } from '@/stores/cuser'
import { useSocketStore } from '@/stores/socket'
import { formatChatMessageAnswer } from '@/utils/chat'
import {
  $notnull,
  copyPaste,
  isWechat,
  onRouteWeixinDefaultLogin,
  randomString
} from '@/utils/help'
import { convertToMarkdown, regReplaceA, removewRegReplaceA } from '@/utils/reg'
import SSE from '@/utils/sse'
import { getStringWidth } from '@/utils/string'
import { isURL } from '@/utils/url'
import shareWeixin from '@/utils/weixinShare'
import { useDebounceFn } from '@vueuse/core'
import dayjs from 'dayjs'
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
import { BlindWatermark, Watermark } from 'watermark-js-plus'
import wx from 'weixin-js-sdk'
import xss from 'xss'
import ChatFooter from './ChatFooter.vue'
import ChatMessageMore from './ChatMessageMore.vue'
import ChatMoreNavigator from './ChatMoreNavigator.vue'

interface Props {
  internalProps?: boolean
  bSlug?: string
  isChatingPractice?: boolean
  isreadRouteParam?: boolean
  chatClassName?: string
  chatByAudio?: boolean
  type?: 'create'
  authLogin?: boolean
  avatarShow?: boolean
  isResource?: boolean
  needAiGenerate?: boolean
  brandShow?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  internalProps: false,
  bSlug: '',
  isChatingPractice: false,
  isreadRouteParam: false,
  avatarShow: true,
  isResource: false,
  needAiGenerate: false,
  brandShow: true
})

const debugDomain = inject<IDomainInfo>(DebugDomainSymbol, null)
const { t } = useI18n()
const userStore = cuserStore()
const { loginUserId, loginStatus } = storeToRefs(userStore)
const { source, sourceID } = useSource()
const route = useRoute()
const base = useBase()
const isAiGenerate = ref(false)
const { userInfo } = storeToRefs(base)
const authStoreI = useAuthStore()
const { authToken, uid } = storeToRefs(authStoreI)
const emit = defineEmits(['showDrawer', 'correctAnswer'])
const { $sensors, $copyText } = useGlobalProperties()
// 是否正在加载回答的消息内容
const isLoadingAnswer = ref(false)

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
const watermark = ref<Watermark>()
const blindWatermark = ref<BlindWatermark>()
const sensorsQuestionId = computed(() => history.value?.[history.value.length - 1]?.questionId)
const chatMoreVisible = ref(false)
const payModalVisible = ref(Boolean(route.query.pay || false))

const redirectCode = computed(() => (route.query.code as string) || '')
const currentEnvIsWechat = isWechat()

const DefaultChatHistoryPage = {
  total: 0,
  page_count: 0,
  currentTotal: 0
}
let chatHistoryPage = reactive({ ...DefaultChatHistoryPage })
const chatHistoryParams: ChatHistoryParams = reactive({
  page: 1,
  size: 10
})

const SSEInstance = new SSE()
const socketStore = useSocketStore()
// JS 嵌入转人工客服：未登录时，增加 uid 为 token 标识
const socketURL = computed(() =>
  authToken.value && route.name !== RoutesMap.chat.release
    ? currentEnvConfig.socketURL
    : `${currentEnvConfig.socketURL}?token=${uid.value}`
)
const socketInstance = useWebSocketConnect(socketURL.value)
const { socketResultMap } = storeToRefs(socketStore)

const link = computed(
  () =>
    `${window.location.origin}/${detail.value.org.id === 208 ? 'bot' : 'b'}/${detail.value.slug}`
)

const copyText = (str: string) => {
  scanCodeSuccessRBI()
  $copyText(str, '链接已复制成功，快分享给你的好友吧')
}

watch(isAiGenerate, (v) => v && successRBI() && onAIGenerate())

const onAIGenerate = async () => {
  try {
    const promptStr = inputText.value
    let resStr = ''
    inputText.value = ''

    await SSEInstance.request(
      '/prompt/generated',
      {
        role: detail.value.name,
        system_prompt: detail.value.system_prompt,
        user_prompt: promptStr,
        generate_type: '欢迎语'
      },
      (str) => {
        resStr += str
        const parts = resStr.split('#')
        if (parts[2] !== null) {
          inputText.value = parts[1]
        }
      }
    )
  } catch (e) {
  } finally {
    submit()
  }
}

// ---- 业务打点-----
const scanCodeSuccessRBI = () => {
  $sensors?.track('chat_share', {
    name: t('分享成功'),
    type: 'chat_share',
    data: {
      time: dayjs().format('YYYY-MM-DD HH:mm:ss')
    }
  })
}
// ----------------
const successRBI = () => {
  $sensors?.track('automatic_generated', {
    name: t('自动生成'),
    type: 'automatic_generated',
    data: {
      time: dayjs().format('YYYY-MM-DD HH:mm:ss')
    }
  })
  return true
}

// 水印
const watermarkFunc = () => {
  if (!blindWatermark.value) {
    blindWatermark.value = new BlindWatermark({
      contentType: 'multi-line-text',
      content: userInfo.value.id?.toString() || uid.value?.toString() || 'chato',
      rotate: 30,
      onSuccess: () => {}
    })
    blindWatermark.value.create()
  }

  if (!watermark.value) {
    watermark.value = new Watermark({
      parent: '.parent-element',
      fontColor: '#e4e5e5',
      fontSize: '12px',
      rotate: 30,
      content: '内容由AI生成仅供参考',
      onSuccess: () => {}
    })
    watermark.value.create()
  }
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
const scrollChatHistory = useDebounceFn(() => {
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
}, 1300)

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
  history.value = []
  chatHistoryParams.page = 1
  chatHistoryPage = Object.assign(chatHistoryPage, {
    ...DefaultChatHistoryPage
  })
  await getBotInfo()
  if (!isInternal) {
    await checkQuotaInPlatformC()
  }
  await getHistoryChat()
  watermarkFunc()
  if (currentEnvIsWechat && !!detail.value.customer_limit.payment_limit_switch) {
    wx.miniProgram.getEnv(function (res) {
      if (!res.miniprogram && location.host.includes('chato.cn')) {
        onWeixinH5DefaultLogin()
      }
    })
  }
}

function getBotInfo() {
  getDomainDetailPublic(botSlug.value)
    .then((res) => {
      detail.value = res.data?.data || {}
      document.title = detail.value.name
      if (
        [RoutesMap.chat.c, RoutesMap.chat.release].includes(route.name as string) &&
        EDomainConversationMode.audio === detail.value.conversation_mode &&
        EDomainConversationModeArousalMethod.AutomaticSpeechRecognition ===
          detail.value.conversation_arouse_mode
      ) {
        ElMessageBox.confirm(
          t('当前机器人开启了自动语音对话，将会实时主动检索声音'),
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
      !socketStore.isExistInPeddingDomains(botSlug.value) && sayWelcome()
      shareWeixinInit(detail.value)
      // 健硕需求p参数
      $notnull(query_p) ? submit(query_p) : ''
    })
    .catch(() => {})
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
  // const chatToBotHistory = isInternal ? chatToBotHistoryB : chatToBotHistoryC

  try {
    const { data } = await getCommonGraph<IDomainInfo[]>('chato_domains', {
      filter: `slug=="${chatHistoryParams.domain_slug}"`
    })

    const res = await getCommonGraph<ChatToBotRes[]>('chato_questions', {
      filter: `${
        isInternal
          ? `sender_id=="${chatHistoryParams.sender}" and org_id=="${userInfo.value.org.id}"`
          : `sender_uid=="${chatHistoryParams.sender_uid}"`
      } and domain_id=="${data.data[0].id}"`,
      page: chatHistoryParams.page,
      size: chatHistoryParams.size,
      sort: '-id'
    })
    // chatToBotHistory(chatHistoryParams)
    chatHistoryPage.page_count = res.data.pagination.page_count
    chatHistoryPage.total = res.data.pagination.total
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
        ref_source_len: list_item.ref_source.length ? JSON.parse(list_item.ref_source).length : 0,
        questionId: list_item.id,
        evaluation: list_item.evaluation,
        question: list_item.question,
        status: list_item.status,
        command: list_item.command
      }

      if (!list_item.answer_deleted && list_item.status !== EWsMessageStatus.pending) {
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
    console.log(e)
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
    ElMessage.warning(t('对话次数已用完，请登录后继续'))
    $sensors?.track('square_chat_login', {
      name: t('资源广场跳转登录'),
      type: 'square_chat_login',
      data: {
        time: dayjs().format('YYYY-MM-DD HH:mm:ss')
      }
    })
    router.replace({ name: RoutesMap.auth.login, query: { redirect: `/bot/${botSlug.value}` } })
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
    msg_id: randomString(32),
    id: `${_id}-q`,
    content: xssFilterText
  })
  detail.value.show_recommend_question && initRecommendQuestions(xssFilterText)
  commonRequestSocket(xssFilterText, msg_id, _id)
  socketStore.updatePeddingDomains(botSlug.value)
  // 语音播放重置
  onResetPlayingAudio()
}

// 是否被终止
const isTerminated = ref(false)

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

    const content =
      lastAnswer.content +
      regReplaceA(t('#继续#'), {
        class: 'answer-continue',
        'data-cid': lastAnswer.msg_id || lastAnswer.questionId
      })

    const terminateParams = {
      type: 'close',
      text: content,
      cutoff_continue_qid: lastAnswer.questionId,
      ...chatCommonParams.value,
      fake_domain: debugDomain || undefined,
      msg_id: lastAnswer.msg_id
    }

    socketInstance.send(JSON.stringify(terminateParams))
    // const SSEAudioDoneParams = {
    //   chunk_message: '',
    //   status: EWsMessageStatus.done,
    //   question_id: lastAnswer.questionId
    // }
    // needsSSEAudio.value &&
    //   (await SSETextToAudio({
    //     sseRes: SSEAudioDoneParams,
    //     domainSlug: botSlug.value,
    //     token: chatToken.value
    //   }))

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
  // socketResult.value = {
  //   chunk_message: ''
  // }

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
    source_id: sourceID.value,
    ...chatCommonParams.value,
    navit_msg_id: isMidJourneyDomain.value ? random(1000000, 9999999) : undefined,
    fake_domain: debugDomain || undefined
  }
  // if (params.source === 'chato_home' && abTestConfig.value[7] === '0') {
  //   params.type = 'flow'
  // }
  try {
    socketInstance.send(JSON.stringify(params))
    if (isAiGenerate.value) {
      inputText.value = await getChatQuestion(history.value.at(-1).content)
      submit()
    }
  } catch (err) {
    history.value[history.value.length - 1].status = EWsMessageStatus.error
    history.value[history.value.length - 1].content = err
    isLoadingAnswer.value = false
  }
}

const generateMessage = async (data, key) => {
  const isFinalStatus = ChatMessageFinalStatus.includes(data.status)
  isLoadingAnswer.value = !isFinalStatus
  if (continueTarget.value) {
    continueTarget.value.innerText = t('继续')
  }

  const defaulthHistoryItem: IMessageItem = {
    displayType: EMessageDisplayType.answer,
    msg_id: key,
    id: key,
    type: data.type,
    content: data.chunk_message,
    questionId: data.question_id,
    status: data.status,
    ref_source_len: data.ref_source_len,
    evaluation: null,
    command: data.command,
    progress: 0
  }

  const historyIndex = history.value.findIndex((item) => item.msg_id === key)
  const historyItem = historyIndex !== -1 ? history.value[historyIndex] : defaulthHistoryItem
  const updatedProgress = Math.max(data.progress, historyItem.progress || 0)

  const currentAnswer = {
    ...historyItem,
    ...defaulthHistoryItem,
    progress: updatedProgress
  }

  if (data.finish_reason === 'length') {
    currentAnswer.content += regReplaceA(t('#继续#'), {
      class: 'answer-continue',
      'data-cid': data.msg_id
    })
  }

  if (isFinalStatus && data.status === EWsMessageStatus.forbid_quota) {
    const quotaType = isMidJourneyDomain.value
      ? ESpaceRightsType.paintQuota
      : ESpaceRightsType.quota
    checkRightsTypeNeedUpgrade(quotaType)
  }

  const latestHistoryItem = history.value.at(-1)
  if (historyIndex !== -1) {
    history.value[historyIndex] = currentAnswer
  } else if (latestHistoryItem.status === EWsMessageStatus.pending) {
    history.value[history.value.length - 1] = currentAnswer
  } else {
    history.value.push(currentAnswer)
  }
  // 补充提问问题由后端返回的 question_id
  const latest2HistoryItem = history.value.at(-2)
  if (!latest2HistoryItem.questionId) {
    history.value[history.value.length - 2] = {
      ...latest2HistoryItem,
      questionId: data.question_id
    }
  }
  const lastAnswer = history.value[history.value.length - 1]
  const SSEAudioDoneParams = {
    chunk_message: data.chunk_message,
    status: EWsMessageStatus.done,
    question_id: lastAnswer.questionId
  }
  data.status === EWsMessageStatus.done &&
    needsSSEAudio.value &&
    (await SSETextToAudio({
      sseRes: SSEAudioDoneParams,
      domainSlug: botSlug.value,
      token: chatToken.value
    }))
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
    await postCommonGraph('chato_questions/save', {
      id: questionId,
      evaluation: current.evaluation
    })
    // evaluate(questionId, { evaluation: current.evaluation })
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

  if (props.isResource) {
    actions = actions.filter((item) => item !== EMessageActionType.fix)
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
  title: string
}>({
  visible: false,
  formId: '',
  uId: '',
  title: ''
})

const onElClick = (event) => {
  onHiddenChatMore()
  const target = (event.target || event.srcElement) as HTMLElement
  if (target?.id === 'Chato-customer-collect-form') {
    event.stopPropagation()
    customerFormState.formId = target.getAttribute('data-form-id')
    customerFormState.uId = target.getAttribute('data-uid')
    customerFormState.visible = true
    customerFormState.title = target.innerText
  }
}

const recommendQuestionsLoading = ref(false)
const recommendBaseQuestion = ref('')
const recommendQuestions = ref<IRecommendQuestion[]>([])

const initRecommendQuestions = async (question: string) => {
  try {
    recommendBaseQuestion.value = question
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

const getChatQuestion = async (question: string) =>
  new Promise<string>(async (resolve) => {
    try {
      const {
        data: { data }
      } = await getChatRecommendQuestions({ ...chatCommonParams.value, question })
      resolve(data.recommends[0].question)
    } catch (e) {
    } finally {
      recommendQuestionsLoading.value = false
    }
  })

const onClickRecommend = (ques: string) => {
  submit(ques)
  recommendQuestions.value = []
}

const onShowPayModalVisible = () => {
  payModalVisible.value = true
}

const onWeixinH5DefaultLogin = async () => {
  if (redirectCode.value) {
    if (loginStatus.value) return
    try {
      const res = await postWeixinH5Login({
        code: redirectCode.value,
        app_id: CHATO_BAIXING_APP_ID,
        type: EWeixinH5LoginType.customer
      })
      const { token, need_bind_mobile, external_user_id } = res.data.data
      token && authStoreI.setUid(token)
      loginStatus.value = !need_bind_mobile
      loginUserId.value = external_user_id
    } catch (error) {
      console.log('postWeixinH5Login failed', error)
      // onRouteWeixinDefaultLogin(window.location.href, CHATO_BAIXING_APP_ID)
    }
  } else {
    onRouteWeixinDefaultLogin(window.location.href, CHATO_BAIXING_APP_ID)
  }
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
        const allLimitElement = document.querySelectorAll('.qa-restrictions')
        // 移除旧的点击事件监听器
        copyBtns.forEach((btn) => {
          btn.removeEventListener('click', handleCopyButtonClick)
        })
        allLimitElement.forEach((item) => {
          item.removeEventListener('click', onShowPayModalVisible)
        })

        // 添加新的点击事件监听器
        copyBtns.forEach((btn) => {
          btn.addEventListener('click', handleCopyButtonClick)
        })

        allLimitElement.forEach((item) => {
          item.addEventListener('click', onShowPayModalVisible)
        })
      }
    }
  })

  observer.observe(document.body, { childList: true, subtree: true })
})

onBeforeUnmount(() => {
  observer.disconnect()
  document.removeEventListener('click', onElClick)
  refChatHistory.value?.removeEventListener('click', chatHisListener)
  watermark.value && watermark.value.destroy()
  blindWatermark.value && blindWatermark.value.destroy()
})

watch(
  botSlug,
  (v) => {
    if (botSlug.value === 'square') return
    if (botSlug.value === 'chato_navigator') return
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
  socketResultMap,
  (socket) => {
    for (let [key, value] of socket) {
      if (value.domain_slug === botSlug.value) {
        generateMessage(value, key as string)
      }
    }
  },
  { deep: true }
)

watch(
  debugDomain,
  (v) => {
    if (!v) {
      return
    }

    detail.value = { ...detail.value, ...v, desc_show: 1 }

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
    }
    // else {
    //   console.log('34s')
    //   const newHistory = history.value.filter((item) => !item.isWelcome)
    //   history.value = newHistory
    // }
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
