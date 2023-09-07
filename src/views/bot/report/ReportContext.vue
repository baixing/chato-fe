<template>
  <div
    v-loading="loading"
    class="max-w-[680px] w-full mx-auto overflow-hidden flex flex-col gap-2 h-[calc(100vh-130px)] lg:h-[calc(100vh-100px)]"
  >
    <virtual-list
      ref="virtualRef"
      :list-data="chatList"
      :estimated-item-size="100"
      height="85%"
      class="flex-1"
      item-class="w-full flex flex-col"
      @scroll="onHiddenChatMore"
    >
      <template #default="{ rowData }">
        <MessageItem
          :message="rowData"
          :is-internal="true"
          :is-last="false"
          :detail="detail"
          @show-more-action="onShowMoreAction"
          @receive-question-answer="onCorrectAnswer"
          @click-source="onOpenSource"
        />
      </template>
    </virtual-list>
    <div class="text-center flex items-end justify-center">
      <el-button type="primary" @click="onExport">{{ $t('导出全部') }}</el-button>
    </div>
  </div>
  <ChatMessageMore
    :message="currrentMessage"
    :actions="currentMoreActions"
    :position="currentMoreActionPosition"
    @receive-question-answer="onCorrectAnswer"
    @translate-success="onTranslateSuccess"
  />
  <!-- 文档来源 -->
  <DocSourceDrawer
    v-model:visible="currentDrawer.visible"
    :question-id="currentDrawer.questionId"
    :slug="currentDrawer.slug"
  />
  <EnterQa
    :activeNames="EDocumentTabType.inputText"
    :defaultForm="defaultForm"
    :sizeLimit="30"
    :qtyLimit="qtyLimit"
    :apiUpload="apiUpload"
    :dialogVisible="dialogVisibleQa"
    @closeDialogVisble="() => (dialogVisibleQa = false)"
  />
  <el-image-viewer v-if="showPreview" :url-list="[previewImageUrl]" @close="showPreview = false" />
