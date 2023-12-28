<template>
  <Topbar :title="$t('对话 Flow')" class="!mb-0" />
  <ContentLayout>
    <p class="text-sm text-slate-500 pt-4 lg:pt-2">
      {{ $t('您可以通过创建对话 Flow 来控制对话过程。') }}
    </p>
    <div
      v-loading="loading"
      class="mt-4 grid grid-cols-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-4"
    >
      <div class="card-container font-medium text-sm text-[#7C5CFC]" @click="modalVisible = true">
        <span class="flex items-center gap-1">
          <el-icon :size="16"><Plus /></el-icon>
          <span>{{ $t('新建 Flow') }}</span>
        </span>
      </div>
      <div
        v-for="item in flowList"
        :key="item.id"
        class="card-container py-3 px-4"
        @click="onLinkFlow(item)"
      >
        <FlowAvatar />
        <div class="flex gap-[2px] items-center overflow-hidden flex-1">
          <div class="overflow-hidden flex-1">
            <p class="truncate font-medium text-base leading-none">{{ item.name }}</p>
            <p
              class="text-xs text-[#B5BED0] leading-4 mt-2 line-clamp-2 break-all whitespace-pre-wrap"
            >
              {{ item.desc }}
            </p>
          </div>
          <el-popover
            trigger="click"
            placement="right-start"
            width="fit-content"
            :show-arrow="false"
          >
            <template #reference>
              <el-button
                text
                @click.stop
                class="shrink-0 transition-colors !h-auto !p-2 !text-[#9DA3AF] hover:!text-[#7C5CFC]"
              >
                <template #icon>
                  <svg-icon name="more-vertical" svg-class="w-4 h-4" />
                </template>
              </el-button>
            </template>
            <div class="space-y-2">
              <IconBtn :icon="User" @click="onConfigWxUser(item)" class="w-full">
                {{ $t('绑定微信托管账户') }}
              </IconBtn>
              <IconBtn :icon="Delete" @click="onDelFlow(item)" class="w-full hover:!text-[#f56c6c]">
                {{ $t('删除') }}
              </IconBtn>
            </div>
          </el-popover>
        </div>
      </div>
    </div>
  </ContentLayout>
  <FlowModal v-model:visible="modalVisible" @success="init" />
  <FlowWxUserModal v-model:visible="wxUserModalVisible" :flow-id="wxUserFlowId" />
</template>

<script setup lang="ts">
import { deleteFlow } from '@/api/flow'
import IconBtn from '@/components/IconBtn/index.vue'
import Topbar from '@/components/Topbar/index.vue'
import type { IFlow } from '@/interface/flow'
import ContentLayout from '@/layout/ContentLayout.vue'
import { RoutesMap } from '@/router'
import { useFlowStore } from '@/stores/flow'
import { Delete, Plus, User } from '@element-plus/icons-vue'
import { ElNotification } from 'element-plus'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import FlowAvatar from './components/FlowAvatar.vue'
import FlowModal from './components/FlowModal.vue'
import FlowWxUserModal from './components/FlowWxUserModal.vue'

const { t } = useI18n()
const router = useRouter()
const flowStoreI = useFlowStore()
const { flowList } = storeToRefs(flowStoreI)

const loading = ref(false)
const modalVisible = ref(false)
const wxUserModalVisible = ref(false)
const wxUserFlowId = ref<IFlow['id']>()

const onConfigWxUser = (row: IFlow) => {
  wxUserFlowId.value = row.id
  wxUserModalVisible.value = true
}

const onDelFlow = async (row: IFlow) => {
  try {
    await deleteFlow(row.id)
    ElNotification.success(t('删除成功'))
    init()
  } catch (e) {}
}

const onLinkFlow = (row: IFlow) => {
  router.push({ name: RoutesMap.flow.intention, params: { flowId: row.id } })
}

const init = async () => {
  try {
    loading.value = true
    await flowStoreI.initFlowList()
  } catch (e) {
  } finally {
    loading.value = false
  }
}

init()
</script>

<style lang="scss" scoped>
.card-container {
  @apply bg-white rounded-lg min-h-[96px] flex items-center justify-center gap-4 transition cursor-pointer h-full hover:shadow-[0_11px_19px_0px_rgba(44,43,72,0.14)] lg:p-4 lg:h-auto;
}
</style>
