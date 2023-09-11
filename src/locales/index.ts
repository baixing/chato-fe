import { ELangKey } from '@/enum/locales'
import { useLocalStorage } from '@vueuse/core'
import { createI18n } from 'vue-i18n'
// Element-plus 语言包
import Een from 'element-plus/es/locale/lang/en'
import EzhCn from 'element-plus/es/locale/lang/zh-cn'
// 语言包
// 美国英语
import en from './lang/en.json'
import zh_cn from './lang/zh_cn.json'

const currentlocales = useLocalStorage('locale', ELangKey.zh_cn)

export default createI18n({
  locale: currentlocales.value,
  fallbackLocale: 'zh_cn',
  legacy: false,
  globalInjection: true,
  messages: {
    en,
    zh_cn
  }
})

export const langs = [
  { key: ELangKey.zh_cn, name: '中文' },
  { key: ELangKey.en, name: 'English' }
]

export const checkbutton = {
  [ELangKey.zh_cn]: '中文',
  [ELangKey.en]: 'EN'
}

export const Elementlocales = {
  [ELangKey.zh_cn]: EzhCn,
  [ELangKey.en]: Een
}
