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
import ReportDetail from './components/ReportDetail.vue'
import ReportView from './components/ReportView.vue'

const route = useRoute()
const router = useRouter()

const activeTab = computed(() => (route.params?.type as string) || 'overview')

const tabs = [
  { key: 'overview', title: '数据概览' },
  { key: 'chat', title: '对话消息明细' }
]

const tabComponents = {
  overview: ReportView,
  chat: ReportDetail
}

const onClickTab = (v) => {
  router.push({ name: RoutesMap.namespace.summary, params: { type: v } })
}
</script>
