<template>
  <el-drawer
    v-model="visible"
    :title="$t('查看聊天')"
    :before-close="handleClose"
    :size="isMobile ? '100%' : '40%'"
  >
    <el-tabs v-model="activeNames">
      <el-tab-pane :label="$t('单聊')" :name="ECreateChatType.singleChat">
        <SingleGroupChatList
          v-loading="loading && !singleGroupList.length"
          :userRoute="userRoute"
          :domainId="domainId"
          :groupList="singleGroupList"
          :baseURL="baseURL"
          :robotNickname="robotNickname"
          :endpoint="endpoint"
          @handleRefresh="init"
        />
      </el-tab-pane>
      <el-tab-pane :label="$t('群聊')" :name="ECreateChatType.groupChat">
        <GroupChatList
          v-loading="loading && !groupList.length"
          :userRoute="userRoute"
          :groupList="groupList"
          :domainId="domainId"
          :baseURL="baseURL"
          :robotNickname="robotNickname"
          :endpoint="endpoint"
          @handleRefresh="init"
        />
      </el-tab-pane>
    </el-tabs>
  </el-drawer>
</template>
<script lang="ts" setup>
import { getCommonGraph } from '@/api/graph'
import { useBasicLayout } from '@/composables/useBasicLayout'
import { ECreateChatType } from '@/enum/release'
import type { IGroupList } from '@/interface/release'
import { computed, ref, watch } from 'vue'
import GroupChatList from './components/GroupChatList.vue'
import SingleGroupChatList from './components/SingleGroupChatList.vue'

const props = defineProps<{
  value: boolean
  domainId: number
  baseURL: string
  userRoute: string
  robotNickname: string
  endpoint: string
  slugId: string
}>()

const emit = defineEmits(['update:value'])
const { isMobile } = useBasicLayout()
const loading = ref<boolean>(false)
const activeNames = ref<ECreateChatType>(ECreateChatType.singleChat)
const visible = computed({
  get: () => props.value,
  set: (val) => emit('update:value', val)
})

const groupList = ref<IGroupList[]>([]) // 群聊
const singleGroupList = ref<IGroupList[]>([]) // 单聊

const handleClose = () => {
  visible.value = false
}

const init = async () => {
  try {
    loading.value = true
    const isSingle = activeNames.value === ECreateChatType.singleChat
    let apiFunc = !isSingle ? () => getGroupList(2) : () => getGroupList(1)
    const result = await apiFunc()
    isSingle ? (singleGroupList.value = result) : (groupList.value = result)
  } catch (error) {
  } finally {
    loading.value = false
  }
}

const getGroupList = async (type) => {
  const res = await getCommonGraph<IGroupList[]>('hosting_conversation', {
    filter: `conversation_type=="${type}" and domain_slug=="${props.slugId}"`
  })

  return res.data.data
}

watch(
  () => props.value,
  (v) => {
    v && init()
  }
)

watch(
  activeNames,
  () => {
    init()
  },
  { immediate: true }
)
</script>

<style lang="scss">
.group-detail {
  p {
    @apply flex items-center justify-start mb-3 text-sm text-[#303133];
    .content {
      @apply text-[#596780];
    }
  }
}
</style>
