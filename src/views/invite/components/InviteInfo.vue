<template>
  <div class="flex justify-between items-center p-6 lg:p-5 overflow-hidden gap-4">
    <div class="w-full overflow-hidden">
      <div class="flex items-center text-xl text-[#3D3D3D] mb-3 overflow-hidden lg:text-lg">
        <UserAvatar :user="internalInfo" class="mr-2" />
        <p class="truncate break-all">{{ internalInfo?.nickname }}</p>
      </div>
      <div class="text-[#596780] text-sm lg:text-xs">
        {{ $t('邀请您加入其空间，共同进行协作') }}
      </div>
    </div>
    <div
      @click="onJoin"
      class="py-2 px-6 text-[#7C5CFC] text-sm bg-[#fff] rounded-lg cursor-pointer lg:text-xs shrink-0 hover:opacity-80"
    >
      {{ $t('确认加入') }}
    </div>
  </div>
</template>
<script lang="ts" setup>
import { addSpaceMember, hasInSpace } from '@/api/space'
import UserAvatar from '@/components/Avatar/UserAvatar.vue'
import type { ESettingSpaceRole } from '@/enum/space'
import type { IUserInfo } from '@/interface/user'
import { RoutesMap } from '@/router'
import { useAuthStore } from '@/stores/auth'
import { useBase } from '@/stores/base'
import { $notnull } from '@/utils/help'
import { useStorage } from '@vueuse/core'
import { ElLoading, ElMessage } from 'element-plus'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
const { t } = useI18n()

const props = defineProps<{
  info: IUserInfo
  type: ESettingSpaceRole
  invite_ticket: string
}>()

const base = useBase()
const { orgInfoList } = storeToRefs(base)
const internalInfo = computed(() => props.info)

const router = useRouter()
const authStoreI = useAuthStore()
const { authToken } = storeToRefs(authStoreI)

const onJoin = async () => {
  if (authToken.value) {
    const loading = ElLoading.service({
      lock: true,
      text: t('加入中...'),
      background: 'rgba(0, 0, 0, 0.7)'
    })
    const token = useStorage<string>('auth_token', '')
    try {
      const {
        data: {
          data: { user: userInSpace }
        }
      } = await hasInSpace(internalInfo.value.org.id)
      if (!$notnull(userInSpace)) {
        const res = await addSpaceMember({ invite_ticket: props.invite_ticket })
        const code = res.data.code
        const message = res.data.message
        loading.close()
        ElMessage({
          type: code === 200 ? 'success' : 'error',
          message: code === 200 ? t('加入成功') : message
        })
        const { token: addToken } = res.data.data
        token.value = addToken
      } else {
        const targetOrgInfo = orgInfoList.value.filter(
          (item) => item.org.id == internalInfo.value.org.id
        )
        const orgInfo = targetOrgInfo.length > 0 ? targetOrgInfo[0] : { token: authToken.value }
        token.value = orgInfo.token
      }
      router.push({
        name: props.type === 'member' ? RoutesMap.resource : RoutesMap.manager.center
      })
    } catch (e) {
    } finally {
      loading.close()
    }
  } else {
    router.push({
      name: RoutesMap.auth.login,
      query: {
        invite_ticket: props.invite_ticket,
        channel: 'invite'
      }
    })
  }
}
</script>
