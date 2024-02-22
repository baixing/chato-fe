<template>
  <div class="h-full min-h-[300px]">
    <el-collapse
      v-if="groupList.length > 0"
      v-model="activeNames"
      :accordion="true"
      @change="handleChange"
    >
      <el-collapse-item v-for="item in groupList" :key="item.id" :name="item.id">
        <template #title>
          <p class="leading-5 break-all">{{ item.title }}</p>
        </template>
        <div class="w-full text-[#303133] leading-5 group-detail text-sm">
          <p>
            {{ $t('机器人群昵称') }}：
            <span class="content">{{ item.additions.nickname }}</span>
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
            {{ $t('创建时间') }}：
            <span class="content">{{ dayjs(item.created).format('YYYY-MM-DD HH:mm:ss') }}</span>
          </p>
          <el-collapse
            style="--el-collapse-border-color: transparent"
            class="w-full !border-0 text-sm group-collpase-container"
          >
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
              <el-form-item label="状态：">
                <el-switch
                  active-text="开启"
                  inactive-text="关闭"
                  v-model="editCreateGroupForm.status"
                />
              </el-form-item>
              <el-text class="!text-sm" type="info">
                {{ $t('如需修改机器人在群里的名字，请前往') }}
                <router-link :to="userRoute" class="theme-color">{{ $t('「形象」') }}</router-link>
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
          </el-collapse>
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
              {{ $t('转移群聊') }}
            </el-button>
          </el-col>
          <el-col :span="6">
            <el-button class="!border-[#7C5CFC] !text-[#7C5CFC]" @click="handleExitGroup(item)">
              {{ $t('退出群聊') }}
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
import { getCommonGraph, postCommonGraph } from '@/api/graph'
import { patchTimeBroadcastAPI, postTimeBroadcastAPI } from '@/api/release'
import { ESettingBroadcastStatus } from '@/enum/release'
import type { IDomainInfo } from '@/interface/domain'
import type { IGroupList, ISettingBroadcastType } from '@/interface/release'
import { RoutesMap } from '@/router'
import { useDomainStore } from '@/stores/domain'
import { $notnull } from '@/utils/help'
import {
  ElLoading,
  ElMessageBox,
  ElNotification,
  dayjs,
  type FormInstance,
  type FormRules
} from 'element-plus'
import { storeToRefs } from 'pinia'
import { reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import SettingRadio from './SettingRadio.vue'
import TransferPublic from './TransferPublic.vue'
import TransferResult from './TransferResult.vue'

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
  new_user_msg: '',
  status: true
})

const handleChange = (id: string) => {
  const item = props.groupList.find((item) => item.id === Number(id))
  if ($notnull(item)) {
    editCreateGroupForm.new_user_msg = item.additions.wellcome
    editCreateGroupForm.robot_response_type = String(item.additions.response_type)
    editCreateGroupForm.status = item.status === 1 ? true : false
  }
}

const handleEditGroup = async (item: IGroupList) => {
  const loading = ElLoading.service({
    lock: true,
    text: t('修改中...'),
    background: 'rgba(0, 0, 0, 0.7)'
  })
  try {
    await postCommonGraph('hosting_conversation/save', {
      id: item.id,
      additions: {
        nickname: item.additions.nickname,
        response_type: Number(editCreateGroupForm.robot_response_type),
        wellcome: editCreateGroupForm.new_user_msg
      },
      status: editCreateGroupForm.status ? 1 : 2
    })
    ElNotification.success('修改成功')
    emit('handleRefresh')
  } catch (error) {
  } finally {
    loading.close()
  }
}

const handleTransfer = (row: IGroupList) => {
  currentGroup.value = row
  transferVisible.value = true
}

const handleExitGroup = (row: IGroupList) => {
  ElMessageBox.confirm(t('是否确认退出该群？'), t('退出群'), {
    confirmButtonText: t('确认'),
    cancelButtonText: t('取消'),
    icon: ''
  })
    .then(async () => {
      const loading = ElLoading.service({
        lock: true,
        text: t('退出中...'),
        background: 'rgba(0, 0, 0, 0.7)'
      })

      try {
        // await deleteGroupChatAPI(row.room_id)
        await postCommonGraph('hosting_conversation/save', {
          id: row.id,
          deleted: dayjs().format('YYYY-MM-DD HH:mm:ss')
          // domain_slug: selectedDomain.value.slug
        })
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

      try {
        await postCommonGraph('hosting_conversation/save', {
          id: currentGroup.value.id,
          domain_slug: selectedDomain.value.slug
        })
        // await transferGroupAPI(props.domainId, data)
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

// ------ 定时广播 -----
const initTimeBroadcast = async (id: string) => {
  const { data } = await getCommonGraph<ISettingBroadcastType[]>('send_schedule', {
    filter: `domain_id=="${props.domainId}" and receiver_id=="${id}"`
  })
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
    await postCommonGraph('send_schedule/save', {
      id: item.send_schedule_id,
      deleted: dayjs().format('YYYY-MM-DD HH:mm:ss')
    })
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
    const result = props.groupList.filter((item) => v === item.id)

    if (result.length) {
      const roomId = result[0].conversation_id
      initTimeBroadcast(roomId)
      curRoomId.value = roomId
    }
  }
})
</script>
