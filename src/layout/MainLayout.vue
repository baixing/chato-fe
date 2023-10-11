<template>
  <Skeleton v-if="loading" />
  <el-container v-else class="layout-container">
    <Transition
      enter-from-class="-translate-x-full"
      leave-to-class="-translate-x-full"
      enter-active-class="transition duration-200"
      leave-active-class="transition duration-200"
    >
      <Sidebar v-show="!isMobile" />
    </Transition>
    <el-main class="main-container">
      <router-view />
    </el-main>
  </el-container>
  <el-drawer
    v-model="drawerVisible"
    direction="ltr"
    :with-header="false"
    :show-close="false"
    :append-to-body="true"
    @handleClose="drawerVisible = false"
    class="siderbar-drawer"
  >
    <Sidebar />
  </el-drawer>
  <UpgradeRightsModal />
  <FirstGuide />
</template>
<script setup lang="ts">
import UpgradeRightsModal from '@/components/Upgrade/UpgradeRightsModal.vue'
import { useBasicLayout } from '@/composables/useBasicLayout'
import useGlobalProperties from '@/composables/useGlobalProperties'
import useSidebar from '@/composables/useSidebar'
import useSpaceRights from '@/composables/useSpaceRights'
import useVersionCheck from '@/composables/useVersionCheck'
import { ESpaceRightsType } from '@/enum/space'
import { useBase } from '@/stores/base'
import { useChatStore } from '@/stores/chat'
import { useDomainStore } from '@/stores/domain'
import { useSpaceStore } from '@/stores/space'
import { nextTick, ref } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import FirstGuide from './components/FirstGuide/index.vue'
import Sidebar from './components/Sidebar/MainSidebar.vue'
import Skeleton from './components/Skeleton/index.vue'

const { drawerVisible } = useSidebar()
const { isMobile } = useBasicLayout()

const loading = ref(false)

const route = useRoute()
const base = useBase()
const chatStoreI = useChatStore()
const domainStoreI = useDomainStore()
const spaceStoreI = useSpaceStore()

useVersionCheck()

const { checkRightsTypeNeedUpgrade } = useSpaceRights()

const { $sensors } = useGlobalProperties()

const init = async () => {
  loading.value = true

  await base.getAuthToken()
  const res = await base.getUserInfo()
  $sensors?.login(res.id.toString())

  await Promise.all([
    domainStoreI.initDomainList(route),
    chatStoreI.initChatList(),
    spaceStoreI.initSpaceRights()
  ])

  spaceStoreI.initSpaceQuota()
  loading.value = false
}

init()

nextTick(() => {
  checkRightsTypeNeedUpgrade(ESpaceRightsType.usage)
})
</script>

<style lang="scss" scoped>
.layout-container {
  width: 100%;
  height: 100%;

  .main-container {
    overflow: hidden;
    padding: 0;
    display: flex;
    flex-direction: column;
    background: #f2f3f5;
  }
}
</style>

<style lang="scss">
/* 针对于body层节点的样式，只能用这种方式覆盖，可考虑后续提取出用公共文件统一进行放置 */
.siderbar-drawer {
  width: auto !important;
  .el-drawer__body {
    padding: 0;
  }
}
</style>
