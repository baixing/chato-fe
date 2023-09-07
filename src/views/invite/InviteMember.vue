<template>
  <BlankWithChatoLayout :loading="loading">
    <InviteLimit v-if="statusCode === 200001" />
    <InviteInfo
      v-else-if="statusCode === 200"
      :type="role"
      :invite_ticket="(route.query.invite_ticket as string)"
      :info="invitedInfo"
    />
    <p v-else>{{ resultInfo }}</p>
    <template v-if="authToken && !resultInfo" #footer>
      <p class="text-xs mt-4 text-[#9DA3AF]">
        {{ $t('进入后，在右上角账户中心里可切换不同空间') }}
      </p>
    </template>
  </BlankWithChatoLayout>
</template>
<script lang="ts" setup>
import { getInviteUserDetail } from '@/api/space'
import type { ESettingSpaceRole } from '@/enum/space'
import type { IUserInfo } from '@/interface/user'
import BlankWithChatoLayout from '@/layout/BlankWithChatoLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { decodeParam } from '@/utils/string'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import InviteInfo from './components/InviteInfo.vue'
import InviteLimit from './components/InviteLimit.vue'

const route = useRoute()
const authStoreI = useAuthStore()
const { authToken } = storeToRefs(authStoreI)
const resultInfo = ref('')
const statusCode = ref(0)
const loading = ref<boolean>(false)
const invitedInfo = ref<IUserInfo>()

const role = computed(() =>
  decodeParam(route.query.inviteType)
    ? (decodeParam(route.query.inviteType) as ESettingSpaceRole)
    : undefined
)

const init = async () => {
  loading.value = true
  try {
    const data = { invite_ticket: route.query.invite_ticket as string }
    const res = await getInviteUserDetail(data)
    const resultData = res.data
    statusCode.value = resultData.code
    invitedInfo.value = resultData.data as IUserInfo
    loading.value = false
  } catch (err) {
    statusCode.value = err.code
    resultInfo.value = err.data
    loading.value = false
  }
}

init()
</script>
