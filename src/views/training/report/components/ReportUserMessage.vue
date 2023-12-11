<template>
  <div v-loading="loading">
    <el-table
      :data="tableData"
      :empty-text="$t('暂未获取问答记录，请刷新重试')"
      style="width: 100%"
      max-height="calc(100vh - 220px)"
    >
      <el-table-column :label="$t('来源')" prop="source" />
      <el-table-column :label="$t('昵称')" prop="nickname" />
      <el-table-column :label="$t('头像')">
        <template #default="{ row }">
          <img :src="row.avatar" class="w-6 h-6 object-cover" />
        </template>
      </el-table-column>
      <el-table-column :label="$t('Tag')" prop="tag" />
      <el-table-column :label="$t('最后聊天时间')" align="left" width="150">
        <template #default="{ row }">
          {{ toSimpleDateTime(row.last_chat_time) }}
        </template>
      </el-table-column>
      <el-table-column fixed="right" :label="$t('操作')" width="150">
        <template #default="{ row }">
          <el-button type="primary" link @click="onLinkContext(row)">
            {{ $t('查看对话') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      class="justify-end mt-4"
      background
      layout="prev, pager, next"
      :page-count="pagination.page_size"
      v-model:current-page="pagination.page"
    />
  </div>
</template>

<script setup lang="ts">
import { getUserChatMessageByDomainId } from '@/api/report'
import { useBasicLayout } from '@/composables/useBasicLayout'
import type { IUserChatMessage } from '@/interface/question'
import { RoutesMap } from '@/router'
import { toSimpleDateTime } from '@/utils/formatter'
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const domainId = computed(() => route.params.botId as string)
const { isMobile } = useBasicLayout()

const loading = ref(true)
const tableData = ref<IUserChatMessage[]>([])
const pagination = reactive({
  page: 1,
  page_size: 10
})

const init = async () => {
  try {
    loading.value = true
    const {
      data: { data }
    } = await getUserChatMessageByDomainId({
      domainId: domainId.value,
      ...pagination
    })
    tableData.value = data
  } catch (e) {
  } finally {
    loading.value = false
  }
}

const onLinkContext = (row) => {
  const { id } = row
  router.push({
    name: RoutesMap.tranning.report,
    params: {
      ...route.params,
      type: 'userMsgContext',
      chatId: `${id}_q`
    }
  })
}

watch([domainId, () => pagination.page], () => domainId.value && init(), { immediate: true })
</script>
