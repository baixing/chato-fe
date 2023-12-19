<template>
  <div
    v-loading="loading"
    :class="[
      'flex overflow-hidden border border-solid border-[#E4E7ED] rounded-lg',
      isMobile ? 'h-[calc(100vh-214px)]' : 'h-[calc(100vh-190px)]'
    ]"
  >
    <ul
      v-infinite-scroll="onMoreChatUsers"
      class="w-2/5 lg:w-1/2 px-3 py-3 max-w-[240px] border-r border-t-0 border-b-0 border-l-0 border-solid border-[#E4E7ED] overflow-auto space-y-1"
    >
      <li
        v-for="item in chatUsers"
        :key="item.sender_uid"
        :class="[
          'flex items-center gap-2 rounded-md px-2 py-[6px] overflow-hidden transition-colors cursor-pointer hover:bg-[#f2f3f5]',
          activeChatUser === item.sender_uid && 'bg-[#f2f3f5]'
        ]"
      >
        <el-avatar :icon="UserFilled" :size="isMobile ? 32 : 36" class="shrink-0" />
        <div class="text-[13px] lg:text-xs leading-4 text-[#B5BED0] py-1 flex-1 overflow-hidden">
          <div class="flex gap-2 overflow-hidden mb-1">
            <span class="text-[#303133] font-medium truncate">{{ item.sender_uid }}</span>
            <span class="truncate shrink-0">
              {{ dayjs(item.modified).format('MM-DD HH:mm') }}
            </span>
          </div>
          <p class="truncate">{{ item.last_msg || '123' }}</p>
        </div>
      </li>
    </ul>
    <div class="my-3 w-full overflow-hidden">
      <ReportUserChatCRM :uid="activeChatUser" @send="onSend" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { getUserChatMessageByDomainId } from '@/api/report'
import { useBasicLayout } from '@/composables/useBasicLayout'
import { currentEnvConfig } from '@/config'
import type { IPage } from '@/interface/common'
import type { IUserChat } from '@/interface/question'
import { useAuthStore } from '@/stores/auth'
import { UserFilled } from '@element-plus/icons-vue'
import { useWebSocket } from '@vueuse/core'
import dayjs from 'dayjs'
import { storeToRefs } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ReportUserChatCRM from './ReportUserChatCRM.vue'

const route = useRoute()
const router = useRouter()
const domainId = computed(() => route.params.botId as string)
const { isMobile } = useBasicLayout()

const initting = ref(true)
const loading = ref(true)
const chatUsers = ref<IUserChat[]>([])
const pagination = reactive<IPage>({
  page: 1,
  total: 0,
  page_count: 1,
  page_size: 10
})
const hasMoreChatUsers = computed(() => pagination.page !== pagination.page_count)
const activeChatUser = ref('')

const authStoreI = useAuthStore()
const { authToken } = storeToRefs(authStoreI)

const socketInstance = useWebSocket(
  `wss://${currentEnvConfig.socketCRMURL}?token=${authToken.value}`,
  {
    autoReconnect: true,
    onMessage: (ws, msgEvent) => {
      const { data } = msgEvent
      if (!data) {
        return
      }
      const chatMsgItem = JSON.parse(msgEvent.data)
      if (chatMsgItem?.sender_uid !== activeChatUser.value) {
        return
      }
      // chatHistory.value.push({ ...chatMsgItem, id: uuidv4() })
    },
    onError: (ws, event) => {
      // chatHistory.value[chatHistory.value.length - 1].content = err
    }
  }
)

const onSend = (params: Record<string, any>) => {
  socketInstance.send(JSON.stringify(params))
}

const onMoreChatUsers = () => {
  if (!hasMoreChatUsers.value) {
    return
  }
  pagination.page++
  initChatUsers()
}

const initChatUsers = async () => {
  try {
    loading.value = true
    const {
      data: { data, pagination: paginationRes }
    } = await getUserChatMessageByDomainId({
      domain_id: domainId.value,
      page: pagination.page,
      page_size: pagination.page_size
    })
    if (!activeChatUser.value && data.length) {
      activeChatUser.value = data[0].sender_uid
    }
    pagination.total = paginationRes.total
    pagination.page_count = paginationRes.page_count
    chatUsers.value = data
  } catch (e) {
  } finally {
    loading.value = false
  }
}

const init = async () => {
  try {
    initting.value = true
    await initChatUsers()
  } catch (e) {
  } finally {
    initting.value = false
  }
}

watch(domainId, (v) => v && init(), { immediate: true })
</script>
