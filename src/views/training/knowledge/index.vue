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
      @tab-click="({ paneName }) => onLinkKnowledge({type: paneName as string})"
      class="chato-card-tab w-full"
    >
      <el-tab-pane v-for="item in tabs" :key="item.key" :name="item.key" :label="$t(item.title)" />
    </el-tabs>
    <component :is="tabComponents[activeTab]" />
  </ContentLayout>
  <Modal v-model:visible="relatedModalVisible" title="关联其他知识库" :footer="false">
    <p class="text-[#596780] text-xs leading-4 mb-4">
      {{ $t('机器人回答时，能动态索引其他知识库的内容') }}
    </p>
    <div v-loading="relatedIniting" class="space-y-5 max-h-[314px] overflow-y-auto">
      <div
        v-if="!relatedKnowledgeBases.length"
        class="flex flex-col gap-4 items-center text-[#9DA3AF] text-sm"
      >
        <img src="@/assets/img/empty/folder.png" class="w-[134px]" />
        <span>{{ $t('抱歉，暂无发现其他知识库') }}</span>
      </div>
      <div
        v-for="(item, index) in relatedKnowledgeBases"
        :key="item.id"
        class="flex justify-between items-center gap-2"
      >
        <div class="flex items-center gap-2 overflow-hidden text-[#3D3D3D] text-sm">
          <svg-icon name="bot-knowledge-base" svg-class="w-9 h-9" />
          <span class="truncate flex-1">{{ item.name }}</span>
          <el-button link type="primary" @click="onLinkKnowledge({ botId: item.id }, true)">
            {{ $t('进入') }}
          </el-button>
        </div>
        <SwitchWithStateMsg
          :value="item.related"
          size="default"
          open-msg="关联"
          close-msg="不关联"
          @change="onChangeRelated(index, Number(!item.related))"
        />
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { getKnowledgeSharedList, updateKnowledgeSharedStatus } from '@/api/file'
import Modal from '@/components/Modal/index.vue'
import SwitchWithStateMsg from '@/components/SwitchWithStateMsg/index.vue'
import { EDomainStatus } from '@/enum/domain'
import type { IRelatedKnowledgeBase } from '@/interface/knowledge'
import ContentLayout from '@/layout/ContentLayout.vue'
import { RoutesMap } from '@/router'
import { useDomainStore } from '@/stores/domain'
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
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

const domainStoreI = useDomainStore()
const { domainList } = storeToRefs(domainStoreI)

const onLinkKnowledge = ({ type, botId }: { type?: string; botId?: number }, pageNew = false) => {
  const routerConfig = { name: RoutesMap.tranning.knowledge, params: { botId, type } }
  if (pageNew) {
    const routerData = router.resolve(routerConfig)
    window.open(routerData.href, '_blank')
  } else {
    router.push(routerConfig)
  }
}

const relatedModalVisible = ref(false)
const relatedIniting = ref(false)
const relatedKnowledgeBases = ref<IRelatedKnowledgeBase[]>([])

const onChangeRelated = async (index: number, newRelatedVal: number) => {
  try {
    const updateParams = {
      sender_domain_id: Number(route.params.botId),
      receiver_domain_id: relatedKnowledgeBases.value[index].id,
      status: newRelatedVal ? 'save' : 'delete'
    }
    await updateKnowledgeSharedStatus(updateParams)
    relatedKnowledgeBases.value[index].related = newRelatedVal
  } catch {}
}

const initRelatedList = async () => {
  try {
    relatedIniting.value = true
    relatedKnowledgeBases.value = []
    const {
      data: { data }
    } = await getKnowledgeSharedList({
      filter: `sender_domain_id==${route.params.botId}`,
      size: 500
    })
    const relatedDomainIds = data.map((item) => item.receiver_domain_id)
    const relatedList: IRelatedKnowledgeBase[] = []
    domainList.value.forEach((item) => {
      if (
        item.id.toString() !== (route.params.botId as string) &&
        EDomainStatus.draft !== item.status
      ) {
        relatedList.push({
          id: item.id,
          name: item.name,
          related: Number(relatedDomainIds.includes(item.id))
        })
      }
    })
    relatedKnowledgeBases.value = relatedList
  } catch (e) {
  } finally {
    relatedIniting.value = false
  }
}

watch(
  () => route.params.botId,
  (v) => {
    v && initRelatedList()
  },
  { immediate: true }
)
</script>
