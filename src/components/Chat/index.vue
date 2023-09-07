<template>
  <div class="container-preview-page bg-white">
    <div
      v-if="route.name !== RoutesMap.tranning.botChat && detail.avatar_show && detail.name_show"
      class="flex items-center justify-center h-[52px] bg-white mb-0 text-sm font-medium gap-2 shrink-0"
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
      class="flex flex-col max-w-[800px] mx-auto h-full w-full overflow-hidden"
      v-loading="$isLoading"
      element-loading-background="#F2F3F5"
    >
      <div v-if="!history.length" class="empty h-full">
        {{ $t('请在下方输入框提问吧～') }}
      </div>
      <div
        v-else
        :class="['chat-history', route.name === RoutesMap.chat.c && '!px-4']"
        @scroll="onChatHistoryScroll"
        ref="refChatHistory"
      >
        <div class="MessageItem" ref="MessageItemContainer">
          <!-- 机器人简介 -->
          <div v-if="detail.desc_show" class="quick-message-container" style="margin-bottom: 20px">
            <div class="quick-span-desc">
              <img :src="detail.avatar" alt="logo" />
              <div class="desc-right">
                <div class="desc-right-title">{{ detail.name || '...' }}</div>
                <span>{{ detail.desc }}</span>
              </div>
            </div>
          </div>
          <div v-for="(item, index) in history" :key="item.id" class="messageItem-container">
            <template v-if="item.displayType !== 'remove'">
              <MessageItem
                :isLast="index === history.length - 1 && !isLoadingAnswer"
                :message="item"
                :detail="detail"
                :isInternal="isInternal && isChatingPractice"
                :is-loading-answer="isLoadingAnswer"
                :correct-visible="isInternal || (detail.qa_modifiable && !correctTicketExpired)"
                :currentPlayId="currentPlayId"
                :audioLoading="audioLoading"
                :isPlaying="isPlaying"
                @evaluate="onEvaluate"
                @send-message="submit"
                @show-more-action="onShowMoreAction"
                @receive-question-answer="(mItem) => emit('correctAnswer', mItem)"
                @click-source="(questionId) => emit('showDrawer', questionId, botSlug)"
                @handleAudio="voiceAnnounements"
              />
            </template>
            <template v-else-if="item.displayType === 'remove'">
              <el-divider>
                <span class="divider-tip">{{ $t('已清除与历史消息的关联，开始全新的会话') }}</span>
              </el-divider>
            </template>
          </div>
          <div v-if="quotaUpperLimit" class="divider-desc-seesion">
            {{ $t('电力值不足，更多电力值请咨询产品顾问') }}
          </div>
        </div>
      </div>
      <div
        v-show="isLoadingAnswer"
        data-sensors-click
        id="Chato_chat_stop_click"
        :data-sensors-question-id="history?.[history.length - 1]?.questionId"
        class="shrink-0 mb-4 mt-3 mx-auto flex items-center gap-[6px] text-[#303133] text-xs cursor-pointer px-4 py-3 rounded-md bg-[#F2F3F5] w-fit hover:opacity-80"
        @click="onTerminateRetry"
      >
        <el-icon class="text-base"> <VideoPause /> </el-icon>{{ $t('终止') }}
      </div>

      <div v-if="detail.shortcuts" class="quick-message-bottom relative">
        <span
          v-for="(item, index) in detail.shortcuts"
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

      <div :class="['input-box', route.name === RoutesMap.chat.c && '!px-4']">
        <el-tooltip
          :disabled="isMobile"
          :content="$t(`清空历史消息`)"
          placement="top"
          :hide-after="0"
        >
          <el-icon
            data-sensors-click
            id="Chato_chat_delete_click"
            :data-sensors-question-id="history?.[history.length - 1]?.questionId"
            :size="20"
            :class="[
              '!w-10 !h-10 mr-1 text-center rounded-full shrink-0 cursor-pointer hover:bg-[#f2f3f5]',
              isMidJourneyDomain && '!hidden'
            ]"
            @click="clearMessage"
          >
            <svg-icon name="clear-message"></svg-icon>
          </el-icon>
        </el-tooltip>
        <div class="input-box-content pr-2">
          <el-input
            class="input-textarea"
            resize="none"
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 5 }"
            v-model="input"
            :placeholder="inputPlaceHolder"
            ref="refInput"
            :disabled="inputDisabled || isLoadingAnswer"
            @click="scrollChatHistory"
            @keydown.enter="Keydown"
          />
          <ChatRecorder
            v-model:str="input"
            :disabled="isLoadingAnswer"
            ref="chatRecorderRef"
            @recording="onRecording"
          />
          <el-tooltip :disabled="isMobile" :content="$t(`发送`)" placement="top" :hide-after="0">
            <div
              data-script="Chato-send-question"
              class="input-box-btn transition-colors"
              :disabled="isLoadingAnswer"
              @click="() => submit('')"
            >
              <svg-icon svg-class="w-6 h-6 text-[#9DA3AF]" name="chat-send" />
            </div>
          </el-tooltip>
        </div>
        <div
          v-show="isLoadingAnswer"
          class="absolute top-0 right-0 bottom-0 left-0 cursor-not-allowed bg-[#ffffffa3] z-[1]"
        ></div>
      </div>
      <div v-if="footerBrand.show" class="page-main-power site-logo">
        <!-- TODO: 放到 ChatFooter -->
        <div v-if="isInternal && !props.isreadRouteParam" class="flex items-center">
          {{ $t('目前为训练演示视角， 如需用户视角') }}
          <el-link
            :href="`/b/${botSlug}`"
            type="primary"
            :underline="false"
            class="!text-xs !font-normal"
            target="_blank"
            id="Chato_manager_test_click_here"
          >
            {{ $t('请点击此处前往') }}
          </el-link>
        </div>
        <ChatFooter
          v-else
          :name="footerBrand.name"
          :logo="footerBrand.logo"
          :class="[!isCustomerBrand && 'cursor-pointer']"
          @click="onFooterBrandLink"
        />
      </div>
    </div>
  </div>
  <ChatMessageMore
    :message="currentMessage"
    :actions="currentMoreActions"
    :position="currentMoreActionPosition"
    @play-audio="voiceAnnounements"
    @send-message="submit"
    @receive-question-answer="(message) => emit('correctAnswer', message)"
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
</template>

