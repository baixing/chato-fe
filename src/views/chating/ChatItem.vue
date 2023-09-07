<template>
  <Chat
    :isreadRouteParam="true"
    :internalProps="true"
    @correctAnswer="correctAnswer"
    @showDrawer="onOpenSource"
    :bSlug="botSlug"
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
import { storeToRefs } from 'pinia'
import { computed, reactive, ref } from 'vue'

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
</script>
