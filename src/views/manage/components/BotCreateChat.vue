<template>
  <div class="w-2/5 shrink-0 bg-white relative">
    <Chat
      :isread-route-param="true"
      :internal-props="true"
      :is-chating-practice="true"
      type="create"
      @correctAnswer="onCorrectAnswer"
      @showDrawer="onOpenDrawer"
      :avatarShow="avatarShow"
      chatClassName="chat-debug"
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
      :qtyLimit="qtyLimit"
      :apiUpload="apiUpload"
      :dialogVisible="dialogVisibleQa"
      hidden-batch
      @closeDialogVisble="() => (dialogVisibleQa = false)"
    />

    <Modal
      width="500px"
      mobile-width="90%"
      :title="$t('小纳同学')"
      :visible="!!debugDomain?.system_prompt"
      :footer="false"
    >
      <div class="flex flex-col items-center">
        <img
          src="https://afu-1255830993.cos.ap-shanghai.myqcloud.com/avatar/bot/2023010/590eb6bf-05bc-4b87-82b7-6fa5d2d19248.txt"
          class="w-40 h-40"
          alt=""
        />
        <p class="text-[#9DA3AF] my-4 md:text-xs">{{ $t('免费为企业设计AI解决方案') }}</p>
        <a
          href="https://afu-1255830993.cos.ap-shanghai.myqcloud.com/avatar/bot/2023010/590eb6bf-05bc-4b87-82b7-6fa5d2d19248.txt"
          :download="$t('二维码.png')"
          target="_blank"
          class="theme-color"
        >
          {{ $t('保存') }}
        </a>
      </div>
    </Modal>
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
defineProps<{
  avatarShow?: boolean
}>()
const debugDomain = inject<IDomainInfo>(DebugDomainSymbol)
const domainId = computed(() => debugDomain?.id?.toString() || '')
const apiUpload = computed(() =>
  url.join(currentEnvConfig.uploadBaseURL, `/chato/api/domains/${domainId.value}/files/upload/qa`)
)
const qtyLimit = base.userInfo.role === USER_ROLES.SUPERMAN ? 1000 : 20 // 同时上传的文件数量限制

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
