<template>
  <ul class="message-more-container" :style="internalPositionStyle" ref="messageMoreRef">
    <li v-for="item in internalMoreActions" :key="item.type" @click="onMoreAction(item.type)">
      <el-icon :size="16">
        <svg-icon
          v-if="EMessageActionType.like === item.type"
          :name="
            internalMessage.evaluation === EMessageEvalution.like ? 'good-active' : 'good-default'
          "
          :style="{
            color:
              internalMessage.evaluation === EMessageEvalution.like
                ? domainDetail.message_style
                : undefined
          }"
        />
        <svg-icon
          v-else-if="EMessageActionType.dislike === item.type"
          :name="
            internalMessage.evaluation === EMessageEvalution.dislike
              ? 'no-good-active'
              : 'no-good-default'
          "
          :style="{
            color:
              internalMessage.evaluation === EMessageEvalution.dislike
                ? domainDetail.message_style
                : undefined
          }"
        />
        <svg-icon name="audio" color="#2F3447" v-else-if="item.type === EMessageActionType.audio" />
        <component v-else :is="item.icon" />
      </el-icon>
      {{ $t(item.title) }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { deleteSession, evaluate, translate } from '@/api/chat'
import { SymChatDomainDetail } from '@/constant/chat'
import { EMessageActionType, EMessageDisplayType, EMessageEvalution } from '@/enum/message'
import type { IMessageDetail, IMessageItem } from '@/interface/message'
import { copyPaste, downloadImg, generatePreviewImgUrl } from '@/utils/help'
import { removewRegReplaceA } from '@/utils/reg'
import {
  CirclePlus,
  CopyDocument,
  Delete,
  Download,
  Edit,
  Refresh,
  Switch
} from '@element-plus/icons-vue'
import { ElMessageBox, ElNotification } from 'element-plus'
import { computed, inject, nextTick, ref, watch, type HTMLAttributes, type Ref } from 'vue'

const props = defineProps<{
  message: IMessageItem
  actions?: EMessageActionType[]
  position?: {
    left?: number
    right?: number
    top?: number
    bottom?: number
  }
}>()

const emit = defineEmits([
  'sendMessage',
  'deleteSuccess',
  'translateSuccess',
  'likeDislikeSuccess',
  'receiveQuestionAnswer',
  'playAudio'
])

const ChatMessageMoreAllAction = [
  { title: '保存', icon: Download, type: EMessageActionType.save },
  { title: '赞', icon: '', type: EMessageActionType.like },
  { title: '踩', icon: '', type: EMessageActionType.dislike },
  { title: '修正', icon: Edit, type: EMessageActionType.fix },
  { title: '翻译', icon: Switch, type: EMessageActionType.translate },
  { title: '重试', icon: Refresh, type: EMessageActionType.retry },
  { title: '复制', icon: CopyDocument, type: EMessageActionType.copy },
  { title: '删除', icon: Delete, type: EMessageActionType.delete },
  { title: '拓展', icon: CirclePlus, type: EMessageActionType.expand },
  { title: '语音', icon: '', type: EMessageActionType.audio }
]

const domainDetail = inject<Ref<IMessageDetail>>(SymChatDomainDetail)

const messageMoreRef = ref(null)
const internalMessage = computed(() => props.message)
const internalMoreActions = computed(() =>
  ChatMessageMoreAllAction.filter((item) => props.actions?.includes(item.type))
)
const internalPositionStyle = ref<HTMLAttributes['style']>()

const onTranslate = async (content: string, questionId: number) => {
  try {
    const params = {
      text: removewRegReplaceA(content),
      domain_slug: domainDetail?.value?.slug
    }

    const {
      data: { data }
    } = await translate(params)
    emit('translateSuccess', questionId, data.text)
  } catch (err) {
    ElNotification.error('翻译失败！')
  }
}

const onDelete = async (questionId: number) => {
  await ElMessageBox.confirm('是否删除该条消息？', '删除消息', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  })

  let params = {
    answer_ids: [questionId],
    question_ids: []
  }

  if (internalMessage.value.displayType === EMessageDisplayType.question) {
    params = {
      answer_ids: [],
      question_ids: [questionId]
    }
  }

  await deleteSession(params)
  ElNotification.success('删除成功！')
  emit('deleteSuccess', questionId, internalMessage.value.displayType)
}

const onEvaluate = async (questionId: number, evaluation: string) => {
  await evaluate(questionId, { evaluation })
  emit('likeDislikeSuccess', questionId, evaluation)
}

const onMoreAction = (action: EMessageActionType) => {
  const { content, questionId, id } = internalMessage.value
  switch (action) {
    case EMessageActionType.save:
      downloadImg(generatePreviewImgUrl(content))
      break
    case EMessageActionType.like: {
      const actionType =
        internalMessage.value.evaluation &&
        internalMessage.value.evaluation === EMessageEvalution.like
          ? EMessageActionType.none
          : EMessageEvalution.like
      onEvaluate(questionId, actionType)
      break
    }
    case EMessageActionType.dislike: {
      const actionType =
        internalMessage.value.evaluation &&
        internalMessage.value.evaluation === EMessageEvalution.dislike
          ? EMessageActionType.none
          : EMessageEvalution.dislike
      onEvaluate(questionId, actionType)
      break
    }
    case EMessageActionType.fix:
      emit('receiveQuestionAnswer', internalMessage.value)
      break
    case EMessageActionType.translate:
      onTranslate(content, questionId)
      break
    case EMessageActionType.copy:
      copyPaste(content)
      break
    case EMessageActionType.delete:
      onDelete(questionId)
      break
    case EMessageActionType.expand:
      emit('sendMessage', '请你拓展出更多的回答')
      break
    case EMessageActionType.retry:
      emit('sendMessage', content)
      break
    case EMessageActionType.audio:
      emit('playAudio', false, content, id)
      break
    default:
  }
}

watch(
  [() => props.actions, () => props.position, messageMoreRef],
  ([actionProps, positionProps]) => {
    const bubbleContainerEl = document.getElementById('bubbleContainer')
    let res = { ...positionProps }

    if (!actionProps.length || !positionProps || !bubbleContainerEl || !messageMoreRef.value) {
      return
    }

    nextTick(() => {
      const halfBubbleWidth =
        (bubbleContainerEl.clientWidth + bubbleContainerEl.getBoundingClientRect().left) / 2

      if (res.left > halfBubbleWidth) {
        res.left = res.left - messageMoreRef.value.clientWidth + 40
      }
      if (res.top + messageMoreRef.value.clientHeight > window.innerHeight) {
        res.top = res.top - messageMoreRef.value.clientHeight - 50
      }

      for (let key in res) {
        res[key] = `${res[key]}px`
      }
      internalPositionStyle.value = res
    })
  }
)
</script>

<style lang="scss" scoped>
.message-more-container {
  z-index: 999;
  overflow: hidden;
  position: fixed;
  top: 100%;
  right: 0;
  width: 120px;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  box-shadow: 0 0 8px 1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e6e7e9;
  border-radius: 8px;

  li {
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 8px 15px;
    gap: 8px;
    border-top: 1px solid #e6e7e9;
    font-size: 14px;

    &:hover {
      background: #f2f3f5;
    }

    &:first-child {
      border-top: none;
    }
  }
}
</style>
