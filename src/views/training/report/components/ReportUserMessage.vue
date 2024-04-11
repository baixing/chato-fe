<template>
  <div
    v-loading="initting"
    :class="[
      'flex overflow-hidden border border-solid border-[#E4E7ED] rounded-lg',
      isMobile ? 'h-[calc(100vh-214px)]' : 'h-[calc(100vh-190px)]'
    ]"
  >
    <template v-if="activeChatUser">
      <div
        class="w-2/5 max-w-[360px] lg:w-1/2 xl:w-1/2 xl:max-w-[300px] border-r border-t-0 border-b-0 border-l-0 border-solid border-[#E4E7ED] overflow-auto py-2 px-2"
      >
        <ul
          v-infinite-scroll="onMoreChatUsers"
          :infinite-scroll-disabled="scrollDisabled"
          class="space-y-1"
        >
          <li
            v-for="(item, index) in chatUsers"
            :key="item.sender_uid"
            :class="[
              'flex items-center gap-2 rounded-md px-2 py-[6px] overflow-hidden transition-colors cursor-pointer hover:bg-[#f2f3f5bd]',
              activeChatUser === item.sender_uid && 'bg-[#f2f3f5bd]'
            ]"
            @click="onChangeActiveChatUser(item.sender_uid, index)"
          >
            <el-badge
              :hidden="activeChatUser === item.sender_uid || !item.new_count"
              :value="item.new_count"
              :max="99"
              class="msg-count"
            >
              <el-avatar
                :size="isMobile ? 32 : 36"
                class="shrink-0 font-medium text-lg"
                :style="{
                  '--el-avatar-text-size': '18px',
                  '--el-avatar-bg-color': item.avatar
                }"
              >
                {{ item.nickname.slice(-1).toLocaleUpperCase() }}
              </el-avatar>
            </el-badge>
            <div class="text-xs lg:text-xs text-gray-400 leading-5 flex-1 overflow-hidden">
              <div class="flex items-center gap-2 overflow-hidden">
                <span class="text-[#303133] font-medium truncate text-sm flex-1">
                  {{ item.nickname }}
                </span>
                <span class="truncate shrink-0">
                  {{ dayjs(item.modified).format('MM-DD HH:mm') }}
                </span>
              </div>
              <p class="truncate">{{ item.last_msg }}</p>
            </div>
          </li>
        </ul>
        <LoadingMore :visible="loading" />
      </div>
      <div class="relative my-3 mt-0 w-full overflow-hidden pt-16">
        <ReportChatSource :uid="activeChatUser" />
        <ReportUserChatCRM :uid="activeChatUser" @send="onSend" />
      </div>
    </template>
    <el-empty v-else class="mx-auto" />
  </div>
</template>

<script setup lang="ts">
import { getUserChatMessageByDomainId } from '@/api/report'
import LoadingMore from '@/components/LoadingMore/index.vue'
import { useBasicLayout } from '@/composables/useBasicLayout'
import { currentEnvConfig } from '@/config'
import type { IPage } from '@/interface/common'
import type { IUserChat } from '@/interface/question'
import { useAuthStore } from '@/stores/auth'
import { useChatUserStore } from '@/stores/chatUser'
import { useDomainStore } from '@/stores/domain'
import { generateRandomRGB } from '@/utils/help'
import { useWebSocket } from '@vueuse/core'
import dayjs from 'dayjs'
import { storeToRefs } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import { computed, reactive, ref, toRaw, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ReportChatSource from './ReportChatSource.vue'
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
  page_count: 0,
  page_size: 10,
  size: 10
})

const hasMoreChatUsers = computed(
  () => pagination.page_count && pagination.page !== pagination.page_count
)
const scrollDisabled = computed(() => loading.value || !hasMoreChatUsers.value)
const activeChatUser = ref('')

const currentChatUser = computed<Partial<IUserChat>>(
  () =>
    chatUsers.value.find((item) => item.sender_uid === activeChatUser.value) || {
      source: '',
      source_id: ''
    }
)

const domainStoreI = useDomainStore()
const { domainInfo } = storeToRefs(domainStoreI)
const chatUserStoreI = useChatUserStore()
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
      if (domainInfo.value.slug !== chatMsgItem?.domain_slug) {
        return
      }
      chatUserStoreI.addUserChatMessage(chatMsgItem.sender_uid, { ...chatMsgItem, id: uuidv4() })
      refreshChatUsersOrder(chatMsgItem)
    }
  }
)

const refreshChatUsersOrder = (chatMsgItem) => {
  const now = dayjs().format('MM-DD HH:mm')
  const newChatUsers = [...toRaw(chatUsers.value)]
  const findIndex = newChatUsers.findIndex((item) => item.sender_uid === chatMsgItem.sender_uid)
  if (findIndex === -1) {
    const newChatItem = {
      sender_uid: chatMsgItem.sender_uid,
      avatar: generateRandomRGB(),
      source_id: chatMsgItem.source_id,
      source: chatMsgItem.source,
      nickname: rednerUserName(chatMsgItem.sender_uid),
      tag: '',
      modified: now,
      new_count: chatMsgItem.sender_uid === activeChatUser.value ? 0 : 1,
      last_msg: chatMsgItem.content
    }
    newChatUsers.unshift(newChatItem)
  } else {
    const spliceArr = newChatUsers.splice(findIndex, 1)
    const newChatItem: IUserChat = {
      ...spliceArr[0],
      new_count: chatMsgItem.sender_uid === activeChatUser.value ? 0 : spliceArr[0].new_count + 1,
      last_msg: chatMsgItem.content,
      modified: now
    }
    newChatUsers.unshift(newChatItem)
  }

  chatUsers.value = newChatUsers
}

const rednerUserName = (str: string) => {
  return str
}

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

const onChangeActiveChatUser = (uid: string, userIndex: number) => {
  activeChatUser.value = uid
  chatUsers.value[userIndex].new_count = 0
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
    // getCommonGraph<any>('chato_domains', {
    //   filter: `domain_id=="${domainId.value}"`,
    //   page: pagination.page,
    //   size: pagination.page_size,
    //   sort: '-id'
    // })
    if (!activeChatUser.value && data.length) {
      activeChatUser.value = data[0].sender_uid
    }
    pagination.total = paginationRes.total
    pagination.page_count = paginationRes.page_count
    const chatUsersData = [...toRaw(chatUsers.value)]
    data.forEach((item) => {
      const userChatItem = {
        sender_uid: item.sender_uid,
        avatar: generateRandomRGB(),
        new_count: 0,
        source_id: item.source_id,
        source: item.source,
        tag: item.tags_str,
        modified: item.modified,
        nickname: rednerUserName(item.sender_uid),
        last_msg: item.answer || item.question
      }
      chatUsersData.push(userChatItem)
    })
    chatUsers.value = chatUsersData
  } catch (e) {
  } finally {
    loading.value = false
  }
}

const init = async () => {
  try {
    initting.value = true
    chatUsers.value = []
    activeChatUser.value = ''
    pagination.page = 1
    pagination.page_count = 1
    await initChatUsers()
  } catch (e) {
  } finally {
    initting.value = false
  }
}

watch(domainId, (v) => v && init(), { immediate: true })
</script>

<style lang="scss" scoped>
.msg-count {
  --el-badge-size: 16px;
  --el-badge-padding: 4px;

  :deep(.el-badge__content) {
    border: none;
    top: 2px;
    scale: 0.9;
  }
}
</style>
