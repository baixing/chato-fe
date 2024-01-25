// ----- 确保样式优先级 -----
import '@/styles/main.scss'
import 'prismjs/themes/prism.css'
import 'viewerjs/dist/viewer.css'
import 'wow.js/css/libs/animate.css'
//
import { deleteCommonGraph, getCommonGraph, postCommonGraph } from '@/api/graph'
import useSensors from '@/composables/useSensors'
import useSentry from '@/composables/useSentry'
import elementIcon from '@/utils/elementIcon'
import { globalComponents } from '@/utils/globalComponents'
import { copyPaste } from '@/utils/help'
import ElementPlus from 'element-plus'
import 'github-markdown-css/github-markdown-light.css'
import { createPinia } from 'pinia'
import VueViewer from 'v-viewer'
import 'virtual:svg-icons-register'
import { createApp } from 'vue'
import asyncRegisterGlobalComponents from '../plugins/asyncRegisterGlobalComponents'
import App from './App.vue'
import i18n from './locales'
import router from './router'

const app = createApp(App)

app.use(ElementPlus)
app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(VueViewer)

app.use(asyncRegisterGlobalComponents, globalComponents)
app.use(elementIcon)

useSensors(app)

app.config.globalProperties.$copyText = (text: string, successMessage?: string) =>
  copyPaste(text, successMessage)
app.config.globalProperties.getCommonGraph = getCommonGraph
app.config.globalProperties.postCommonGraph = postCommonGraph
app.config.globalProperties.deleteCommonGraph = deleteCommonGraph
app.mount('#app')

useSentry(app, router)

// const url = window.location.pathname
// if (!url.startsWith('/sample_chat')) {
//   const seoDiv = document.getElementById('seo')
//   seoDiv.style.display = 'none'
// }

// 删除语音缓存，运行一段时候后删除
localStorage.removeItem('localAudioUrl')
