<template>
  <aside class="w-auto shrink-0 box-border h-full">
    <div class="flex h-full overflow-hidden">
      <div class="flex flex-col items-center bg-[#1C2235] w-48 lg:w-40">
        <img
          src="@/assets/img/logo-header-white.png"
          class="w-[120px] cursor-pointer mx-auto my-8"
          @click="() => router.push({ name: RoutesMap.home.index })"
        />
        <ul class="flex-1 w-full space-y-4">
          <li
            v-for="item in sideMenuList"
            :key="item.routeName"
            :class="[
              'text-[#9DA3AF] cursor-pointer transition-colors relative hover:text-white',
              item.routeName === activeSideMenu && 'text-white font-medium side-menu-active'
            ]"
            @click="onSideBarClick(item.routeName)"
          >
            <span
              class="flex items-center w-[168px] lg:w-36 h-11 gap-2 rounded-lg leading-[44px] text-sm px-5 mx-auto truncate"
            >
              <svg-icon :name="item.icon" svg-class="w-7 h-7" />
              {{ item.title }}
            </span>
          </li>
        </ul>
        <SidebarBottom />
      </div>
      <Transition
        enter-active-class="transition-opacity duration-200"
        leave-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <component
          v-show="secondarySidebarVisible"
          :is="secondarySidebar[activeSideMenu]"
          class="bg-white h-full overflow-hidden"
          style="border-right: 1px solid #e4e7ed"
        />
      </Transition>
    </div>
  </aside>
</template>

<script setup lang="ts">
import useSidebar from '@/composables/useSidebar'
import { RoutesMap } from '@/router'
import { useBase } from '@/stores/base'
import { useChatStore } from '@/stores/chat'
import { useDomainStore } from '@/stores/domain'
import { useYouzanStore } from '@/stores/yz'
import { $notnull, isManagerRole } from '@/utils/help'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import ChatSidebar from './ChatSidebar.vue'
import SidebarBottom from './SidebarBottom.vue'

const { t } = useI18n()
const youzanStore = useYouzanStore()
const { youzanInfo } = storeToRefs(youzanStore)

const normalMenuList = [
  { title: t('训练中心'), icon: 'robot-filled', routeName: RoutesMap.manager.center },
  { title: t('我的对话'), icon: 'chat-filled', routeName: RoutesMap.chat.c }
  // { title: t('资源广场'), icon: 'cube-filled', routeName: RoutesMap.resource }
  // { title: t('AI 插件库'), icon: 'cube-filled', routeName: RoutesMap.aiPlugin.center },
]

const supermanMenuList = [
  { title: t('对话 Flow'), icon: 'flow-filled', routeName: RoutesMap.flow.index },
  { title: t('私域运营'), icon: 'activity-filled', routeName: RoutesMap.activity.index }
]

const youzanMenuList = [{ title: t('有赞插件'), icon: 'youzan', routeName: RoutesMap.aiPlugin.yz }]

const secondarySidebar = {
  [RoutesMap.chat.c]: ChatSidebar,
  [RoutesMap.home.homeResource]: ChatSidebar,
  [RoutesMap.chat.navigator]: ChatSidebar
}

const route = useRoute()
const router = useRouter()
const baseStoreI = useBase()
const domainStoreI = useDomainStore()
const chatStoreI = useChatStore()

const { userInfo } = storeToRefs(baseStoreI)
const { chatList } = storeToRefs(chatStoreI)
const { domainInfo } = storeToRefs(domainStoreI)

const sideMenuList = computed(() => {
  let menuList = normalMenuList
  if ($notnull(youzanInfo.value) && youzanInfo.value.additions.kdt_id) {
    menuList = normalMenuList.concat(youzanMenuList)
  }

  if (userInfo.value.role === 'superman') {
    return menuList.concat(supermanMenuList)
  } else if (isManagerRole(userInfo.value.role)) {
    return menuList
  } else {
    return menuList.slice(1)
  }
})

const activeSideMenu = computed(() => {
  if (
    route.name === RoutesMap.chat.c ||
    route.name === RoutesMap.home.homeResource ||
    route.name === RoutesMap.chat.navigator
  ) {
    return route.name
  } else if (/^(tranning|manager).*/.test(route.name as string)) {
    return RoutesMap.manager.center
  } else if (/^(flow).*/.test(route.name as string)) {
    return RoutesMap.flow.index
  } else if (/^(activity).*/.test(route.name as string)) {
    return RoutesMap.activity.index
  } else if (/^(Youzan).*/.test(route.name as string)) {
    return RoutesMap.aiPlugin.yz
  } else {
    return ''
  }
})

const secondarySidebarVisible = computed(
  () => activeSideMenu.value && activeSideMenu.value in secondarySidebar
)

const { drawerVisible } = useSidebar()

const onSideBarClick = (routeName: string) => {
  drawerVisible.value = false

  router.push({
    name: routeName,
    // botId 复写意义防止部分菜单未含有 botId 跳转至需要 botId 的页面
    params: { ...route.params, botId: domainInfo.value.id, botSlug: chatList.value?.[0].slug }
  })
}
</script>

<style lang="scss" scoped>
.side-menu-active {
  span {
    background-color: #242a40;
  }
  &::before {
    position: absolute;
    content: '';
    width: 4px;
    background: linear-gradient(240deg, #ed78ff -49%, #4417ff 124%);
    border-radius: 0 8px 8px 0;
    left: 0;
    top: 0;
    bottom: 0;
  }
}
</style>
