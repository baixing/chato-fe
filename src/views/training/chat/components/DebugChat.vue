<template>
  <div class="shrink-0 bg-white relative">
    <Chat
      :internal-props="true"
      :is-chating-practice="true"
      @correctAnswer="onCorrectAnswer"
      @showDrawer="onOpenDrawer"
      :avatarShow="false"
      chatClassName="chat-debug"
      type="create"
    />
    <div
      v-if="!debugDomain?.system_prompt"
      class="absolute top-0 left-0 right-0 bottom-0 bg-[#00000033] text-white text-sm z-50 flex flex-col items-center justify-center gap-4 px-4"
    >
      <svg-icon name="lock" svg-class="w-8 h-8 text-white" />
      <p class="text-center">{{ t('完成角色设定即可预览调试') }}</p>
    </div>
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
  </div>
</template>

<script setup lang="ts">
import DocSourceDrawer from '@/components/Chat/ChatDocSourceDrawer.vue'
import Chat from '@/components/Chat/index.vue'
import EnterQa from '@/components/EnterAnswer/EnterQa.vue'
import { currentEnvConfig } from '@/config'
import { USER_ROLES } from '@/constant/common'
import { DebugDomainSymbol } from '@/constant/domain'
import { EDocumentTabType } from '@/enum/knowledge'
import type { IDomainInfo } from '@/interface/domain'
import { useBase } from '@/stores/base'
import { getMarkDownUrl, replaceMarkdownUrl } from '@/utils/help'
import { removewRegReplaceA } from '@/utils/reg'
import * as url from '@/utils/url'
import { computed, inject, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const base = useBase()

const debugDomain = inject<IDomainInfo>(DebugDomainSymbol)
const domainId = computed(() => debugDomain?.id?.toString() || '')
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

<style lang="scss">
.chat-debug {
  .chat-center {
    padding-left: 16px;
    padding-right: 16px;
  }
}
</style>
