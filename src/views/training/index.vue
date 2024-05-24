<template>
  <Topbar
    :center="false"
    class="bg-white relative px-16 lg:px-4 lg:h-auto lg:flex-col"
    style="border-bottom: 1px solid #e4e7ed"
  >
    <el-popover
      v-model:visible="popoverVisible"
      placement="bottom"
      :width="200"
      :popper-style="{ padding: 0 }"
      :trigger="isMobile ? 'click' : 'hover'"
    >
      <template #reference>
        <div
          class="flex gap-2 items-center cursor-pointer lg:-translate-x-1/2 lg:absolute lg:left-1/2"
        >
          <Avatar
            class="shrink-0"
            :avatar="domainInfo.avatar || DefaultAvatar"
            :size="28"
            :name="domainInfo.name?.slice(0, 2)"
          />
          <p class="max-w-[120px] truncate text-sm font-medium">
            {{ domainInfo.name }}
          </p>
          <svg-icon name="arrow-expand" svg-class="w-4 h-4 text-[#303133]"></svg-icon>
        </div>
      </template>
      <ul class="flex flex-col gap-2 max-h-[180px] px-4 my-3 overflow-y-auto">
        <li
          v-for="item in domainList"
          :key="item.id"
          @click="changeCurrentBot(item)"
          :class="[
            domainInfo.id === item.id && 'bg-[#f2f3f57a] text-[#7c5cfc]',
            'flex gap-2 items-center text-[#606266] text-sm cursor-pointer p-2 rounded-lg transition-colors hover:bg-[#f2f3f57a]'
          ]"
        >
          <Avatar
            :avatar="item.avatar || DefaultAvatar"
            :name="item.name.slice(0, 2)"
            :size="24"
            class="shrink-0"
          />
          <p class="truncate">{{ item.name }}</p>
        </li>
      </ul>
    </el-popover>
    <template #secondBar>
      <HorizontalMenu
        v-if="!isMobile"
        :active="activeMenu"
        :menus="filteredMenus"
        @select="onMenuSelect"
        :height="56"
        class="!absolute -translate-x-1/2 left-1/2 h-14"
      />
    </template>
  </Topbar>
  <HorizontalMenu
    v-if="isMobile"
    :active="activeMenu"
    :menus="filteredMenus"
    :height="45"
    @select="onMenuSelect"
    class="w-full !px-4"
  />
  <router-view />
</template>

<script setup lang="ts">
import DefaultAvatar from '@/assets/img/avatar.png'
import Avatar from '@/components/Avatar/index.vue'
import HorizontalMenu from '@/components/HorizontalMenu/index.vue'
import Topbar from '@/components/Topbar/index.vue'
import { useBasicLayout } from '@/composables/useBasicLayout'
import { EDomainType } from '@/enum/domain'
import type { IMenuItem } from '@/interface/common'
import { RoutesMap } from '@/router'
import { useDomainStore } from '@/stores/domain'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const { isMobile } = useBasicLayout()
const domainStoreI = useDomainStore()
const { domainInfo, domainList } = storeToRefs(domainStoreI)

const popoverVisible = ref(false)

const activeMenu = computed(() => route.name as string)

const menus: IMenuItem[] = [
  { title: '对话', routeName: RoutesMap.tranning.botChat },
  { title: '编辑', routeName: RoutesMap.tranning.roleInfo },
  { title: '知识', routeName: RoutesMap.tranning.knowledge },
  { title: '发布', routeName: RoutesMap.tranning.release },
  { title: '数据', routeName: RoutesMap.tranning.report }
]

// 过滤 menus 数组，移除不需要的菜单项
const filteredMenus = computed(() => {
  if (domainInfo.value?.type === EDomainType.wenxin) {
    return menus.filter((menu) => !['知识', '发布', '数据'].includes(menu.title))
  }
  return menus
})

const onMenuSelect = (routeName: string) => {
  router.push({
    name: routeName,
    params: { ...route.params, botId: domainInfo.value.id, type: undefined }
  })
}

const changeCurrentBot = async (item) => {
  popoverVisible.value = false
  await domainStoreI.$patch({
    domainInfo: item
  })
  router.push({
    name: route.name,
    params: { ...route.params, botId: item.id }
  })
}
</script>