</template>
<script lang="ts" setup>
import { getDomainDetailPublic } from '@/api/domain'
import { exportQuestions, getQuestions } from '@/api/report'
import DocSourceDrawer from '@/components/Chat/ChatDocSourceDrawer.vue'
import MessageItem from '@/components/Chat/ChatMessageItem.vue'
import ChatMessageMore from '@/components/Chat/ChatMessageMore.vue'
import EnterQa from '@/components/EnterAnswer/EnterQa.vue'
import VirtualList from '@/components/VirtualList/index.vue'
import { currentEnvConfig } from '@/config'
import { ChatBubbleColorList, ChatMessageMoreAction, SymChatDomainDetail } from '@/constant/chat'
import { USER_ROLES } from '@/constant/common'
import { EDocumentTabType } from '@/enum/knowledge'
import { EMessageActionType, EMessageDisplayType } from '@/enum/message'
import type { IMessageDetail, IMessageItem } from '@/interface/message'
import { useBase } from '@/stores/base'
import { useDomainStore } from '@/stores/domain'
import * as url from '@/utils/url'
import 'github-markdown-css/github-markdown-light.css'
import 'highlight.js/styles/default.css'
import { storeToRefs } from 'pinia'
import { computed, onBeforeUnmount, onMounted, provide, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const chatList = ref([])
const detail = ref<IMessageDetail>() // 机器人详情
const loading = ref(false)
const virtualRef = ref()
const showPreview = ref(false)
const previewImageUrl = ref('')
const baseStoreI = useBase()
const domainStoreI = useDomainStore()
const { domainInfo } = storeToRefs(domainStoreI)

const route = useRoute()
const midQuestionId = computed(() => ((route.params.chatId as string) || '').split('_')[0])

const baseURL = currentEnvConfig.uploadBaseURL
const apiUploadPath = `/chato/api/domains/${domainInfo.value.id}/files/upload/qa`
const apiUpload = url.join(baseURL, apiUploadPath)

const qtyLimit = baseStoreI.userInfo.role === USER_ROLES.SUPERMAN ? 1000 : 20 // 同时上传的文件数量限制

const initBotInfo = async () => {
  const {
    data: { data }
  } = await getDomainDetailPublic(domainInfo.value.slug)

  if (!data) {
    return
  }

  const cur_list = ChatBubbleColorList.filter((item) => item.bg === data.message_style)
  detail.value = {
    ...data,
    message_style_color: cur_list.length > 0 ? cur_list[0].cl : '',
    shortcuts: data?.shortcuts ? JSON.parse(data.shortcuts) : []
  }
}

const initQuestions = async () => {
  const {
    data: { data }
  } = await getQuestions({
    domainId: domainInfo.value.id,
    source: 'all',
    mid_question_id: midQuestionId.value
  })

  const res = []
  for (let i = 0; i < data.length; i++) {
    const list_item = data[i]
    const question = {
      first: true,
      type: list_item.type,
      displayType: EMessageDisplayType.question,
      id: `${list_item.id}_q`,
      content: list_item.question,
      questionId: list_item.id,
      evaluation: list_item.evaluation,
      question: list_item.question
    }
    const answer = {
      type: list_item.type,
      displayType: EMessageDisplayType.answer,
      id: `${list_item.id}_a`,
      content: list_item.answer,
      ref_source_len: list_item.ref_source_len,
      questionId: list_item.id,
      evaluation: list_item.evaluation,
      question: list_item.question
    }
    res.unshift(question, answer)
  }
  chatList.value = res
}

const onExport = async () => {
  try {
    const res = await exportQuestions({
      ids: [],
      domainId: domainInfo.value.id,
      midQuestionId: midQuestionId.value
    })

    const blob = new Blob([res.data as unknown as BlobPart], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.click()
    URL.revokeObjectURL(url)
  } catch (err) {}
}

const init = async () => {
  loading.value = true
  try {
    await initBotInfo()
    await initQuestions()
  } catch (err) {
  } finally {
    loading.value = false
  }
}

const currrentMessage = ref<IMessageItem>()
const currentMoreActionPosition = ref()
const currentMoreActions = computed<EMessageActionType[]>(() => {
  if (!currrentMessage.value) {
    return []
  }

  return ChatMessageMoreAction.viewDetail[currrentMessage.value.displayType]
})
// 消息尾部的更多操作
const onShowMoreAction = (message: IMessageItem, position) => {
  currrentMessage.value = message
  currentMoreActionPosition.value = position
}

const onTranslateSuccess = (questionId: number, text: string) => {
  const cur = chatList.value.find(
    (item) => item.questionId === questionId && item.displayType === EMessageDisplayType.answer
  )
  cur && (cur.translate = text)
}

const dialogVisibleQa = ref(false)
const defaultForm = reactive({
  title: '',
  question_id: 0,
  content: ''
})
const onCorrectAnswer = (item: IMessageItem) => {
  defaultForm.title = item.question
  defaultForm.question_id = item.questionId
  defaultForm.content = item.content
  dialogVisibleQa.value = true
}

const currentDrawer = reactive<{
  questionId: number
  slug: string
  visible: boolean
}>({
  questionId: 0,
  slug: '',
  visible: false
})

const onOpenSource = (questionId: number) => {
  currentDrawer.questionId = questionId
  currentDrawer.slug = domainInfo.value.slug
  currentDrawer.visible = true
}

// 隐藏消息尾部的更多操作
const onHiddenChatMore = () => {
  if (currentMoreActionPosition.value?.top < 0) {
    return
  }

  currentMoreActionPosition.value = {
    top: -9999
  }
}

onMounted(() => {
  init()
  document.addEventListener('click', onHiddenChatMore)
  window.showPreview = (imageUrl: string) => {
    previewImageUrl.value = imageUrl
    showPreview.value = true
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onHiddenChatMore)
})

provide(SymChatDomainDetail, domainInfo)

watch(
  [virtualRef, loading, () => route.params.chatId],
  () => {
    if (!virtualRef.value || !route.params.chatId || loading.value) {
      return
    }

    virtualRef.value.setScrollToIndex(route.params.chatId)
  },
  { immediate: true }
)
</script>
