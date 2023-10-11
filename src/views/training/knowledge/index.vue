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
import DocView from './components/DocView.vue'
import QAView from './components/QAView.vue'

const route = useRoute()
const router = useRouter()

const activeTab = computed(() => (route.params?.type as string) || 'qa')

const tabs = [
  { key: 'qa', title: '问答集' },
  { key: 'doc', title: '文档集' }
]

const tabComponents = {
  qa: QAView,
  doc: DocView
}

const onClickTab = (v) => {
  router.push({ name: RoutesMap.tranning.knowledge, params: { type: v } })
}
</script>
