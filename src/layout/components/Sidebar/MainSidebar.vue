<template>
  <aside class="w-auto shrink-0 box-border h-full">
    <div class="flex h-full overflow-hidden">
      <div class="flex flex-col items-center bg-[#272F48] w-[88px]">
        <div class="mx-[10px] mt-[10px] p-[14px] pb-5" style="border-bottom: 1px solid #363f5b">
          <img
            src="@/assets/img/logo.png"
            class="w-10 cursor-pointer"
            @click="() => router.push({ name: RoutesMap.home.index })"
          />
        </div>
        <ul class="flex-1 px-2 py-3 w-full">
          <li
            v-for="item in sideMenuList"
            :key="item.routeName"
            :class="[
              'text-[#9DA3AF] flex flex-col items-center justify-center w-[72px] h-[72px] gap-1 text-sm font-medium leading-[18px] cursor-pointer rounded-lg transition-colors mb-[6px] hover:bg-[#454D69] hover:text-white',
              item.routeName === activeSideMenu && 'text-white bg-[#454D69]'
            ]"
            @click="onSideBarClick(item.routeName)"
          >
            <svg-icon :name="item.icon" svg-class="w-7 h-7"></svg-icon>
            {{ item.title }}
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
import { isManagerRole } from '@/utils/help'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import ChatSidebar from './ChatSidebar.vue'
import SidebarBottom from './SidebarBottom.vue'
import TranningSidebar from './TranningSidebar.vue'
const { t } = useI18n()
const allMenuList = [
  { title: t('训练'), icon: 'robot-filled', routeName: RoutesMap.manager.center },
  { title: t('对话'), icon: 'chat-filled', routeName: RoutesMap.chat.c },
  { title: t('广场'), icon: 'cube-filled', routeName: RoutesMap.resource }
]

const secondarySidebar = {
  [RoutesMap.manager.center]: TranningSidebar,
  [RoutesMap.chat.c]: ChatSidebar
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
  if (isManagerRole(userInfo.value.role)) {
    return allMenuList
  } else {
    return allMenuList.slice(1)
  }
})

const activeSideMenu = computed(() => {
  if (route.name === RoutesMap.chat.c || route.name === RoutesMap.resource) {
    return route.name
  } else if (/^(tranning|manager).*/.test(route.name as string)) {
    return RoutesMap.manager.center
  } else {
    return ''
  }
})

const secondarySidebarVisible = computed(() => {
  if (activeSideMenu.value && activeSideMenu.value in secondarySidebar) {
    if (
      activeSideMenu.value === RoutesMap.manager.center &&
      !/^(tranning).*/.test(route.name as string)
    ) {
      return false
    } else {
      return true
    }
  } else {
    return false
  }
})

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
