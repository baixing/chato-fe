import { ELangKey } from '@/enum/locales'
import i18n from '@/locales'
import { useLocalStorage } from '@vueuse/core'
import dayjs from 'dayjs'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLocales = defineStore('locales', () => {
  const locale = ref(i18n.global.locale.value)
  const locaKey = useLocalStorage('locale', ELangKey.zh_cn)

  const setDayjsLocale = (lang: ELangKey) => {
    dayjs.locale(lang)
  }

  const setLocale = (lang: ELangKey) => {
    i18n.global.locale.value = lang
    locale.value = lang
    locaKey.value = lang
    setDayjsLocale(lang)
  }

  const switchLanguage = (lang: ELangKey) => {
    if (locale.value === 'en') {
      setLocale(lang)
    } else {
      setLocale(lang)
    }
  }

  return {
    locale,
    setLocale,
    setDayjsLocale,
    switchLanguage
  }
})
