<template>
  <ContentLayout class="bg-white pt-8">
    <div class="w-full h-[calc(100vh-64px)] overflow-hidden flex flex-col">
      <el-breadcrumb :separator-icon="ArrowRight" class="mb-4">
        <el-breadcrumb-item :to="{ name: RoutesMap.activity.index }">
          <span class="text-[#606266] font-normal transition-colors hover:text-[#7C5CFC]">
            {{ $t('运营活动列表') }}
          </span>
        </el-breadcrumb-item>
        <el-breadcrumb-item>
          <span class="text-[#303133]">{{ $t('运营活动详情') }}</span>
        </el-breadcrumb-item>
      </el-breadcrumb>
      <div v-loading="initting" class="flex-1 flex flex-col gap-4 overflow-hidden">
        <template v-if="activityDetail">
          <div
            class="shrink-0 rounded-lg border border-solid border-[#E4E7ED] px-4 py-3 flex items-start gap-3"
          >
            <ActivityAvatar :size="48" :icon-size="26" class="mt-1" />
            <div class="text-sm text-slate-400 space-y-2">
              <p class="truncate font-medium text-base text-[#303133]">{{ activityDetail.name }}</p>
              <p class="flex items-center flex-wrap gap-1">
                <svg-icon name="timer-filled" svg-class="info-icon" />
                <span class="info-span">
                  {{ dayjs(activityDetail.send_time).format('YYYY-MM-DD HH:mm:ss') }}
                </span>
                <svg-icon name="qw-filled" svg-class="info-icon" />
                <span class="info-span">{{ activityDetail.additions.wx_user_id }}</span>
                <svg-icon name="user-group-filled" svg-class="info-icon" />
                <span class="info-span">{{ activityDetail.total }}</span>
                <svg-icon name="tag-filled" svg-class="info-icon" />
                <el-tag
                  v-for="item in activityDetail.additions.wx_tags"
                  :key="item.id"
                  type="warning"
                  effect="light"
                  round
                  class="!whitespace-pre-wrap !h-fit !py-[2px] !px-[6px] !leading-[14px]"
                >
                  {{ item.name }}
                </el-tag>
              </p>
            </div>
          </div>
          <el-table v-loading="loading" :data="tableData" stripe style="width: 100%">
            <el-table-column type="expand">
              <template #default="{ row }">
                <div class="py-2 px-3 flex gap-1">
                  <div class="font-medium text-[#303133] shrink-0">{{ $t('消息内容：') }}</div>
                  <div
                    v-if="detectMarkdown(row.content)"
                    v-html="renderMarkdown(row.content)"
                    class="markdow-answer-expand markdown-body"
                  />
                  <div v-else class="markdow-answer-expand">{{ row.content }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column :label="$t(`消息接收用户`)" width="180">
              <template #default="{ row }">
                {{ row.additions?.user_name }}
              </template>
            </el-table-column>
            <el-table-column :label="$t(`消息内容`)">
              <template #default="{ row }">
                <div class="line-clamp-2">{{ row.content }}</div>
              </template>
            </el-table-column>
            <el-table-column :label="$t(`用户标签`)" width="200">
              <template #default="{ row }">
                <el-tag
                  v-for="item in row.additions?.tag_names"
                  :key="item"
                  type="warning"
                  effect="light"
                  round
                  class="!whitespace-pre-wrap !h-fit !py-[2px] !px-[6px] !leading-[14px]"
                >
                  {{ item }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column :label="$t(`消息发送时间`)" width="180">
              <template #default="{ row }">
                {{ dayjs(row.trigger_date).format('YYYY-MM-DD HH:mm:ss') }}
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            v-if="tableData.length"
            background
            layout="prev, pager, next"
            :page-count="pagination.page_count"
            v-model:current-page="pagination.page"
            class="justify-end shrink-0"
          />
        </template>
        <el-empty v-else />
      </div>
    </div>
  </ContentLayout>
</template>

<script setup lang="ts">
import { getCommonGraph } from '@/api/graph'
import type { IActivity, IActivityMessage } from '@/interface/activity'
import ContentLayout from '@/layout/ContentLayout.vue'
import { RoutesMap } from '@/router'
import { $notnull } from '@/utils/help'
import { detectMarkdown, renderMarkdown } from '@/utils/markdown'
import { ArrowRight } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ActivityAvatar from './components/ActivityAvatar.vue'

const route = useRoute()

const initting = ref(false)
const activityDetail = ref<IActivity>()

const initActivityDetail = async () => {
  const {
    data: { data }
  } = await getCommonGraph<IActivity[]>('send_schedule_group', {
    filter: `id=="${route.params.activityId}"`
  })
  // getActivityDetail(route.params.activityId as string)
  activityDetail.value = $notnull(data) ? data[0] : null
}

const init = async () => {
  try {
    initting.value = true
    await initActivityDetail()
    await initActivityMessageList()
  } catch (e) {
  } finally {
    initting.value = false
  }
}

const loading = ref(false)
const tableData = ref<IActivityMessage[]>([])
const pagination = reactive({
  page: 1,
  page_count: 1
})

const initActivityMessageList = async () => {
  try {
    loading.value = true
    const params = {
      group_id: route.params.activityId as string,
      page: pagination.page,
      page_size: 10
    }
    const {
      data: { data, pagination: paginationRes }
    } = await getCommonGraph<IActivityMessage[]>('send_schedule', {
      filter: `group_id=="${params.group_id}"`,
      page: params.page,
      size: params.page_size
    })
    // getActivityMessageList(params)
    tableData.value = data
    pagination.page_count = paginationRes.page_count
  } catch (e) {
  } finally {
    loading.value = false
  }
}

watch(
  () => route.params.activityId,
  (id) => {
    if (!id) return
    activityDetail.value = null
    init()
  },
  { immediate: true }
)

watch(() => pagination.page, initActivityMessageList)
</script>

<style lang="scss" scoped>
.info-icon {
  @apply w-4 h-5;
}

.info-span {
  @apply mr-3;
}
</style>
