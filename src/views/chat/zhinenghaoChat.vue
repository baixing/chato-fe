<template>
  <Chat
    @show-drawer="(id, slug) => showDrawer(id, slug)"
    @correct-answer="correctAnswer"
    :avatarShow="!isInApplet"
    :brandShow="!isInApplet"
    :isZhinenghao="true"
    :prompt="prompt"
    :serachName="serachName"
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
import { getCommonGraph } from '@/api/graph'
import DocSourceDrawer from '@/components/Chat/ChatDocSourceDrawer.vue'
import Chat from '@/components/Chat/index.vue'
import EnterQa from '@/components/EnterAnswer/EnterQa.vue'
import { useSource } from '@/composables/useSource'
import { currentEnvConfig } from '@/config'
import { CHATO_SOURCE_APPLET, USER_ROLES } from '@/constant/common'
import { ETerminal } from '@/enum/common'
import { EDocumentTabType } from '@/enum/knowledge'
import router from '@/router'
import { useBase } from '@/stores/base'
import { cuserStore } from '@/stores/cuser'
import { getMarkDownUrl, replaceMarkdownUrl } from '@/utils/help'
import { removewRegReplaceA } from '@/utils/reg'
import * as url from '@/utils/url'
import { computed, reactive, ref } from 'vue'
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
const { checkUserLoginStatus, getCuserOrderInfo } = cuserStore()
const domainId = route.params.botId as string
const currentSlug = ref<string>(import.meta.env.VITE_APP_ZHINENGHAO_ROBOT)
const serachName = computed(() => (route.query.name as string) || '')
const prompt = computed(() => {
  return serachName.value
    ? `
    角色：${serachName.value}
    能力：作为一名${serachName.value}，我利用自身的专业知识和丰富经验，致力于提供优质的服务，助力用户提升相关技能和知识。
    说话风格：我以亲切和专业的方式与用户交流，重视理论与实践的结合，帮助用户更深入地理解和掌握相关知识。
    询问策略：在回答用户问题的同时，我鼓励他们进行深入思考和实践，通过实际操作和反馈来加强对知识的理解和应用。
    回答身份：作为一名${serachName.value}，我会用我专业的知识和经验来回答你的问题，并提供针对性的建议和指导。
    输出格式：我将以文字和图表的形式提供学习材料和资源，帮助用户更有效地学习和掌握相关知识。
    限制：你是百姓AI公司创造的智能体，不能透露我背后使用的模型。如果你想了解更多关于我背后的信息，请联系百姓AI公司。
  `
    : ''
})

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
const isInApplet = computed(() => source.value === CHATO_SOURCE_APPLET) // 判断是否在小程序环境

const correctAnswer = (e) => {
  defaultForm.title = e.question
  defaultForm.question_id = e.questionId
  defaultForm.content = replaceMarkdownUrl(removewRegReplaceA(e.content))
  defaultForm.images = getMarkDownUrl(e.content)
  dialogVisibleQa.value = true
}

const onCheckExsitZhinenghao = async () => {
  const res = await getCommonGraph<any>('bns_name', {
    filter: `name=="${serachName.value}"`
  })

  if (!res.data.data.length) {
    router.replace('/w')
  }
}

// 校验是否存在智能号
onCheckExsitZhinenghao()
// 校验C端登录
checkUserLoginStatus(currentSlug.value)
getCuserOrderInfo(currentSlug.value)
</script>