<script lang="ts" setup>
import {
  chatToBotHistoryB,
  chatToBotHistoryC,
  clearSession,
  evaluate,
  getVoiceAnnounements
} from '@/api/chat'
import {
  checkDomainCorrectTicketIsExpired,
  getDomainDetailPublic,
  getDomainQuotaInPlatformC
} from '@/api/domain'
import DefaultAvatar from '@/assets/img/avatar.png'
import MessageItem from '@/components/Chat/ChatMessageItem.vue'
import useAudioPlayer from '@/composables/useAudio'
import { useBasicLayout, useIsMobile } from '@/composables/useBasicLayout'
import useSpaceRights from '@/composables/useSpaceRights'
import { DefaultBrandLogo } from '@/constant/brand'
import {
  ChatBubbleColorList,
  ChatMessageFinalStatus,
  ChatMessageMoreAction,
  SymChatDomainDetail
} from '@/constant/chat'
import { MidJourneyDomainSlug } from '@/constant/domain'
import { PaidCommercialTypes } from '@/constant/space'
import { XSSOptions } from '@/constant/xss'
import {
  EMessageActionType,
  EMessageDisplayType,
  EMessageEvalution,
  EMessageType,
  EWsMessageStatus
} from '@/enum/message'
import { ESpaceRightsType } from '@/enum/space'
import type { ChatHistoryParams } from '@/interface/chat'
import type { IMessageDetail, IMessageItem } from '@/interface/message'
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
import { ElMessage, ElNotification as Notification } from 'element-plus'
import 'highlight.js/styles/default.css'
import { random, remove } from 'lodash'
import { storeToRefs } from 'pinia'
import qs from 'query-string'
import { computed, nextTick, onBeforeUnmount, onMounted, provide, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import Watermark from 'watermark-plus'
import xss from 'xss'
import ChatFooter from './ChatFooter.vue'
import ChatMessageMore from './ChatMessageMore.vue'
import ChatRecorder from './ChatRecorder/index.vue'

const { t } = useI18n()
interface Props {
  internalProps?: boolean
  bSlug?: string
  isChatingPractice?: boolean
  isreadRouteParam?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  internalProps: false,
  bSlug: '',
  isChatingPractice: false,
  isreadRouteParam: false
})

