<template>
  <el-drawer
    v-model="visible"
    :title="$t('查看聊天')"
    :before-close="handleClose"
    class="drawer-chat-container"
    :size="isMobile ? '100%' : '40%'"
  >
    <el-tabs v-model="activeNames">
      <el-tab-pane :label="$t('单聊')" :name="ECreateChatType.singleChat">
        <SingleGroupChatList
          v-loading="loading && !singleGroupList.length"
          :userRoute="userRoute"
          :domainId="domainId"
          :baseURL="baseURL"
          :singleGroupList="singleGroupList"
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
import { useBasicLayout } from '@/composables/useBasicLayout'
import { computed, ref, watch } from 'vue'
import { ECreateChatType } from '@/enum/release'
import GroupChatList from './components/GroupChatList.vue'
import SingleGroupChatList from './components/SingleGroupChatList.vue'
import { getGroupListAPI, getSingleGroupListAPI } from '@/api/release'
import type { ISingelGroupList, IGroupList } from '@/interface/release'

const props = defineProps<{
  value: boolean
  domainId: number
  baseURL: string
  userRoute: string
  robotNickname: string
  endpoint: string
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
const singleGroupList = ref<ISingelGroupList[]>([]) // 单聊

const handleClose = () => {
  visible.value = false
}

const init = async () => {
  try {
    loading.value = true
    const isSingle = activeNames.value === ECreateChatType.singleChat
    let apiFunc = !isSingle ? getGroupListAPI : getSingleGroupListAPI
    const res = await apiFunc(props.domainId)
    const result = res.data.data
    isSingle
      ? (singleGroupList.value = result as ISingelGroupList[])
      : (groupList.value = result as IGroupList[])
  } catch (error) {
  } finally {
    loading.value = false
  }
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
.drawer-chat-container {
  .el-drawer__header {
    @apply mb-5 text-[#303133] font-medium;
  }
  .el-drawer__body {
    @apply pt-0;
  }
  .el-collapse {
    @apply border-t-0;
  }
}

.group-detail {
  p {
    @apply flex items-center justify-start mb-3 text-sm text-[#303133];
    .content {
      @apply text-[#596780];
    }
  }
}
</style>
