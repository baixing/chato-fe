<template>
  <el-drawer
    ref="drawerRef"
    v-model="visible"
    :title="$t(`我创建的群`)"
    :before-close="handleClose"
    class="create-drawer-container"
    :size="isMobile ? '100%' : '40%'"
  >
    <el-collapse v-model="activeNames" accordion>
      <el-collapse-item
        v-for="(item, index) in tableData"
        :key="item.created_at"
        :name="$t('群聊{slot1}：{slot2}', { slot1: index + 1, slot2: item.name })"
      >
        <template #title>
          <p class="leading-5 break-all">{{ $t('群聊') }}{{ index + 1 }}：{{ item.name }}</p>
        </template>
        <div>
          <PublicForm
            v-slot="slotProps"
            :name="item.name"
            :disabled="item.dragon_mother_name"
            :robot_response_type="String(item.response_type)"
            :new_user_in_group_msg="item.new_user_msg"
          >
            <el-form-item
              :label="$t(`群机器人信息：`)"
              class="flex-col items-start"
              label-position="top"
            >
              <div class="flex flex-col">
                <p class="form-item-desc">
                  {{ $t('如需修改机器人名字请') }}
                  <router-link class="theme-color" :to="userRoute">
                    {{ $t('前往形象') }}
                  </router-link>
                  <!-- TODO: i18n -->
                  {{ $t('（群头像暂不支持修改）') }}
                </p>
                <div class="form-itm-content">
                  <img :src="avatar" alt="logo" />
                  {{ nickname }}
                </div>
              </div>
            </el-form-item>
            <el-form-item
              :label="$t(`激活秘钥：`)"
              v-if="item.activate_secret"
              class="flex-col items-start"
            >
              <p class="flex justify-between form-item-desc">
                <span class="mr-[10px]"
                  >{{ $t('添加机器人时请填写：') }}{{ item.activate_secret }}</span
                >
                <el-button type="primary" link @click="$copyText(item.activate_secret)">
                  {{ $t('复制') }}
                </el-button>
              </p>
            </el-form-item>
            <el-form-item
              :label="$t(`机器人二维码：`)"
              v-if="item.activate_secret"
              class="flex-col items-start"
            >
              <div class="preview-code-container" v-loading="codeImgLoading">
                <img :src="robotQrCode?.url" :alt="$t(`机器人二维码`)" />
              </div>
            </el-form-item>
            <el-form-item
              :label="$t(`群二维码：`)"
              v-if="!item.dragon_mother_name"
              class="flex-col items-start"
            >
              <div class="flex flex-col">
                <p class="form-item-desc">
                  {{ $t('首位扫码进群人员为管理员，二维码实时刷新，请确保使用最新码') }}
                </p>
                <div class="preview-code-container" v-loading="codeImgLoading || !isDone">
                  <img :src="qrcode_data" :alt="$t(`群聊二维码`)" />
                  <a
                    class="cm-link"
                    href="javascript:;"
                    @click="() => emit('handleReloadCodeImg', item.room_id)"
                    >{{ $t('刷新') }}</a
                  >
                </div>
              </div>
            </el-form-item>
            <el-form-item>
              <el-button
                class="!text-[#7C5CFC] !border-[#7C5CFC]"
                @click="() => handleTransfer(slotProps.submit, item.id)"
              >
                <!-- TODO: i18n -->
                转移群
              </el-button>
            </el-form-item>
            <el-row justify="end" v-if="!item.dragon_mother_name">
              <el-col :lg="8" :xl="8" :xs="12" :sm="12" :md="12">
                <el-button
                  type="primary"
                  size="large"
                  @click="
                    () =>
                      emit(
                        'submitCreatePublic',
                        slotProps.submit,
                        slotProps.ruleFormCreatePublicRef,
                        ECreatePublicType.edit,
                        item
                      )
                  "
                  >{{ $t('确认') }}</el-button
                >
              </el-col>
            </el-row>
          </PublicForm>
        </div>
      </el-collapse-item>
    </el-collapse>
  </el-drawer>

  <!-- TODO: i18n -->
  <Modal
    title="转移群"
    mobile-width="100%"
    v-model:visible="internalVisible"
    :footer="!transferStatus"
    :submit-disabled="!$notnull(selectedDomain)"
    class="public-drawer-container text-[14px]"
    @submit="submitTransfer"
  >
    <TransferResult @handle-push="handlePushTransfer" v-if="transferStatus" />
    <TransferPublic v-else v-model:value="selectedDomain" :domainList="domainList" />
  </Modal>