const sseStore = useSSEStore()
const { sseMsgResult } = storeToRefs(sseStore)

const { isMobile } = useBasicLayout()
const route = useRoute()
const mobileDevice = useIsMobile()
const base = useBase()
const { userInfo } = storeToRefs(base)
const authStoreI = useAuthStore()
const { authToken } = storeToRefs(authStoreI)
const $uid = useStorage('uid', '')
const emit = defineEmits(['showDrawer', 'correctAnswer'])
const botSlug = computed(() =>
  props.internalProps
    ? props.isreadRouteParam
      ? (route.params.botSlug as string)
      : props.bSlug
    : (route.params.botSlug as string)
)
const isInternal = props.internalProps || false // 是否处于 Chato 内部环境
const query_p = (qs.parseUrl(window.location.href).query.p as string) || ''
const source = (qs.parseUrl(window.location.href).query.source as string) || ''
const detail = ref<IMessageDetail>({} as IMessageDetail) // 机器人详情
const refChatHistory = ref<HTMLDivElement>(null) // 聊天记录容器的 DOM 引用
const MessageItemContainer = ref(null)
const refInput = ref() // 输入框的 DOM 引用
const input = ref('')
const chatRecorderRef = ref()
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

const DefaultChatHistoryPage = {
  total: 0,
  page_count: 0,
  currentTotal: 0
}
const ws = ref(null)
let chatHistoryPage = reactive({ ...DefaultChatHistoryPage })
const chatHistoryParams: ChatHistoryParams = reactive({
  page: 1,
  page_size: 10
})
const inputPlaceHolder = computed(() => {
  return !mobileDevice ? t('输入问题，换行可通过shift+回车') : t('请输入问题')
})

const realInput = computed(() => String(input.value).trim())

const SSEInstance = new SSE()

const { isPlaying, handlePlay, handlePause, checkExistAudioUrl, addLocalAudioUrl } =
  useAudioPlayer()
const currentPlayId = ref<string>('')
const audioLoading = ref<boolean>(false)

