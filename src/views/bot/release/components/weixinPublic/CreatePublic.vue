<template>
  <Modal
    width="50%"
    mobile-width="100%"
    v-model:visible="internalVisible"
    :title="$t(`创建群聊`)"
    :footer="false"
    class="create-public-container"
  >
    <div class="w-full mb-[20px] py-[8px] px-4 bg-[#FCF6EC] text-[#E6A23C] leading-5 text-[14px]">
      <p>
        {{ $t('· 群聊仅限「企微外部群」，即群由企微账号创建，并有个人微信群成员。') }}
      </p>
      <p>
        {{ $t('· 创建新群时，群主为系统分配的「建群机器人」，且不可转让') }}
      </p>
    </div>
    <el-tabs v-model="activeName" class="w-full">
      <el-tab-pane v-if="isShowInvite" :label="$t(`拉入已有群`)" name="invite">
        <InvitePublicImgCode
          :robotQrCodeInfo="robotQrCodeInfo"
          @handleClose="emit('update:value', false)"
          v-if="$notnull(robotQrCodeInfo)"
        />
        <InvitePublicForm
          v-else
          :userRoute="userRoute"
          @handleCancel="emit('update:value', false)"
          @submitCreatePublic="submitCreatePublic"
        />
      </el-tab-pane>
      <el-tab-pane :label="$t(`创建群聊`)" name="create">
        <CreatePublicForm
          :userRoute="userRoute"
          @handleCancel="emit('update:value')"
          @handleCopyApiUrl="(url) => emit('handleCopyApiUrl', url)"
          @submitCreatePublic="submitCreatePublic"
      /></el-tab-pane>
    </el-tabs>
  </Modal>
</template>
<script setup lang="ts">
import Modal from '@/components/Modal/index.vue'
import useSpaceRights from '@/composables/useSpaceRights'
import { PaidCommercialTypes } from '@/constant/space'
import type { ETabPublicType } from '@/enum/release'
import type { RobotQrCodeInfoProps, weixinCreateConfigType } from '@/interface/release'
import { $notnull } from '@/utils/help'
import { computed } from 'vue'
import CreatePublicForm from './components/CreatePublicForm.vue'
import InvitePublicForm from './components/InvitePublicForm.vue'
import InvitePublicImgCode from './components/InvitepublicImgCode.vue'

const { isAllowedCommercialType } = useSpaceRights()

const props = defineProps<{
  value: boolean
  userRoute: string
  activeName: ETabPublicType
  robotQrCodeInfo: RobotQrCodeInfoProps
}>()

const isShowInvite = computed(() => isAllowedCommercialType(PaidCommercialTypes))

const emit = defineEmits([
  'update:value',
  'handleCopyApiUrl',
  'submitCreatePublic',
  'update:activeName'
])

const activeName = computed({
  get: () => props.activeName,
  set: (val) => emit('update:activeName', val)
})

const internalVisible = computed({
  get: () => props.value,
  set: (v) => emit('update:value', v)
})

const submitCreatePublic = (form: weixinCreateConfigType, formEl, type) => {
  emit('submitCreatePublic', form, formEl, type)
}
</script>
<style lang="scss">
.create-public-container {
  .el-dialog__header {
    margin-right: 0;
  }
  .el-dialog__body {
    padding-top: 0;
    padding-bottom: 24px;
  }
}
</style>
