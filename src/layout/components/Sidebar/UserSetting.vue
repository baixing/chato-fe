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
      <li
        class="px-4 cursor-pointer h-9 flex items-center gap-2 rounded-lg bg-[#242A40] transition-colors hover:text-white"
      >
        <svg-icon name="setting" svg-class="w-4 h-4" />
        {{ $t('用户设置') }}
      </li>
    </template>
    <div class="flex items-center gap-2 font-medium text-[#3d3d3d] text-sm mt-5 mx-5 min-w-[160px]">
      <Avatar :avatar="userInfo.avatar" :name="userInfo.nickname.slice(0, 2)" :size="32" />
      <div class="overflow-hidden">
        <p class="truncate break-all max-w-[138px]">{{ userInfo.nickname }}</p>
        <p class="text-[#9DA3AF] text-xs font-normal mt-[3px]">ID:{{ userInfo.id }}</p>
      </div>
    </div>
    <el-divider class="!my-5" />
    <div class="mx-5 flex flex-col items-start gap-3 mb-4">
      <el-button link @click="onLinkTo(RoutesMap.namespace.personalSetting)" class="btn">
        <el-icon class="mr-2"><Edit /></el-icon>
        {{ $t('个人设置') }}
      </el-button>
      <el-button link @click="onLinkTo(RoutesMap.namespace.income)" class="btn">
        <svg-icon class="mr-2" name="pay-income" />
        {{ $t('我的收益') }}
      </el-button>
      <el-button link @click="onLinkTo(RoutesMap.auth.logout)" class="btn">
        <el-icon class="mr-2"><SwitchButton /></el-icon>
        {{ $t('退出登录') }}
      </el-button>
    </div>
  </el-popover>
</template>

<script setup lang="ts">
import Avatar from '@/components/Avatar/index.vue'
import { RoutesMap } from '@/router'
import { useBase } from '@/stores/base'
import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const baseStoreI = useBase()

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
  @apply block p-0 m-0 text-[#303133] font-normal text-sm;
}
</style>
