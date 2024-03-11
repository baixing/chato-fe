<template>
  <div class="px-2 pb-8 w-full flex flex-col items-center">
    <SpaceSwitch />
    <span class="upgrade-btn" @click="checkRightsTypeNeedUpgrade(ESpaceRightsType.default)">
      {{ $t('升级权益') }}
    </span>

    <ul class="text-[#9DA3AF] text-xs w-full space-y-3 bottom-menus">
      <li
        v-show="spaceRightsVisible"
        @click="onLinkSpace"
        class="px-4 cursor-pointer h-9 flex items-center gap-2 rounded-lg transition-colors bg-[#242A40] hover:text-white"
      >
        <svg-icon name="rights" svg-class="w-4 h-4" />
        {{ $t('空间权益') }}
      </li>
      <li
        v-show="spaceRightsVisible"
        @click="onLinkData"
        class="px-4 cursor-pointer h-9 flex items-center gap-2 rounded-lg transition-colors bg-[#242A40] hover:text-white"
      >
        <el-icon size="16"><DataAnalysis /></el-icon>
        {{ $t('数据总结') }}
      </li>
      <SuspendHelp />
      <UserSetting />
    </ul>
  </div>
</template>

<script setup lang="ts">
import useSidebar from '@/composables/useSidebar'
import useSpaceRights from '@/composables/useSpaceRights'
import { ESpaceRightsType } from '@/enum/space'
import { EAllRole } from '@/enum/user'
import { RoutesMap } from '@/router'
import { useBase } from '@/stores/base'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import SpaceSwitch from './SpaceSwitch.vue'
import SuspendHelp from './SuspendHelp.vue'
import UserSetting from './UserSetting.vue'

const baseStoreI = useBase()
const router = useRouter()

const { userInfo, orgInfo } = storeToRefs(baseStoreI)
const { drawerVisible } = useSidebar()
const { checkRightsTypeNeedUpgrade } = useSpaceRights()

const spaceRightsVisible = computed(() => userInfo.value.role !== EAllRole.member)

const onLinkSpace = () => {
  drawerVisible.value = false

  router.push({ name: RoutesMap.namespace.management, params: { spaceId: userInfo.value.org.id } })
}

const onLinkData = () => {
  drawerVisible.value = false

  router.push({ name: RoutesMap.namespace.summary })
}
</script>

<style lang="scss" scoped>
.upgrade-btn {
  @apply cursor-pointer rounded-lg h-9 text-center w-full text-xs leading-9 text-white mt-3 mb-5 transition-opacity hover:opacity-95;

  background: linear-gradient(335deg, #0547ff -28%, #d683ff 104%);
}
</style>
