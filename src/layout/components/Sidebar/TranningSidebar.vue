<template>
  <div class="tranning-sidebar flex flex-col">
    <h3 class="mt-6 ml-5 mb-3 text-sm font-medium leading-[22px]">{{ $t('工作台') }}</h3>
    <el-menu
      :default-active="activeMenu"
      :default-openeds="[]"
      class="sidebar-menu w-[180px] !px-3 py-2 flex-1 !border-none overflow-y-auto"
      style="
        --el-menu-bg-color: #fff;
        --el-menu-text-color: #303133;
        --el-menu-hover-bg-color: #f2f3f5;
        --el-menu-active-color: #303133;
        --el-menu-item-height: 40px;
        --el-menu-sub-item-height: 40px;
        --el-menu-base-level-padding: 14px;
      "
      @select="onMenuSelect"
    >
      <template v-for="(item, index) in menus" :key="item.routeName">
        <el-sub-menu v-if="item.children?.length" :index="`parent-menu-${index}`">
          <template #title>
            <el-icon :size="IconSize">
              <component :is="item.icon" />
            </el-icon>
            <span>{{ item.title }}</span>
          </template>
          <el-menu-item
            v-for="cItem in item.children"
            :key="cItem.routeName"
            :index="cItem.routeName"
          >
            {{ cItem.title }}
          </el-menu-item>
        </el-sub-menu>
        <el-menu-item v-else :index="item.routeName">
          <el-icon :size="IconSize">
            <component :is="item.icon" />
          </el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import SvgIcon from '@/components/SvgIcon/index.vue'
import type { IMenuItem } from '@/interface/common'
import { RoutesMap } from '@/router'
import { useDomainStore } from '@/stores/domain'
import { ChatLineRound, DataLine, Edit, Reading, User } from '@element-plus/icons-vue'
import { storeToRefs } from 'pinia'
import { computed, h } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

const IconSize = 20

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const domainStoreI = useDomainStore()
const { domainInfo } = storeToRefs(domainStoreI)

const activeMenu = computed(() => route.name as string)

const menus: IMenuItem[] = [
  { title: t('形象'), routeName: RoutesMap.tranning.botUser, icon: User },
  { title: t('规则'), routeName: RoutesMap.tranning.botPersona, icon: Edit },
  {
    title: t('知识'),
    routeName: RoutesMap.tranning.kownlwedge,
    children: [
      { title: t('问答式'), routeName: RoutesMap.tranning.botContentQA },
      { title: t('文档式'), routeName: RoutesMap.tranning.botContentDoc }
    ],
    icon: Reading
  },
  { title: t('调试'), routeName: RoutesMap.tranning.botChat, icon: ChatLineRound },
  {
    title: t('发布'),
    routeName: RoutesMap.tranning.release,
    icon: h(SvgIcon, { name: 'share-outlined' }),
    children: [
      { title: t('发布媒介'), routeName: RoutesMap.tranning.botReleaseChannel },
      { title: t('发布设置'), routeName: RoutesMap.tranning.botReleaseSetting }
    ]
  },
  {
    title: t('数据'),
    routeName: RoutesMap.tranning.information,
    children: [
      { title: t('数据概览'), routeName: RoutesMap.tranning.report },
      { title: t('对话消息明细'), routeName: RoutesMap.tranning.reportDetail },
      { title: t('收集表单明细'), routeName: RoutesMap.tranning.reportCollectForm }
    ],
    icon: DataLine
  }
]

const onMenuSelect = (routeName: string) => {
  router.push({
    name: routeName,
    // botId 复写意义防止部分菜单未含有 botId 跳转至需要 botId 的页面
    params: { ...route.params, botId: domainInfo.value.id }
  })
}
</script>

<style lang="scss" scoped>
.tranning-sidebar {
  .sidebar-menu {
    li {
      margin-bottom: 8px;
      border-radius: 8px;
    }
  }

  :deep(.el-sub-menu__title) {
    margin-bottom: 8px;
    border-radius: 8px;
  }

  :deep(.el-menu-item.is-active) {
    background-color: #f2f3f5;
  }
}
</style>
