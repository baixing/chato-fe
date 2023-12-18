<template>
  <div v-loading="loading">
    <el-table
      :data="tableData"
      style="width: 100%"
      :max-height="`calc(100vh - ${isMobile ? '260' : '220'}px)`"
    >
      <el-table-column :label="$t('来源')" prop="source" width="160" />
      <el-table-column :label="$t('昵称')" prop="sender_uid" />
      <!-- <el-table-column :label="$t('头像')">
        <template #default="{ row }">
          <img :src="row.avatar" class="w-6 h-6 object-cover" />
        </template>
      </el-table-column> -->
      <el-table-column label="Tag" prop="tags_str" width="120" />
      <el-table-column :label="$t('最后聊天时间')" align="left" width="150">
        <template #default="{ row }">
          {{ toSimpleDateTime(row.modified) }}
        </template>
      </el-table-column>
      <el-table-column fixed="right" :label="$t('操作')" width="150">
        <template #default="{ row }">
          <el-button type="primary" link @click="onLinkChat(row)">
            {{ $t('查看对话') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-show="tableData.length"
      class="justify-end mt-4"
      background
      layout="prev, pager, next"
      :page-count="pagination.page_count"
      v-model:current-page="pagination.page"
    />
  </div>
</template>

<script setup lang="ts">
import { getUserChatMessageByDomainId } from '@/api/report'
import { useBasicLayout } from '@/composables/useBasicLayout'
import type { IPage } from '@/interface/common'
import type { IUserChatMessage } from '@/interface/question'
import { RoutesMap } from '@/router'
import { toSimpleDateTime } from '@/utils/formatter'
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const domainId = computed(() => route.params.botId as string)
const { isMobile } = useBasicLayout()

const loading = ref(true)
const tableData = ref<IUserChatMessage[]>([])
const pagination = reactive<IPage>({
  page: 1,
  total: 0,
  page_count: 1,
  page_size: 10
})

const init = async () => {
  try {
    loading.value = true
    const {
      data: { data, pagination: paginationRes }
    } = await getUserChatMessageByDomainId({
      domain_id: domainId.value,
      page: pagination.page,
      page_size: pagination.page_size
    })
    pagination.total = paginationRes.total
    pagination.page_count = paginationRes.page_count
    tableData.value = data
  } catch (e) {
  } finally {
    loading.value = false
  }
}

const onLinkChat = (row) => {
  router.push({
    name: RoutesMap.tranning.report,
    params: {
      ...route.params,
      type: 'userChatCRM',
      chatId: row.sender_uid
    }
  })
}

watch([domainId, () => pagination.page], () => domainId.value && init(), { immediate: true })
</script>
