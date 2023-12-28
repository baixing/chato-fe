<template>
  <Topbar
    :center="false"
    class="bg-white relative px-16 lg:px-4 lg:h-auto lg:flex-col"
    style="border-bottom: 1px solid #e4e7ed"
  >
    <el-popover
      v-if="currentFlow"
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
          <FlowAvatar rounded :size="32" />
          <p class="max-w-[120px] truncate text-sm font-medium">
            {{ currentFlow.name }}
          </p>
          <svg-icon name="arrow-expand" svg-class="w-4 h-4 text-[#303133]"></svg-icon>
        </div>
      </template>
      <ul class="flex flex-col gap-1 max-h-[180px] px-2 my-2 overflow-y-auto">
        <li
          v-for="item in flowList"
          :key="item.id"
          :class="[
            currentFlow.id === item.id && 'bg-[#f2f3f57a] text-[#7c5cfc]',
            'flex gap-2 items-center text-[#606266] text-sm cursor-pointer px-1 py-[6px] rounded-lg transition-colors hover:bg-[#f2f3f57a]'
          ]"
          @click="changeCurrentFlow(item)"
        >
          <FlowAvatar rounded :size="30" />
          <p class="truncate">{{ item.name }}</p>
        </li>
      </ul>
    </el-popover>
  </Topbar>
  <ContentLayout class="bg-white pt-4">
    <div
      class="text-sm text-slate-500 leading-5 flex justify-between items-center gap-3 mb-4 lg:flex-col lg:items-start"
    >
      {{
        $t(
          '您可以通过创建意图的方式来控制回答内容与对话流程，当用户的对话内容满足指定意图后，将优先按照意图设置执行。当前最多支持 4 个意图。'
        )
      }}
      <el-button
        v-show="intentionList.length < 4"
        :icon="Plus"
        type="primary"
        @click="drawerVisible = true"
      >
        {{ $t('添加意图') }}
      </el-button>
    </div>
    <div v-loading="loading">
      <div v-if="intentionList.length" class="space-y-4">
        <div
          v-for="item in intentionList"
          :key="item.id"
          class="rounded-lg px-4 py-3 space-y-3 bg-[#f6f7fb] text-sm hover:shadow-[0_11px_19px_0px_rgba(44,43,72,0.14)]"
        >
          <div class="flex gap-2 items-center justify-between">
            <el-tag round effect="dark">{{ $t('意图') }}</el-tag>
            <span class="font-medium truncate flex-1 overflow-hidden">{{ item.name }}</span>
            <!-- <el-button link type="primary" >{{ $t('编辑') }}</el-button>
            <el-divider direction="vertical" /> -->
            <el-button link type="danger" @click="onDelIntention(item)">{{ $t('删除') }}</el-button>
          </div>
          <p class="text-slate-800">
            <span class="text-slate-500 mr-2">{{ $t('意图命中场景') }}</span>
            <span>{{ item.node_prompt }}</span>
          </p>
          <p class="text-slate-800 flex items-center">
            <span class="text-slate-500 mr-2">{{ $t('意图关联机器人') }} </span>
            <span class="flex items-center gap-2 overflow-hidden">
              <Avatar
                :avatar="item.domain?.avatar || DefaultAvatar"
                :size="24"
                :name="item.domain?.name?.[0]"
              />
              <span class="truncate">{{ item.domain?.name }}</span>
            </span>
          </p>
        </div>
      </div>
      <el-empty v-else class="mx-auto" />
    </div>
  </ContentLayout>
  <FlowIntentionDrawer v-model:visible="drawerVisible" @success="initIntentionList" />
</template>

<script setup lang="ts">
import { deleteIntention, getIntentionList } from '@/api/flow'
import DefaultAvatar from '@/assets/img/avatar.png'
import Topbar from '@/components/Topbar/index.vue'
import { useBasicLayout } from '@/composables/useBasicLayout'
import type { IFlow, IIntention } from '@/interface/flow'
import ContentLayout from '@/layout/ContentLayout.vue'
import { RoutesMap } from '@/router'
import { useFlowStore } from '@/stores/flow'
import { Plus } from '@element-plus/icons-vue'
import { ElMessageBox, ElNotification } from 'element-plus'
import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import FlowAvatar from './components/FlowAvatar.vue'
import FlowIntentionDrawer from './components/FlowIntentionDrawer.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { isMobile } = useBasicLayout()
const flowStoreI = useFlowStore()
const { flowList } = storeToRefs(flowStoreI)

const drawerVisible = ref(false)
const popoverVisible = ref(false)
const currentFlow = ref<IFlow>()
const loading = ref(false)
const intentionList = ref<IIntention[]>([])

const changeCurrentFlow = async (item: IFlow) => {
  popoverVisible.value = false

  router.push({
    name: RoutesMap.flow.intention,
    params: { flowId: item.id }
  })
}

const onDelIntention = async (item: IIntention) => {
  try {
    await ElMessageBox.confirm(t('删除意图后将立即生效，此操作无法撤销。'), t('确认删除'), {
      confirmButtonText: t('确认'),
      cancelButtonText: t('取消'),
      type: 'warning'
    })
    await deleteIntention(currentFlow.value.id, item.id)
    ElNotification.success(t('操作成功'))
    initIntentionList()
  } catch (e) {}
}

const initIntentionList = async () => {
  try {
    loading.value = true
    const {
      data: { data }
    } = await getIntentionList(route.params.flowId as string)
    intentionList.value = data
  } catch (e) {
  } finally {
    loading.value = false
  }
}

const init = async () => {
  if (flowList.value?.length) return
  await flowStoreI.initFlowList()
}

init()

watch(
  [() => route.params.flowId, flowList],
  ([id, list]) => {
    if (!id || !list?.length) return
    intentionList.value = []
    currentFlow.value = list.find((item) => item.id.toString() === id)
    initIntentionList()
  },
  { immediate: true }
)
</script>