</template>
<script lang="ts" setup>
import { serachPublicCreateStatus } from '@/api/release'
import Modal from '@/components/Modal/index.vue'
import { useBasicLayout } from '@/composables/useBasicLayout'
import { ECreatePublicType } from '@/enum/release'
import type { IDomainInfo } from '@/interface/domain'
import type { RobotQrCodeInfoProps } from '@/interface/release'
import { RoutesMap } from '@/router'
import { useDomainStore } from '@/stores/domain'
import { $notnull } from '@/utils/help'
import { ElMessageBox } from 'element-plus'
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import PublicForm from './components/PublicForm.vue'

const props = withDefaults(
  defineProps<{
    value: boolean
    tableData: any[]
    nickname: string
    avatar: string
    domainId: number
    userRoute: string
    qrcode_data: string
    codeImgLoading: boolean
    orgId: number
    robotQrCodeInfo: RobotQrCodeInfoProps
    transferStatus: boolean
    showTransfer: boolean
  }>(),
  {
    qrcode_data: '',
    domainId: 0
  }
)

const emit = defineEmits([
  'update:value',
  'submitCreatePublic',
  'handleReloadCodeImg',
  'handleGetInviteLarge',
  'update:showTransfer',
  'updatePublicList'
])
const router = useRouter()
const { isMobile } = useBasicLayout()
const domainStoreI = useDomainStore()
const { domainList } = storeToRefs(domainStoreI)
const isDone = ref(false)
const activeNames = ref([])
const selectedDomain = ref<IDomainInfo>()
const visible = computed({
  get: () => props.value,
  set: (val) => emit('update:value', val)
})
const robotQrCode = computed(() => props.robotQrCodeInfo)
const slotProps = ref()

const internalVisible = computed({
  get: () => props.showTransfer,
  set: (v) => emit('update:showTransfer', v)
})

const handleTransfer = (slot, id) => {
  slotProps.value = { ...slot, id }
  emit('update:showTransfer', true)
}

const handlePushTransfer = () => {
  domainStoreI.$patch({
    domainInfo: selectedDomain.value
  })
  router.push({
    name: RoutesMap.tranning.botReleaseChannel,
    params: { botId: selectedDomain.value.id }
  })
  emit('update:showTransfer', false)
  emit('update:value', false)
}

const serachPublicStatus = async () => {
  const res = await serachPublicCreateStatus(props.orgId)
  isDone.value = res.data.data.is_done
}

// 转移群
const submitTransfer = () => {
  ElMessageBox.confirm(
    '更换后，群聊信息会移至「机器人名称」的微信群聊位置展示，是否确认？',
    '二次确认',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      icon: ''
    }
  )
    .then(() => {
      emit(
        'submitCreatePublic',
        slotProps.value,
        null,
        ECreatePublicType.transfer,
        selectedDomain.value
      )
    })
    .catch()
}

watch(
  activeNames,
  (v) => {
    if (v) {
      const normal = props.tableData.filter(
        (item) => v.includes(item.name) && !item.dragon_mother_name
      )
      const inviteLarge = props.tableData.filter(
        (item) => v.includes(item.name) && item.activate_secret
      )
      if (normal.length) {
        emit('handleReloadCodeImg', normal[0].room_id)
      }
      if (inviteLarge.length) {
        emit('handleGetInviteLarge')
      }
    }
  },
  { deep: true }
)

const handleClose = () => {
  visible.value = false
  activeNames.value = []
}

watch(visible, (v) => {
  v ? serachPublicStatus() : null
})
</script>
<style scoped lang="scss">
.form-item-desc {
  margin: 6px 0 16px;
  color: #9da3af;
  font-size: 12px;
  line-height: 12px;
}
.form-itm-content {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 16px;
  color: #b5bed0;
  font-size: 14px;
  img {
    width: 38px;
    height: 38px;
    margin-right: 4px;
  }
}
.preview-code-container {
  display: flex;
  align-items: center;
  margin-top: 16px;
  .cm-link {
    font-size: 12px;
    margin-bottom: 10px;
  }

  img {
    overflow: hidden;
    width: 120px;
    height: 120px;
    margin: 10px 10px 10px 0;
    border-radius: 8px;
  }
}
</style>
<style lang="scss">
.public-drawer-container {
  cursor: pointer;
  .el-dialog__header {
    margin-right: 0;
  }
  .el-dialog__body {
    padding-top: 0;
    padding-bottom: 20px;
  }
}
.create-drawer-container {
  .el-drawer__header {
    margin-bottom: 20px;
    color: #303133;
    font-weight: 500;
  }
  .el-drawer__body {
    padding-top: 0;
  }
  .el-collapse {
    border-top: none;
  }
  .el-form-item__label {
    color: #303133;
    font-size: 14px;
  }
}
</style>
