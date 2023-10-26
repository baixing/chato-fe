<template>
  <div class="h-full min-h-[300px]">
    <el-collapse
      v-if="groupList.length > 0"
      v-model="activeNames"
      :accordion="true"
      @change="handleChange"
    >
      <el-collapse-item v-for="item in groupList" :key="item.token" :name="item.id">
        <template #title>
          <p class="leading-5 break-all">
            {{ $t(item.is_system_robot ? '群名' : '系统账号') }}：{{ item.group_name }}
          </p>
        </template>
        <div class="w-full text-[#303133] leading-5 group-detail text-sm">
          <p>
            {{ $t('账号') }}：
            <span class="content">{{ $t(item.is_system_robot ? '系统账号' : '自定义账号') }}</span>
          </p>
          <p>
            {{ $t('机器人群昵称') }}：
            <span class="content">{{ item.name }}</span>
            <span class="ml-[16px] text-[#9DA3AF]"> {{ $t('前往「形象」') }} </span>
            <router-link :to="userRoute" class="theme-color">{{ $t('修改') }}</router-link>
            <el-tooltip
              effect="dark"
              :content="
                $t(
                  '勿在企微中更改机器人群昵称，更改会导致机器人不回复；如需更改，请前往「形象」更改'
                )
              "
              placement="top"
              class="max-w-[300px]"
            >
              <svg-icon name="question-circle" class="ml-[4px]"></svg-icon>
            </el-tooltip>
          </p>
          <p>
            {{ $t('组织') }}： <span class="content">{{ item.corp_name }}</span>
          </p>
          <p>
            {{ $t('群人数') }}：
            <span class="content">{{ item.people_cnt || 0 }} {{ $t('人') }} </span>
          </p>
          <p>
            {{ $t('状态') }}： <span class="content">{{ item.status }}</span>
          </p>
          <p
            class="flex justify-start items-center"
            v-if="item.is_system_robot && item.status === EAccountStatus.online"
          >
            {{ $t('群二维码') }}：
            <img class="w-[120px] h-[120px]" :src="url" alt="" />
            <el-button
              type="primary"
              class="ml-[16px]"
              link
              @click="getGroupQrCode(item.room_id)"
            ></el-button>
          </p>
          <p class="flex justify-start items-center" v-if="item.robot_qr_code_data">
            {{ $t('机器人二维码') }}：
            <img class="w-[120px] h-[120px]" :src="item.robot_qr_code_data" alt="" />
          </p>
          <p class="flex justify-start items-center" v-if="!item.is_system_robot">
            {{ $t('Token') }}： <span>{{ item.token }}</span>
            <el-button class="ml-[12px]" type="primary" link @click="$copyText(item.token)">
              {{ $t('复制') }}
            </el-button>
          </p>
          <el-collapse
            style="--el-collapse-border-color: transparent"
            class="w-full !border-0 text-sm group-collpase-container"
          >
            <el-collapse-item :title="$t(`群高级设置`)" name="1" class="border-0 text-sm">
              <el-form
                ref="ruleFormEditCreateGroupRef"
                size="large"
                label-position="top"
                :rules="rulesEditCreateGroup"
                :model="editCreateGroupForm"
              >
                <el-form-item :label="$t(`回复方式`)" prop="robot_response_type">
                  <el-select
                    v-model="editCreateGroupForm.robot_response_type"
                    class="w-full"
                    :placeholder="$t(`请选择回复方式`)"
                  >
                    <el-option :label="$t(`仅{'@'}回复`)" value="1" />
                    <el-option :label="$t(`{'@'}或者提及昵称回复`)" value="2" />
                  </el-select>
                </el-form-item>
                <el-form-item :label="$t(`新人进群{'@'}Ta打招呼`)" prop="new_user_in_group_msg">
                  <el-input
                    type="textarea"
                    :rows="5"
                    v-model="editCreateGroupForm.new_user_msg"
                    :placeholder="$t(`请输入新人进群{'@'}Ta打招呼欢迎语`)"
                  />
                </el-form-item>
                <el-text class="!text-sm" type="info">
                  {{ $t('如需修改机器人在群里的名字，请前往') }}
                  <router-link :to="userRoute" class="theme-color">{{
                    $t('「形象」')
                  }}</router-link>
                  {{ $t('进行编辑机器人昵称，首位进群人员为管理员') }}
                </el-text>
                <el-row class="w-full mt-3" justify="end">
                  <el-col :span="4">
                    <el-button type="primary" @click="handleEditGroup(item)">{{
                      $t('确认修改')
                    }}</el-button>
                  </el-col>
                </el-row>
              </el-form>
            </el-collapse-item>
          </el-collapse>
          <p class="text-[#303133] font-medium mb-[16px]">{{ $t('用户须知') }}</p>
          <p class="text-xs text-[#596780] leading-4" v-for="item in RGroupChatListTip" :key="item">
            {{ $t(item) }}
          </p>
          <!-- 定时广播 -->
          <p class="text-[#303133] font-medium">{{ $t('定时广播') }}</p>
          <div
            v-for="(item, index) in radioList"
            :key="item.send_schedule_id"
            class="flex items-center justify-between bg-[#E4E7ED] mt-4 mb-5 py-2 px-3 rounded"
          >
            <span class="text-sm">{{ $t('定时广播') }} {{ index + 1 }}</span>
            <div class="gap-10">
              <el-button
                link
                type="primary"
                class="mr-5"
                @click="handleSettingRadio(item, ESettingBroadcastStatus.update)"
              >
                {{ $t('设置') }}
              </el-button>
              <el-button link type="primary" @click="handleSettingRemove(item)">
                {{ $t('删除') }}
              </el-button>
            </div>
          </div>
          <el-button
            v-if="radioList.length < 5"
            class="mb-5"
            link
            type="primary"
            @click="handleSettingRadio(undefined, ESettingBroadcastStatus.create)"
          >
            <el-icon :size="18" class="mr-2"><Plus /></el-icon> {{ $t('添加定时广播') }}
          </el-button>
        </div>
        <el-row justify="start" :gutter="20" class="w-full">
          <el-col :span="6">
            <el-button class="!border-[#7C5CFC] !text-[#7C5CFC]" @click="handleTransfer(item)">
              {{ $t('转移群') }}
            </el-button>
          </el-col>
          <el-col :span="6">
            <el-button class="!border-[#7C5CFC] !text-[#7C5CFC]" @click="handleExitGroup(item)">
              {{ $t('退出群') }}
            </el-button>
          </el-col>
        </el-row>
      </el-collapse-item>
    </el-collapse>
    <Modal
      title="转移群"
      mobile-width="100%"
      v-model:visible="transferVisible"
      :footer="false"
      :submit-disabled="!$notnull(selectedDomain)"
      class="text-[14px]"
    >
      <TransferPublic
        v-if="!transferStatus"
        v-model:value="selectedDomain"
        :domainList="domainList"
      />
      <TransferResult v-else @handle-push="handlePushTransfer" />
      <el-row justify="end" :gutter="20" class="w-full" v-if="!transferStatus">
        <el-col :span="5">
          <el-button @click="transferVisible = false">
            {{ $t('取消') }}
          </el-button>
        </el-col>
        <el-col :span="5">
          <el-button type="primary" @click="submitTransfer">
            {{ $t('确认') }}
          </el-button>
        </el-col>
      </el-row>
    </Modal>
    <SettingRadio
      v-model:value="settingDadioVisible"
      :defaultItem="currentSettingRadio"
      @handleSubmit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, reactive } from 'vue'