// 水印
const watermarkFunc = () => {
  if (watermark.value) return
  watermark.value = new Watermark({
    content: userInfo.value.id || $uid.value || 'chato',
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
      const cur_list = ChatBubbleColorList.filter((item) => item.bg === detail.value.message_style)
      detail.value.message_style_color = cur_list.length > 0 ? cur_list[0].cl : ''
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
    if (!$uid.value || $uid.value === 'undefined') {
      $uid.value = 'uid' + randomString(32)
    }
    chatHistoryParams.sender_uid = $uid.value
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
  const welcome = detail.value.welcome
  if (welcome) {
    history.value.push({
      first: true,
      displayType: EMessageDisplayType.answer,
      id: `welcome-a`,
      isWelcome: true,
      content: regReplaceA(welcome, {
        class: 'welcome-a',
        id: 'Chato_chat_label_click'
      })
    })
  }
}

function Keydown(e) {
  // 兼容pc端模拟手机端
  if (!e.shiftKey && e.keyCode == 13 && !mobileDevice) {
    e.cancelBubble = true //ie阻止冒泡行为
    e.stopPropagation() //Firefox阻止冒泡行为
    e.preventDefault() //取消事件的默认动作*换行
    //以下处理发送消息代码
    submit('')
  }
}

const beforeSubmit = async () => {
  // C 端对话额度限制，B 端对话额度限制走流式
  if (!isInternal) {
    if (quotaUpperLimit.value) {
      ElMessage.warning(t('电力值不足，更多电力值请咨询产品顾问'))
      return false
    }
  }
  return true
}

async function submit(retryString: string) {
  const beforeSubmitCheckRes = await beforeSubmit()
  const text = retryString ? retryString : realInput.value

  // 语音播放
  handlePause()

  // 未关闭录音，就点击发送，暂停录音
  if (chatRecorderRef.value?.isRecording) {
    inputDisabled.value = false
    chatRecorderRef.value.stopRecording(!beforeSubmitCheckRes)
  }

  // 无额度
  if (!beforeSubmitCheckRes) {
    console.error('无对话额度')
    return
  }

  if (!text) {
    input.value = ''
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
  input.value = ''
  const xssFilterText = xss(text, XSSOptions)
  history.value.push({
    displayType: EMessageDisplayType.question,
    msg_id,
    id: `${_id}-q`,
    content: xssFilterText
  })
  commonRequestSocket(xssFilterText, msg_id, _id)
  sseStore.updatePeddingDomains(botSlug.value)
}

// 是否被终止
const isTerminated = ref(false)
// 是否正在加载回答的消息内容
const isLoadingAnswer = ref(false)
// 文本框禁止输入：录音时、回答正在返回时
const inputDisabled = ref(false)

// 触发录音
const onRecording = (tag: 'start' | 'end') => {
  if (tag === 'start') {
    inputDisabled.value = true
  } else {
    inputDisabled.value = false
  }
}

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
      domain_slug: detail.value.slug,
      token: isInternal ? authToken.value : $uid.value,
      visitor_type: isInternal ? (props.isreadRouteParam ? 'chat' : 'owner') : 'vistor'
    }

    ws.value && ws.value.close()
    sseStore.terminatedSSEResultMap(lastAnswer, detail.value.slug)
    SSEInstance.request('/chato/chat/close', terminateParams)

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

  sendMsgRequest(message)
}

async function sendMsgRequest(message) {
  const params = {
    ...message,
    type: isMidJourneyDomain.value ? 'mj_image' : 'chat',
    source,
    domain_slug: detail.value.slug,
    token: isInternal ? authToken.value : $uid.value,
    visitor_type: isInternal ? (props.isreadRouteParam ? 'chat' : 'owner') : 'vistor',
    navit_msg_id: isMidJourneyDomain.value ? random(1000000, 9999999) : undefined
  }

  sseStore.$patch({ sseMsgId: message.msg_id })

  try {
    let sseUrl = '/chato/sse'
    isMidJourneyDomain.value && (sseUrl += '/mj')
    SSEInstance.request(sseUrl, params, (str) => sseStore.setSSEResultMap(str), {
      responseAll: true
    })

    sseStore.setAbortControllerMap(detail.value.slug, SSEInstance.abortCtrl)
  } catch (err) {
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

// 清除会话记录
async function clearMessage() {
  const lastHistory = history.value.slice(-1)
  if (!lastHistory.length || lastHistory[0].displayType === EMessageDisplayType.remove) return
  try {
    const params = {
      visitor_type: isInternal ? 'owner' : 'vistor',
      domain_slug: detail.value.slug,
      token: isInternal ? authToken.value : $uid.value
    }

    const { data } = await clearSession(params)
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

      history.value = newHistory
    } else {
      Notification.error(data.msg)
    }
  } catch (err) {}
}

const correctTicketExpired = ref(false)

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
    currentActionType = route.name === RoutesMap.tranning.botChat ? 'viewTranning' : 'viewC'
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
const ComDefaultBrandName = 'Powered by Chato'
const isCustomerBrand = computed(() => PaidCommercialTypes.includes(detail.value.org?.type))
const footerBrand = computed(() => {
  let res = {
    name: detail.value.brand_name || ComDefaultBrandName,
    logo: detail.value.brand_logo || DefaultBrandLogo,
    show: true
  }

  if (isCustomerBrand.value) {
    res.show = detail.value.brand_show
  }

  return res
})

const handleCopyButtonClick = (e) => {
  e.stopPropagation()
  copyPaste(e.target.querySelector('.text').innerHTML)
}

const onFooterBrandLink = () => {
  if (isCustomerBrand.value) {
    return
  }
  router.push('/')
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

    if (target.classList.contains('welcome-a') && $notnull(content)) {
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

const closeSocketConnect = () => {
  if (!ws.value) return
  ws.value.close()
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

// 语音播报
const voiceAnnounements = async (status: boolean, text: string, id: string) => {
  currentPlayId.value = id
  try {
    if (status) {
      return handlePause()
    }
    let audioUrl = checkExistAudioUrl(id)
    if (!audioUrl) {
      audioLoading.value = true
      const res = await getVoiceAnnounements({ domain_slug: botSlug.value, text })
      audioLoading.value = false
      audioUrl = res.data.data.url
      addLocalAudioUrl(id, audioUrl)
    }
    handlePlay(audioUrl)
  } catch (e) {
    console.error(e)
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

  window.addEventListener('beforeunload', closeSocketConnect)
  window.showPreview = (imageUrl: string) => {
    previewImageUrl.value = imageUrl
    showPreview.value = true
  }
})

onBeforeUnmount(() => {
  observer.disconnect()
  window.removeEventListener('beforeunload', closeSocketConnect)
  document.removeEventListener('click', onElClick)
  refChatHistory.value?.removeEventListener('click', chatHisListener)
  watermark.value && watermark.value.destroy()
})

watch(
  botSlug,
  (v) => {
    v && init()
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

provide(SymChatDomainDetail, detail)
</script>
<style lang="scss" scoped>
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
  padding: 5px 16px 0;

  .quick-item {
    border-radius: 15px;
    background: #f2f3f5;
    line-height: 17px;
    font-size: 12px;
    padding: 6px 12px;
    margin: 0 5px 5px 0;
    cursor: pointer;

    &:last-of-type {
      margin-right: 0;
    }
  }
}

.chat-history {
  flex: auto 1 1;
  box-sizing: border-box;
  display: flex;
  padding: 16px 4px;
  padding-bottom: 20px;
  max-width: 100vw;
  overflow-x: hidden;
  overflow-y: auto;
}

.MessageItem {
  width: 100%;

  .quick-message-container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    .quick-span-desc {
      display: flex;
      justify-content: flex-start;
      align-items: flex-start;
      width: 100%;
      flex-shrink: 0;
      margin-bottom: 10px;
      padding: 16px;
      line-height: 1.5;
      color: #2f3447;
      background-color: #f2f3f5;
      border-radius: 8px;
      cursor: pointer;

      img {
        width: 56px;
        height: 56px;
        border-radius: 100%;
        flex-shrink: 0;
        object-fit: cover;
      }

      .desc-right {
        color: #596780;
        font-size: 13px;
        line-height: 22px;
        margin-left: 12px;
        word-break: break-word;

        .desc-right-title {
          margin-bottom: 8px;
          color: #3d3d3d;
          font-size: 16px;
          font-weight: 500;
        }
      }
    }
  }

  .messageItem-container {
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .divider-tip {
    font-size: 12px;
    color: #dcdfe6;
  }

  .divider-desc-seesion {
    margin-bottom: 12px;
    text-align: center;
    border-radius: 8px;
    color: #9da3af;
    font-size: 12px;
  }
}

.empty {
  padding-top: 20vh;
  text-align: center;
  color: $color-minor;
  opacity: 0.5;
}

.input-box {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  margin-bottom: 8px;
  background-color: #fff;

  // 这是为顶部外投影准备的，防止被对话气泡遮挡
  position: relative;
  z-index: 20;

  .input-box-content {
    width: 100%;
    display: flex;
    align-items: center;
    border: 1px solid #dcdfe6;
    min-height: 48px;
    box-sizing: border-box;

    :deep(.el-textarea.is-disabled .el-textarea__inner) {
      background-color: transparent;
      color: var(--el-input-text-color);
    }
  }

  :deep(.el-textarea) {
    display: flex;
    align-items: center;
  }

  :deep(.el-textarea__inner) {
    box-shadow: none;
  }

  textarea {
    &:focus {
      outline: none !important;
      box-shadow: none;
    }
  }

  input,
  button {
    display: block;
    appearance: none;
    font-size: $fs-s;
    line-height: 20px;
    border: none;
    outline: none;
    transition: opacity 0.3s;
    background-color: #fff;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  input {
    flex: 1 1 auto;
    padding: 10px;
    border-radius: 8px 0 0 8px;
    color: #192a3e;

    &::placeholder {
      color: $color-placeholder;
    }
  }

  .input-box-btn {
    color: white;
    height: 32px;
    border-radius: 4px;
    white-space: nowrap;
    padding: 4px;
    margin: 0;
    cursor: pointer;
    border-radius: 100%;
    box-sizing: border-box;

    &:hover {
      background-color: #f2f3f5;
      svg {
        color: #7c5cfc;
      }
    }
  }
}

.site-logo {
  box-sizing: border-box;
  display: flex;
  height: 14px;
  margin-bottom: 12px;
  justify-content: center;
  color: #596780;
  text-align: center;
  line-height: 14px;
  font-size: 12px;
}
</style>
