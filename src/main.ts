// 确保样式优先级
import '@/styles/main.scss'
import 'prismjs/themes/prism.css'
import 'wow.js/css/libs/animate.css'
//
import SvgIcon from '@/components/SvgIcon/index.vue'
import useBaiduPromotion from '@/composables/useBaiduPromotion'
import useFavicon from '@/composables/useFavicon'
import useSensors from '@/composables/useSensors'
import useSentry from '@/composables/useSentry'
import elementIcon from '@/utils/elementIcon'
import { copyPaste } from '@/utils/help'
import ElementPlus from 'element-plus'
import 'github-markdown-css/github-markdown-light.css'
import { createPinia } from 'pinia'
import 'virtual:svg-icons-register'
import { createApp } from 'vue'
import App from './App.vue'
import i18n from './locales'
import router from './router'

const app = createApp(App)

app.use(ElementPlus)
app.use(createPinia())
app.use(router)
app.use(i18n)

app.use(elementIcon)
app.component('svg-icon', SvgIcon)

useSensors(app)
app.config.globalProperties.$copyText = (text: string) => copyPaste(text)

app.mount('#app')

// 设置不同环境的 Favicon
useFavicon()
useBaiduPromotion()
useSentry(app, router)

// 删除语音缓存，运行一段时候后删除
localStorage.removeItem('localAudioUrl')
