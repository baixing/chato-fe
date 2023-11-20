<template>
  <el-drawer
    v-model="visible"
    :size="isMobile ? '100%' : '30%'"
    :show-close="false"
    :style="`--el-drawer-bg-color: #efefef; --el-drawer-padding-primary: 10px ${
      isMobile ? '16px' : '30px'
    }`"
  >
    <template #header="{ close }">
      <div class="w-full cursor-pointer text-left text-[#303133] pt-2">
        <el-icon size="23" @click="close"><ArrowLeft /></el-icon>
      </div>
    </template>
    <div class="w-full h-full flex flex-col justify-between items-center text-[#3D3D3D]">
      <div class="w-full">
        <div class="flex flex-col items-center mb-10 md:mb-6">
          <Avatar
            :avatar="domainInfo.avatar"
            class="cursor-pointer"
            :size="64"
            :name="domainInfo.name.slice(0, 2)"
          />
          <span class="mt-8 md:mt-3 text-xl md:text-base font-medium"> {{ domainInfo.name }} </span>
        </div>
        <div
          v-for="item in moreList"
          :key="item.key"
          class="flex justify-between items-center w-full mb-3 py-5 md:py-3 rounded-lg px-8 md:px-4 cursor-pointer transition-all hover:scale-105 md:hover:scale-100 text-[#303133] bg-[#FFFFFF] text-base md:text-sm"
          @click="onhandleEventModal(item)"
        >
          <span>{{ $t(item.name) }}</span>
          <el-icon :size="isMobile ? 17 : 20"><ArrowRight /></el-icon>
        </div>
      </div>

      <div class="w-full">
        <div
          v-if="!loginStatus"
          @click="visible = false"
          class="theme-color w-full mt-4 mb-3 text-center py-5 md:py-3 rounded-lg px-8 md:px-4 cursor-pointer transition-all hover:scale-105 bg-[#FFFFFF] text-base md:text-sm"
        >
          {{ $t('对话') }}
        </div>
        <div
          @click="emit('handleActivatePackage')"
          class="theme-color w-full mb-3 text-center py-5 md:py-3 rounded-lg px-8 md:px-4 cursor-pointer transition-all hover:scale-105 bg-[#FFFFFF] text-base md:text-sm"
        >
          {{ $t('开通套餐') }}
        </div>
        <div
          v-if="loginStatus"
          @click="onHandleLoginout"
          class="theme-color w-full mt-4 mb-3 text-center py-5 md:py-3 rounded-lg px-8 md:px-4 cursor-pointer transition-all hover:scale-105 bg-[#FFFFFF] text-base md:text-sm"
        >
          {{ $t('退出登录') }}
        </div>
      </div>
    </div>
  </el-drawer>
  <component :is="componentId" :domainInfo="domainInfo" v-model:value="modalVisible" />
</template>

<script setup lang="ts">
import { useBasicLayout } from '@/composables/useBasicLayout'
import useSpaceRights from '@/composables/useSpaceRights'
import { ESpaceRightsType } from '@/enum/space'
import type { IDomainInfo } from '@/interface/domain'
import { cuserStore } from '@/stores/cuser'
import { ElNotification } from 'element-plus'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import ChatDetailModal from './components/ChatDetailModal.vue'
import ChatPackageModal from './components/ChatPackageModal.vue'
import ChatRecordModal from './components/ChatRecordModal.vue'

const props = defineProps<{
  value: boolean
  domainInfo: IDomainInfo
}>()
const emit = defineEmits(['update:value', 'handleActivatePackage'])

const { isMobile } = useBasicLayout()
const { checkRightsTypeNeedUpgrade } = useSpaceRights()
const authCUserStore = cuserStore()
const { loginStatus } = storeToRefs(authCUserStore)
const componentId = ref(null)
const modalVisible = ref(false)
const visible = computed({
  get: () => props.value,
  set: (v) => emit('update:value', v)
})

const moreList = [
  {
    name: '关于我',
    key: 'ChatDetailModal',
    component: ChatDetailModal
  },
  {
    name: '套餐信息',
    key: 'ChatPackageModal',
    component: ChatPackageModal
  },
  {
    name: '投喂记录',
    key: 'ChatRecordModal',
    component: ChatRecordModal
  },
  {
    name: '技术支持',
    key: 'technicalSupMore'
  }
]

const onHandleLoginout = () => {
  authCUserStore.loginoutCuser()
  ElNotification.success('已退出')
  visible.value = false
}

const onhandleEventModal = async (item) => {
  if (item.key === 'technicalSupMore') {
    isMobile.value
      ? window.open(`https://admin.sdlian.cn/l/ZkjRKDiEcb`, '_blank')
      : await checkRightsTypeNeedUpgrade(ESpaceRightsType.default)
  }
  componentId.value = item.component
  modalVisible.value = true
}
</script>
