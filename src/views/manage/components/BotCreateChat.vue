<template>
  <Chat
    :b-slug="domainSlug"
    :isread-route-param="true"
    :internal-props="true"
    @correctAnswer="onCorrectAnswer"
    @showDrawer="onOpenDrawer"
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
    :domainId="domainId"
    :sizeLimit="sizeLimit"
    :qtyLimit="qtyLimit"
    :apiUpload="apiUpload"
    :dialogVisible="dialogVisibleQa"
    hidden-batch
    @closeDialogVisble="() => (dialogVisibleQa = false)"
  />
</template>

<script setup lang="ts">
import DocSourceDrawer from '@/components/Chat/ChatDocSourceDrawer.vue'
import Chat from '@/components/Chat/index.vue'
import EnterQa from '@/components/EnterAnswer/EnterQa.vue'
import { currentEnvConfig } from '@/config'
import { USER_ROLES } from '@/constant/common'
import { EDocumentTabType } from '@/enum/knowledge'
import type { IDomainInfo } from '@/interface/domain'
import { useBase } from '@/stores/base'
import { getMarkDownUrl, replaceMarkdownUrl } from '@/utils/help'
import { removewRegReplaceA } from '@/utils/reg'
import * as url from '@/utils/url'
import { computed, reactive, ref } from 'vue'

const props = defineProps<{
  domain: Partial<IDomainInfo>
}>()

const base = useBase()

const domainId = computed(() => props.domain?.id?.toString() || '')
const domainSlug = computed(() => props.domain?.slug || '')
const apiUpload = computed(() =>
  url.join(currentEnvConfig.uploadBaseURL, `/chato/api/domains/${domainId.value}/files/upload/qa`)
)
const qtyLimit = base.userInfo.role === USER_ROLES.SUPERMAN ? 1000 : 20 // 同时上传的文件数量限制
const sizeLimit = 30 // 单个文件的体积限制（MB）

const defaultForm = reactive({
  title: '',
  question_id: 0,
  content: '',
  images: ''
})

const currentDrawer = reactive<{
  questionId: number
  slug: string
  visible: boolean
}>({
  questionId: 0,
  slug: '',
  visible: false
})

const onOpenDrawer = (question_id, slug) => {
  currentDrawer.questionId = question_id
  currentDrawer.slug = slug
  currentDrawer.visible = true
}

const dialogVisibleQa = ref(false)

const onCorrectAnswer = (e) => {
  defaultForm.title = e.question
  defaultForm.question_id = e.questionId
  defaultForm.content = replaceMarkdownUrl(removewRegReplaceA(e.content))
  defaultForm.images = getMarkDownUrl(e.content) as unknown as string
  dialogVisibleQa.value = true
}
</script>
