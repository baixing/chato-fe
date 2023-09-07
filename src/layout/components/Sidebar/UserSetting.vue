<template>
  <el-popover
    v-model:visible="popoverVisible"
    placement="right"
    :width="220"
    trigger="click"
    :show-arrow="false"
    :popper-style="{ padding: 0 }"
  >
    <template #reference>
      <span
        class="py-2 cursor-pointer w-9 h-9 flex items-center justify-center m-auto mb-[6px] rounded-lg text-[#9DA3AF] transition-colors hover:bg-[#454D69] hover:text-white"
      >
        <svg-icon name="setting" svg-class="w-6 h-6" />
      </span>
    </template>
    <div
      class="flex items-center gap-2 text-base font-medium text-[#3d3d3d] mt-5 mx-5 min-w-[160px]"
    >
      <Avatar :avatar="userInfo.avatar" :name="userInfo.nickname" :size="32" />
      <div class="overflow-hidden">
        <p class="truncate break-all max-w-[138px]">{{ userInfo.nickname }}</p>
        <p class="text-[#9DA3AF] text-xs font-normal mt-[3px]">ID:{{ userInfo.id }}</p>
      </div>
    </div>
    <el-divider class="!my-5" />
    <div class="mx-5 flex flex-col items-start">
      <el-button link @click="onLinkTo(RoutesMap.namespace.personalSetting)" class="btn">
        <el-icon class="mr-1"><Edit /></el-icon>
        {{ $t('修改资料') }}
      </el-button>
      <el-button link @click="onLinkTo(RoutesMap.auth.logout)" class="btn">
        <el-icon class="mr-1"><SwitchButton /></el-icon>
        {{ $t('退出登录') }}
      </el-button>
    </div>
  </el-popover>
</template>

<script setup lang="ts">
import Avatar from '@/components/Avatar/index.vue'
import { useBasicLayout } from '@/composables/useBasicLayout'
import { RoutesMap } from '@/router'
import { useBase } from '@/stores/base'
import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const baseStoreI = useBase()
const { isMobile } = useBasicLayout()

const currentOrgId = ref(0)
const popoverVisible = ref(false)

const { userInfo } = storeToRefs(baseStoreI)

const onLinkTo = (routeName: string) => {
  popoverVisible.value = false
  router.push({ name: routeName })
}

watch(
  userInfo,
  (v) => {
    if (v && v.org) currentOrgId.value = v.org.id
  },
  { immediate: true, deep: true }
)
</script>

<style lang="scss" scoped>
.btn {
  @apply block p-0 m-0 text-[#303133] mb-5 font-normal;
}
</style>
