import { randomString, removeCookie } from '@/utils/help'
import { useStorage } from '@vueuse/core'
import { useCookies } from '@vueuse/integrations/useCookies'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const cookieToken = useCookies(['auth_token'])?.get('auth_token') || ''
  const storageToken = useStorage('auth_token', '')
  const $uid = useStorage('uid', '')

  const uid = computed(() => {
    if (!$uid.value || $uid.value === 'undefined') {
      $uid.value = 'uid' + randomString(32)
    }
    return $uid.value
  })

  const authToken = ref('')

  if (storageToken.value) {
    authToken.value = storageToken.value
  } else if (cookieToken) {
    authToken.value = cookieToken
  }

  const setToken = (token: string) => {
    authToken.value = token
    storageToken.value = token
  }

  const logout = () => {
    removeCookie('auth_token')
    setToken('')
  }

  const setUid = (uid: string) => {
    $uid.value = uid
  }

  return {
    cookieToken,
    authToken,
    uid,
    logout,
    setToken,
    setUid
  }
})
