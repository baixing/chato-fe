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
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ReleaseAPI from './components/releaseAPI/index.vue'
import Settings from './components/releaseSetting/index.vue'
import ReleaseView from './components/releaseView/index.vue'
import ReleaseWebAPP from './components/releaseWebAPP/index.vue'

const route = useRoute()
const router = useRouter()

const activeTab = computed(() => (route.params?.type as string) || 'webapp')

const tabs = [
  { key: 'webapp', title: 'WebAPP' },
  { key: 'medium', title: '第三方平台' },
  { key: 'api', title: 'API接口' },
  { key: 'settings', title: '发布设置' }
]

const tabComponents = {
  webapp: ReleaseWebAPP,
  medium: ReleaseView,
  settings: Settings,
  api: ReleaseAPI
}

const onClickTab = (v) => {
  router.push({ name: RoutesMap.tranning.release, params: { type: v } })
}
</script>
