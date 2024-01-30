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
              <el-form-item label="状态：">
                <el-switch
                  active-text="开启"
                  inactive-text="关闭"
                  v-model="editCreateGroupForm.status"
                />
              </el-form-item>
              <el-row class="w-full mt-3" justify="end">
                <el-col :span="4">
                  <el-button type="primary" @click="handleEditGroup(item)">{{
                    $t('确认修改')
                  }}</el-button>
                </el-col>
              </el-row>
            </el-form>
          </el-collapse>
        </div>
        <el-row justify="start" :gutter="20" class="w-full">
          <el-col :span="6">
            <el-button class="!border-[#7C5CFC] !text-[#7C5CFC]" @click="handleTransfer(item)">
              {{ $t('转移单聊') }}
            </el-button>
          </el-col>
          <el-col :span="6">
            <el-button class="!border-[#7C5CFC] !text-[#7C5CFC]" @click="handleExitGroup(item)">
              {{ $t('退出单聊') }}
            </el-button>
          </el-col>
        </el-row>
      </el-collapse-item>
    </el-collapse>
    <Modal
      title="转移单聊"
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
import { postCommonGraph } from '@/api/graph'
import type { IDomainInfo } from '@/interface/domain'
import type { IGroupList } from '@/interface/release'
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
const curRoomId = ref('')

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
  ElMessageBox.confirm(t('是否确认退出该单聊？'), t('退出单聊'), {
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
  ElMessageBox.confirm(t('请确认是否转移'), t('二次确认'), {
    confirmButtonText: t('确认'),
    cancelButtonText: t('取消'),
    icon: ''
  })
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

watch(transferVisible, (v) => {
  v && (transferStatus.value = false)
})

watch(activeNames, (v: number) => {
  if (v) {
    const result = props.groupList.filter((item) => v === item.id)

    if (result.length) {
      const roomId = result[0].conversation_id
      curRoomId.value = roomId
    }
  }
})
</script>
