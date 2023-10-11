<template>
  <ContentLayout :key="route.name" class="bg-white pt-8">
    <el-tabs
      type="card"
      :model-value="activeTab"
      @tab-click="({ paneName }) => onClickTab(paneName)"
      class="chato-card-tab w-full"
    >
      <el-tab-pane v-for="item in tabs" :key="item.key" :name="item.key" :label="$t(item.title)" />
    </el-tabs>
    <component :is="tabComponents[activeTab]" />
  </ContentLayout>
</template>

<script setup lang="ts">
import ContentLayout from '@/layout/ContentLayout.vue'
import { RoutesMap } from '@/router'
import ReleaseView from '@/views/bot/release/ReleaseView.vue'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Settings from './components/Settings.vue'

const route = useRoute()
const router = useRouter()

const activeTab = computed(() => (route.params?.type as string) || 'medium')

const tabs = [
  { key: 'medium', title: '发布媒介' },
  { key: 'settings', title: '发布设置' }
]

const tabComponents = {
  medium: ReleaseView,
  settings: Settings
}

const onClickTab = (v) => {
  router.push({ name: RoutesMap.tranning.release, params: { type: v } })
}
</script>
