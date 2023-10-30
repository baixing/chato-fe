<template>
  <ContentLayout :key="route.name" class="bg-white pt-8">
    <h3 class="text-xl leading-6 font-medium mb-4">{{ $t('我的知识库') }}</h3>
    <p class="text-[#596780] text-sm leading-5 mb-6">
      {{ $t('知识库中可添加问答或文档，在机器人回答时，可运用库中的知识进行回复。此外还能') }}
      <el-button type="primary" link @click="relatedModalVisible = true">
        <template #icon>
          <svg-icon name="related" svg-class="w-4 h-4" />
        </template>
        {{ $t('关联其他知识库') }}
      </el-button>
    </p>
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
  <Modal v-model:visible="relatedModalVisible" title="关联其他知识库">
    <p class="text-[#596780] text-xs leading-4">
      {{ $t('让机器人回答你的机器人回答时，能动态索引其他知识库的内容') }}
    </p>
  </Modal>
</template>

<script setup lang="ts">
import Modal from '@/components/Modal/index.vue'
import ContentLayout from '@/layout/ContentLayout.vue'
import { RoutesMap } from '@/router'
import { computed, ref } from 'vue'
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

const relatedModalVisible = ref(false)
</script>
