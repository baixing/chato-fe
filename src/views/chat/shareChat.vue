<template>
  <Chat
    @show-drawer="(id, slug) => showDrawer(id, slug)"
    @correct-answer="correctAnswer"
    :avatarShow="!isInApplet"
  />
  <!-- 文档来源 -->
  <DocSourceDrawer
    v-model:visible="drawerShow"
    :question-id="currentQuestionId"
    :slug="currentSlug"
    :terminal="ETerminal.C"
  />

  <EnterQa
    :activeNames="EDocumentTabType.inputText"
    :defaultForm="defaultForm"
    :sizeLimit="sizeLimit"
    :qtyLimit="qtyLimit"
    :apiUpload="apiUpload"
    :dialogVisible="dialogVisibleQa"
    hidden-batch
    @closeDialogVisble="() => (dialogVisibleQa = false)"
  />
</template>

<script setup lang="ts">
// TODO: refactor chat
import DocSourceDrawer from '@/components/Chat/ChatDocSourceDrawer.vue'
import Chat from '@/components/Chat/index.vue'
import EnterQa from '@/components/EnterAnswer/EnterQa.vue'
import { useSource } from '@/composables/useSource'
import { currentEnvConfig } from '@/config'
import { CHATO_SOURCE_APP, CHATO_SOURCE_APPLET, USER_ROLES } from '@/constant/common'
import { ETerminal } from '@/enum/common'
import { EDocumentTabType } from '@/enum/knowledge'
import { useBase } from '@/stores/base'
import { getMarkDownUrl, replaceMarkdownUrl } from '@/utils/help'
import { removewRegReplaceA } from '@/utils/reg'
import * as url from '@/utils/url'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'

const currentQuestionId = ref<number>()

const drawerShow = ref(false)
const showDrawer = (question_id, slug) => {
  currentQuestionId.value = question_id
  currentSlug.value = slug
  drawerShow.value = true
}

const route = useRoute()
const base = useBase()
const { source } = useSource()
const domainId = route.params.botId as string
const currentSlug = ref<string>((route.params.botSlug as string) || '')
const dialogVisibleQa = ref(false)
const baseURL = currentEnvConfig.uploadBaseURL
const apiUploadPath = `/chato/api/domains/${domainId}/files/upload/qa`
const apiUpload = url.join(baseURL, apiUploadPath)
const qtyLimit = base.userInfo.role === USER_ROLES.SUPERMAN ? 1000 : 20 // 同时上传的文件数量限制
const sizeLimit = 30 // 单个文件的体积限制（MB）
const defaultForm = reactive({
  title: '',
  question_id: 0,
  content: '',
  images: []
})

const isInAppOrApplet = [CHATO_SOURCE_APP, CHATO_SOURCE_APPLET]
const isInApplet = computed(() => isInAppOrApplet.includes(source.value)) // 判断是否嵌入到小程序/app
const isApp = computed(() => CHATO_SOURCE_APP === source.value) // app环境

const correctAnswer = (e) => {
  defaultForm.title = e.question
  defaultForm.question_id = e.questionId
  defaultForm.content = replaceMarkdownUrl(removewRegReplaceA(e.content))
  defaultForm.images = getMarkDownUrl(e.content)
  dialogVisibleQa.value = true
}

const onTopNoPullDown = () => {
  const overscroll = function (el) {
    el.addEventListener('touchstart', function () {
      const top = el.scrollTop
      const totalScroll = el.scrollHeight
      const currentScroll = top + el.offsetHeight
      if (top === 0) {
        el.scrollTop = 1
      } else if (currentScroll === totalScroll) {
        el.scrollTop = top - 1
      }
    })
    el.addEventListener('touchmove', function (evt) {
      if (el.offsetHeight < el.scrollHeight) evt._isScroller = true
    })
  }
  overscroll(document.querySelector('#app'))
  document.body.addEventListener(
    'touchmove',
    function (evt) {
      console.log((evt as any)._isScroller)
      if (!(evt as any)._isScroller) {
        evt.preventDefault()
      }
    },
    { passive: false }
  )
}

const onCheckPx = () => {
  var elements = document.querySelectorAll('.pb-half-px')
  elements.forEach(function (el: any) {
    el.style.paddingBottom = '1px'
  })
}

onMounted(() => {
  onTopNoPullDown()
  document.body.style.overflow = 'auto'
  isApp.value && onCheckPx()
})
</script>

<style lang="scss">
#app {
  height: 100vh !important;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #fff;
  padding-bottom: 0;
}
</style>
