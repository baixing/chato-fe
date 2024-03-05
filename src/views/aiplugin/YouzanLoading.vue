<template>
  <div class="w-full h-full flex flex-col justify-center items-center bg-[#f1f2f3]">
    <img
      class="!w-[150px] !h-[150px]"
      src="https://afu-1255830993.cos.ap-shanghai.myqcloud.com/chato/production/upload/chato_image/avater/a61dc89a27461ffff6c789d15cb1137d.gif"
      alt=""
    />
    <p class="text-center text-xl mt-4 theme-color">正在跳转...</p>
  </div>
</template>

<script setup lang="ts">
import { getYouzanUser } from '@/api/yz'
import { RoutesMap } from '@/router'
import { useAuthStore } from '@/stores/auth'
import { useBase } from '@/stores/base'
import { useYouzanStore } from '@/stores/yz'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const authStoreI = useAuthStore()
const baseStoreI = useBase()
const youzanStore = useYouzanStore()

const newUserToken = computed(() => (route.query.newUserToken as string) || '')

const init = async () => {
  const res = await getYouzanUser(newUserToken.value)

  const userToken = res.data.data.default_auth_token
  authStoreI.setToken(userToken)
  youzanStore.updateYouzanInfo(res.data.data)
  await baseStoreI.getUserInfo()

  router.replace({
    name: RoutesMap.aiPlugin.yz
  })
}

init()
</script>

<style scoped></style>