import { $notnull } from '@/utils/help'
import TransferResult from './TransferResult.vue'
import TransferPublic from './TransferPublic.vue'
import type { IDomainInfo } from '@/interface/domain'
import { useDomainStore } from '@/stores/domain'
import { storeToRefs } from 'pinia'
import {
  ElMessageBox,
  ElLoading,
  ElNotification,
  type FormInstance,
  type FormRules
} from 'element-plus'
import { RoutesMap } from '@/router'
import { useRouter } from 'vue-router'
import {
  transferGroupAPI,
  getGroupImgAPI,
  deleteGroupChatAPI,
  editGroupAPI,
  getTimeBroadcastAPI,
  postTimeBroadcastAPI,
  deleteTimeBroadcastAPI,
  patchTimeBroadcastAPI
} from '@/api/release'
import { useI18n } from 'vue-i18n'
import type { IGroupList, ISettingBroadcastType } from '@/interface/release'
import { EAccountStatus, ESettingBroadcastStatus } from '@/enum/release'
import { RGroupChatListTip } from '@/constant/release'
import SettingRadio from './SettingRadio.vue'

const props = defineProps<{
  domainId: number
  groupList: IGroupList[]
  baseURL: string
  userRoute: string
  endpoint: string
  robotNickname: string
}>()
const emit = defineEmits(['handleRefresh'])

