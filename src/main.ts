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
import type sensors from 'sa-sdk-javascript'
import 'virtual:svg-icons-register'
import { createApp } from 'vue'
import App from './App.vue'
import i18n from './locales'
import router from './router'
declare module 'vue' {
  export interface ComponentCustomProperties {
    $sensors?: typeof sensors
    $copyText: (e: string) => void
  }
}

declare global {
  interface Window {
    showPreview(url: string): void
  }
}

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
