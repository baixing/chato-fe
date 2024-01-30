<template>
  <Modal
    width="50%"
    mobile-width="95%"
    v-model:visible="visible"
    :title="$t(`创建聊天`)"
    :footer="false"
    class="create-chat-container"
  >
    <el-tabs v-model="activeCreateType">
      <el-tab-pane :label="$t(`创建群聊`)" :name="ECreateChatType.groupChat">
        <!-- 激活机器人 -->
        <ActivateGroup
          v-if="isCreatingGroupChat"
          :createGroupRes="createGroupRes"
          :type="activateGroup"
          @handleClose="visible = false"
        />
        <div v-else class="w-full">
          <p class="text-[#2F3447] text-sm font-medium mb-[12px]">{{ $t('加入已有群') }}</p>
          <!-- <el-radio-group v-model="activateGroup" class="mb-[12px]">
            <el-radio :label="EActivateGroupType.joinGroupChat">{{ $t('加入已有群') }}</el-radio>
            <el-radio :label="EActivateGroupType.createGroupChat">{{ $t('创建新群') }}</el-radio>
          </el-radio-group> -->
          <!-- 加入已有群聊 -->
          <!-- <template v-if="activateGroup === EActivateGroupType.joinGroupChat"> -->
          <UpgrateVersion
            v-if="!isShowInvite"
            class="!justify-start"
            class-name="md:w-full md:h-auto w-[80%]"
          />
          <CreateGroupForm
            v-else
            :userRoute="userRoute"
            :account-list="accountList"
            @handleSubmit="handleCreateGroup"
            @handleCreateAccount="handleCreateAccount"
          />
          <!-- </template> -->
          <!-- 创建新群 -->
          <!-- <CreateGroupForm
            v-else
            :userRoute="userRoute"
            :name-required="true"
            :account-list="accountList"
            @handleSubmit="handleCreateGroup"
            @handleCreateAccount="handleCreateAccount"
          /> -->
        </div>
      </el-tab-pane>
      <el-tab-pane :label="$t(`创建单聊`)" :name="ECreateChatType.singleChat">
        <!-- 激活机器人 -->
        <ActivateGroup
          v-if="isCreatingSingleGroupChat"
          :createGroupRes="createSingleGroupRes"
          :type="EActivateGroupType.singleGroupChat"
          @handleClose="visible = false"
        />
        <CreateSingleGroupForm
          v-else
          :visible="visible"
          :account-list="accountList"
          @handleCreateAccount="handleCreateAccount"
          @handleSubmit="handleCreateSingleGroup"
        />
      </el-tab-pane>
    </el-tabs>
  </Modal>
</template>

<script setup lang="ts">
import { getCommonGraph } from '@/api/graph'
import { createGroupAPI, createSingleChatAPI, joinGroupChatAPI } from '@/api/release'
import Modal from '@/components/Modal/index.vue'
import UpgrateVersion from '@/components/Upgrade/UpgrateVersion.vue'
import useSpaceRights from '@/composables/useSpaceRights'
import { PaidCommercialTypes } from '@/constant/space'
import { EActivateGroupType, ECreateChatType } from '@/enum/release'
import type { IAccountList, ICreateGroupRes } from '@/interface/release'
import { ElLoading } from 'element-plus'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ActivateGroup from './components/ActivateGroup.vue'
import CreateGroupForm from './components/CreateGroupForm.vue'
import CreateSingleGroupForm from './components/CreateSingleGroupForm.vue'

const props = defineProps<{
  value: boolean
  userRoute: string
  chatAPI: string
  robotNickname: string
  domainId: number
  orgId: number
  mobileNumber: string
  domainSlug: string
  welcome: string
}>()
const emit = defineEmits(['update:value', 'handleCreateAccount'])

const { t } = useI18n()
const { isAllowedCommercialType } = useSpaceRights()
const activeCreateType = ref<ECreateChatType>(ECreateChatType.groupChat)
const createGroupRes = ref<ICreateGroupRes>()
const createSingleGroupRes = ref<ICreateGroupRes>()
const activateGroup = ref<EActivateGroupType>(EActivateGroupType.joinGroupChat)
const accountList = ref<IAccountList[]>([])
const isCreatingGroupChat = ref<boolean>(false)
const isCreatingSingleGroupChat = ref<boolean>(false)
const isShowInvite = computed(() => isAllowedCommercialType(PaidCommercialTypes))
const visible = computed({
  get: () => props.value,
  set: (v) => emit('update:value', v)
})

const commonGroupParam = computed(() => ({
  endpoint: props.chatAPI,
  domain_id: props.domainId,
  org_id: props.orgId
}))

// 群聊
const handleCreateGroup = async (e) => {
  const loading = ElLoading.service({
    lock: true,
    text: t('创建中...'),
    background: 'rgba(0, 0, 0, 0.7)'
  })
  const data = {
    robot_nickname: props.robotNickname,
    owner_phone_number: props.mobileNumber,
    ...commonGroupParam.value,
    ...e
  }
  let apiFunc =
    activateGroup.value === EActivateGroupType.joinGroupChat
      ? joinGroupChatAPI // 加入已有群
      : createGroupAPI // 创建新群
  try {
    const res = await apiFunc(props.domainId, data)
    createGroupRes.value = res.data.data
    isCreatingGroupChat.value = true
  } catch (e) {
  } finally {
    loading.close()
  }
}

// 单聊
const handleCreateSingleGroup = async (e: { account: string }) => {
  const loading = ElLoading.service({
    lock: true,
    text: t('创建中...'),
    background: 'rgba(0, 0, 0, 0.7)'
  })

  try {
    const data = {
      ...commonGroupParam.value,
      robot_wx_user_id: e.account,
      new_user_msg: props.welcome
    }
    const res = await createSingleChatAPI(data)
    createSingleGroupRes.value = res.data.data
    isCreatingSingleGroupChat.value = true
  } catch (e) {
  } finally {
    loading.close()
  }
}

const handleCreateAccount = () => {
  visible.value = false
  isCreatingGroupChat.value = false
  emit('handleCreateAccount')
}

const init = async () => {
  isCreatingGroupChat.value = false
  isCreatingSingleGroupChat.value = false
  const res = await getCommonGraph<any>('hosting_account', {
    filter: `org_id=="${props.orgId}"`,
    size: 500
  })
  // serachAccountListAPI(props.orgId)
  accountList.value = res.data.data.filter((item: IAccountList) => item.status !== 2)
}

watch(visible, (v) => {
  v && init()
})
</script>

<style lang="scss">
.create-chat-container {
  .el-form-item__label {
    @apply text-[#303133] font-medium;
  }
}
</style>