const { t } = useI18n()
const router = useRouter()
const domainStoreI = useDomainStore()
const { domainList } = storeToRefs(domainStoreI)
const activeNames = ref<number>()
const transferVisible = ref(false)
const transferStatus = ref(false)
const selectedDomain = ref<IDomainInfo>()
const currentGroup = ref<IGroupList>()
const qrLoading = ref(true)
const url = ref('')
const ruleFormEditCreateGroupRef = ref<FormInstance>()
const settingDadioVisible = ref(false)
const radioList = ref<ISettingBroadcastType[]>([])
const currentSettingRadio = ref<ISettingBroadcastType>()
const curRoomId = ref('')
const settingRadioStatus = ref<ESettingBroadcastStatus>(ESettingBroadcastStatus.create)

const rulesEditCreateGroup = reactive<FormRules>({
  robot_response_type: [{ required: true, trigger: 'blur', message: t('请选择回复方式') }]
})

const editCreateGroupForm = reactive({
  robot_response_type: '1',
  new_user_msg: ''
})

const handleChange = (id: string) => {
  const item = props.groupList.find((item) => item.id === Number(id))
  if ($notnull(item)) {
    editCreateGroupForm.new_user_msg = item.new_user_msg
    editCreateGroupForm.robot_response_type = String(item.response_type)
  }
}

const handleEditGroup = async (item: IGroupList) => {
  const loading = ElLoading.service({
    lock: true,
    text: t('修改中...'),
    background: 'rgba(0, 0, 0, 0.7)'
  })
  try {
    const data = {
      id: item.id,
      robot_nickname: props.robotNickname,
      endpoint: props.endpoint,
      name: item.name,
      response_type: editCreateGroupForm.robot_response_type,
      new_user_msg: editCreateGroupForm.new_user_msg
    }
    await editGroupAPI(props.domainId, data)
    ElNotification.success('修改成功')
    emit('handleRefresh')
  } catch (error) {
  } finally {
    loading.close()
  }
}

const getChatAPI = (baseURL: string, slug: string) => {
  return `${baseURL}/chato/api-public/domains/${slug}/chat`
}

const handleTransfer = (row: IGroupList) => {
  currentGroup.value = row
  transferVisible.value = true
}

const handleExitGroup = (row: IGroupList) => {
  ElMessageBox.confirm(
    t('是否确认退出该群？确认后机器人会从群聊中退出、群聊额度会恢复，此操作无法撤消。'),
    t('退出群'),
    {
      confirmButtonText: t('确认'),
      cancelButtonText: t('取消'),
      icon: ''
    }
  )
    .then(async () => {
      const loading = ElLoading.service({
        lock: true,
        text: t('退出中...'),
        background: 'rgba(0, 0, 0, 0.7)'
      })

      try {
        await deleteGroupChatAPI(row.room_id)
        emit('handleRefresh')
      } catch (e) {
      } finally {
        loading.close()
      }
    })
    .catch()
}

