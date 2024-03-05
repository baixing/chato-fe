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
  <FollowPublic />
</template>
<script setup lang="ts">
import UpgradeRightsModal from '@/components/Upgrade/UpgradeRightsModal.vue'
import { useBasicLayout } from '@/composables/useBasicLayout'
import useGlobalProperties from '@/composables/useGlobalProperties'
import useSidebar from '@/composables/useSidebar'
import useSpaceRights from '@/composables/useSpaceRights'
import useVersionCheck from '@/composables/useVersionCheck'
import { ESpaceRightsType } from '@/enum/space'
import { RoutesMap } from '@/router'
import { useAuthStore } from '@/stores/auth'
import { useBase } from '@/stores/base'
import { useChatStore } from '@/stores/chat'
import { useDomainStore } from '@/stores/domain'
import { useSpaceStore } from '@/stores/space'
import { useYouzanStore } from '@/stores/yz'
import { nextTick, ref } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import Sidebar from './components/Sidebar/MainSidebar.vue'
import Skeleton from './components/Skeleton/index.vue'

const { drawerVisible } = useSidebar()
const { isMobile } = useBasicLayout()

const loading = ref(false)

const route = useRoute()
const router = useRouter()
const baseStoreI = useBase()
const chatStoreI = useChatStore()
const domainStoreI = useDomainStore()
const spaceStoreI = useSpaceStore()
const useYouzanStoreI = useYouzanStore()
const { cookieToken } = useAuthStore()

useVersionCheck()

const { checkRightsTypeNeedUpgrade } = useSpaceRights()

const { $sensors } = useGlobalProperties()

const init = async () => {
  try {
    loading.value = true

    await baseStoreI.getAuthToken()
    const userInfoRes = await baseStoreI.getUserInfo()

    $sensors?.login(userInfoRes.id.toString())
    // 新用户跳转对话引导页
    if (userInfoRes.id === userInfoRes.org.owner_id && !userInfoRes.org.additions && !cookieToken) {
      if (route.name !== RoutesMap.guide.first) {
        router.replace({ name: RoutesMap.guide.first })
      }
    } else if (route.name === RoutesMap.guide.first) {
      router.replace({ name: RoutesMap.tranning.botChat })
    }

    await Promise.all([
      domainStoreI.initDomainList(route),
      chatStoreI.initChatList(),
      spaceStoreI.initSpaceRights(),
      useYouzanStoreI.getYouzanInfo()
    ])

    spaceStoreI.initSpaceQuota()
    loading.value = false
  } catch (e) {}
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
