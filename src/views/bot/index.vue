<template>
  <Topbar class="bg-white lg:relative" style="border-bottom: 1px solid #e4e7ed">
    <el-popover
      v-model:visible="popoverVisible"
      placement="bottom"
      :width="200"
      :popper-style="{ padding: 0 }"
      :trigger="isMobile ? 'click' : 'hover'"
    >
      <template #reference>
        <div
          class="flex gap-2 items-center cursor-pointer mx-auto lg:-translate-x-1/2 lg:absolute lg:left-1/2 lg:mx-0"
        >
          <Avatar :avatar="domainInfo.avatar || DefaultAvatar" :size="28" />
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
            domainInfo.id === item.id && 'current-select-li',
            'flex gap-2 items-center text-[#606266] text-sm cursor-pointer p-2 rounded-lg transition-colors hover:text-[#7c5cfc] hover:bg-[#f4f1ff]'
          ]"
        >
          <Avatar :avatar="item.avatar || DefaultAvatar" :size="24" />
          <p class="truncate">{{ item.name }}</p>
        </li>
      </ul>
    </el-popover>
  </Topbar>
  <ContentLayout
    :key="route.name"
    :class="['bg-white pt-8 lg:pt-4', route.name === RoutesMap.tranning.botChat && '!p-0']"
    :center-full="route.name === RoutesMap.tranning.botChat"
    :full="route.name === RoutesMap.tranning.botChat"
  >
    <router-view />
  </ContentLayout>
</template>

<script setup lang="ts">
import DefaultAvatar from '@/assets/img/avatar.png'
import Avatar from '@/components/Avatar/index.vue'
import Topbar from '@/components/Topbar/index.vue'
import { useBasicLayout } from '@/composables/useBasicLayout'
import ContentLayout from '@/layout/ContentLayout.vue'
import { RoutesMap } from '@/router'
import { useDomainStore } from '@/stores/domain'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const { isMobile } = useBasicLayout()
const domainStoreI = useDomainStore()
const { domainInfo, domainList } = storeToRefs(domainStoreI)

const popoverVisible = ref(false)

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