const submitTransfer = () => {
  ElMessageBox.confirm(
    t('更换后，群聊信息会移至「机器人名称」的微信群聊位置展示，是否确认？'),
    t('二次确认'),
    {
      confirmButtonText: t('确认'),
      cancelButtonText: t('取消'),
      icon: ''
    }
  )
    .then(async () => {
      const loading = ElLoading.service({
        lock: true,
        text: t('转移中...'),
        background: 'rgba(0, 0, 0, 0.7)'
      })
      const data = {
        id: currentGroup.value.id,
        robot_nickname: selectedDomain.value.name,
        endpoint: getChatAPI(props.baseURL, selectedDomain.value.slug),
        name: currentGroup.value.group_name,
        new_domain_id: selectedDomain.value.id
      }
      try {
        await transferGroupAPI(props.domainId, data)
        transferStatus.value = true
        emit('handleRefresh')
      } catch (e) {
      } finally {
        loading.close()
      }
    })
    .catch()
}

const handlePushTransfer = () => {
  domainStoreI.$patch({
    domainInfo: selectedDomain.value
  })
  router.push({
    name: RoutesMap.tranning.roleInfo,
    params: { botId: selectedDomain.value.id }
  })
  transferVisible.value = false
  transferStatus.value = false
}

const getGroupQrCode = async (id: string) => {
  qrLoading.value = true
  const res = await getGroupImgAPI(props.domainId, id)
  url.value = res.data.data.qrcode_data
  qrLoading.value = false
}

// ------ 定时广播 -----
const initTimeBroadcast = async (id: string) => {
  const { data } = await getTimeBroadcastAPI({ domain: props.domainId, receiver_id: id })
  radioList.value = data.data
}

const handleSettingRadio = (
  item?: ISettingBroadcastType | undefined,
  status?: ESettingBroadcastStatus
) => {
  settingDadioVisible.value = true
  currentSettingRadio.value = status === ESettingBroadcastStatus.update ? item : null
  settingRadioStatus.value = status
}

const handleSubmit = async (item: ISettingBroadcastType) => {
  const loading = ElLoading.service({
    lock: true,
    text: t('设置中...'),
    background: 'rgba(0, 0, 0, 0.7)'
  })
  try {
    const postFunc =
      settingRadioStatus.value === ESettingBroadcastStatus.create
        ? postTimeBroadcastAPI
        : patchTimeBroadcastAPI
    await postFunc({
      ...item,
      domain: props.domainId,
      receiver_id: curRoomId.value
    })
    settingDadioVisible.value = false
    initTimeBroadcast(curRoomId.value)
    settingRadioStatus.value = ESettingBroadcastStatus.create
    ElNotification.success('设置成功')
  } catch (error) {
  } finally {
    loading.close()
  }
}

const handleSettingRemove = async (item: ISettingBroadcastType) => {
  const loading = ElLoading.service({
    lock: true,
    text: t('删除中...'),
    background: 'rgba(0, 0, 0, 0.7)'
  })
  try {
    await deleteTimeBroadcastAPI({ send_schedule_id: item.send_schedule_id })
    initTimeBroadcast(curRoomId.value)
    ElNotification.success('删除成功')
  } catch (error) {
  } finally {
    loading.close()
  }
}
// ------------------

watch(transferVisible, (v) => {
  v && (transferStatus.value = false)
})

watch(activeNames, (v: number) => {
  if (v) {
    const result = props.groupList.filter(
      (item) => v === item.id && item.is_system_robot && item.status === EAccountStatus.online
    )
    if (result.length) {
      const roomId = result[0].room_id
      url.value = result[0].group_qr_code_data
      curRoomId.value = roomId
      getGroupQrCode(roomId)
      initTimeBroadcast(roomId)
    }
  }
})
</script>
