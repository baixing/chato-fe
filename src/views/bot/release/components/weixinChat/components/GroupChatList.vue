<template>
  <div class="h-full min-h-[300px]">
    <el-collapse v-model="activeNames" :accordion="true" v-if="groupList.length > 0">
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
          <p class="text-[#303133] font-medium mb-[16px]">{{ $t('用户须知') }}</p>
          <p class="text-xs text-[#596780] leading-4" v-for="item in RGroupChatListTip" :key="item">
            {{ $t(item) }}
          </p>
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
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { $notnull } from '@/utils/help'
import TransferResult from './TransferResult.vue'
import TransferPublic from './TransferPublic.vue'
import type { IDomainInfo } from '@/interface/domain'
import { useDomainStore } from '@/stores/domain'
import { storeToRefs } from 'pinia'
import { ElMessageBox, ElLoading } from 'element-plus'
import { RoutesMap } from '@/router'
import { useRouter } from 'vue-router'
import { transferGroupAPI, getGroupImgAPI, deleteGroupChatAPI } from '@/api/release'
import { useI18n } from 'vue-i18n'
import type { IGroupList } from '@/interface/release'
import { EAccountStatus } from '@/enum/release'
import { RGroupChatListTip } from '@/constant/release'

const props = defineProps<{
  domainId: number
  groupList: IGroupList[]
  baseURL: string
  userRoute: string
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
    name: RoutesMap.tranning.botUser,
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

watch(transferVisible, (v) => {
  v && (transferStatus.value = false)
})

watch(activeNames, (v: number) => {
  if (v) {
    const result = props.groupList.filter(
      (item) => v === item.id && item.is_system_robot && item.status === EAccountStatus.online
    )
    if (result.length) {
      url.value = result[0].group_qr_code_data
      getGroupQrCode(result[0].room_id)
    }
  }
})
</script>
