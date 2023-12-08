<template>
  <Chat
    :isreadRouteParam="true"
    :internalProps="isInternal"
    :isResource="true"
    @correctAnswer="correctAnswer"
    @showDrawer="onOpenSource"
    :bSlug="botSlug"
    :authLogin="authLogin"
  />
  <!-- 文档来源 -->
  <DocSourceDrawer
    v-model:visible="currentDrawer.visible"
    :question-id="currentDrawer.questionId"
    :slug="currentDrawer.slug"
  >
    <template #afterTitle="{ item }">
      <a style="margin-right: 10px; color: #303133" :download="item.url" :href="item.url">
        {{ item.title }} </a
      >{{ $t('评分：') }}{{ Math.round(item.score * 100) }}
    </template>
  </DocSourceDrawer>
  <EnterQa
    :activeNames="EDocumentTabType.inputText"
    :defaultForm="defaultForm"
    :dialogVisible="dialogVisibleQa"
    hidden-batch
    @closeDialogVisble="() => (dialogVisibleQa = false)"
  />
</template>
<script lang="ts" setup>
// TODO: refactor chat
import DocSourceDrawer from '@/components/Chat/ChatDocSourceDrawer.vue'
import Chat from '@/components/Chat/index.vue'
import EnterQa from '@/components/EnterAnswer/EnterQa.vue'
import { EDocumentTabType } from '@/enum/knowledge'
import { useDomainStore } from '@/stores/domain'
import { replaceMarkdownUrl } from '@/utils/help'
import { removewRegReplaceA } from '@/utils/reg'
import dayjs from 'dayjs'
import { storeToRefs } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

withDefaults(
  defineProps<{
    authLogin?: boolean
    isInternal?: boolean
  }>(),
  {
    authLogin: false,
    isInternal: false
  }
)

const route = useRoute()
const domainStoreI = useDomainStore()
const { domainInfo } = storeToRefs(domainStoreI)
const dialogVisibleQa = ref(false)
const botSlug = computed(() => domainInfo.value.slug)
const defaultForm = reactive({
  title: '',
  question_id: 0,
  content: ''
})

function correctAnswer(e) {
  defaultForm.title = e.question
  defaultForm.question_id = e.questionId
  defaultForm.content = replaceMarkdownUrl(removewRegReplaceA(e.content))
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

const onOpenSource = (question_id, slug) => {
  currentDrawer.questionId = question_id
  currentDrawer.slug = slug
  currentDrawer.visible = true
}

// 抖音api回调
const onDouyinAPIClick = (id) => {
  fetch('/api/v2/conversion', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json' // 告诉服务器我们正在发送JSON数据
    },
    body: JSON.stringify({
      event_type: 'active',
      context: {
        ad: {
          callback: id
        }
      },
      timestamp: dayjs().valueOf()
    })
  })
    .then((response) => response.json())
    .then((data) => console.log(data))
    .catch((error) => console.error('Error:', error))
}

watch(
  () => route.query.clickid,
  (v) => {
    v && onDouyinAPIClick(v)
  },
  { immediate: true }
)
</script>
