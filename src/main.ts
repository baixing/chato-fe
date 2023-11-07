// ----- 确保样式优先级 -----
import '@/styles/main.scss'
import 'prismjs/themes/prism.css'
import 'wow.js/css/libs/animate.css'
//
import useSensors from '@/composables/useSensors'
import useSentry from '@/composables/useSentry'
import elementIcon from '@/utils/elementIcon'
import { globalComponents } from '@/utils/globalComponents'
import { copyPaste } from '@/utils/help'
import ElementPlus from 'element-plus'
import 'github-markdown-css/github-markdown-light.css'
import { createPinia } from 'pinia'
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

app.use(asyncRegisterGlobalComponents, globalComponents)
app.use(elementIcon)

useSensors(app)

app.config.globalProperties.$copyText = (text: string, successMessage?: string) =>
  copyPaste(text, successMessage)
app.mount('#app')

useSentry(app, router)

// 删除语音缓存，运行一段时候后删除
localStorage.removeItem('localAudioUrl')
