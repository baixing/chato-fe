<template>
  <div class="content-view-container">
    <div class="report-detail-title">
      <div class="flex gap-4 overflow-hidden flex-1 flex-wrap lg:flex-col">
        <div class="flex gap-4 w-fit flex-wrap">
          <el-dropdown trigger="click" @command="handleCommand">
            <el-button size="large">
              {{ sourceName }}
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="all">{{ $t('全部来源') }}</el-dropdown-item>
                <el-dropdown-item command="customer">{{ $t('用户数据') }}</el-dropdown-item>
                <el-dropdown-item command="admin">{{ $t('训练数据') }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <el-dropdown trigger="click" @command="handleEvaluationCommand">
            <el-button size="large">
              {{ evaluationName }}
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="all">{{ $t('全部评价') }}</el-dropdown-item>
                <el-dropdown-item command="none">
                  <p style="flex: auto; text-align: center">
                    {{ $t('无评价') }}
                  </p>
                </el-dropdown-item>
                <el-dropdown-item command="like">
                  <svg-icon color="#596780" style="flex: auto" name="report-like" />
                  <p style="flex: content">{{ $t('赞') }}</p>
                </el-dropdown-item>
                <el-dropdown-item command="dislike">
                  <svg-icon color="#596780" style="flex: auto; rotate: 180deg" name="report-like" />
                  <p style="flex: content">{{ $t('踩') }}</p>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-date-picker
            size="large"
            v-model="timeRange"
            :default-time="defaultTime"
            value-format="YYYY-MM-DD HH:mm:ss"
            @change="timeChange"
            style="height: 40px"
            type="daterange"
            unlink-panels
            range-separator="To"
            :start-placeholder="$t(`开始日期`)"
            :end-placeholder="$t(`结束日期`)"
            :shortcuts="shortcuts"
            class="shrink-0 max-w-[330px]"
          />
        </div>
        <SearchInput v-model:value="keyword" size="large" />
      </div>
      <div v-if="!isMobile" class="button-container">
        <el-button v-if="multipleSelection.size > 0" type="primary" @click="() => handleExport()">{{
          $t('导出当前')
        }}</el-button>
        <el-button type="primary" @click="() => handleExport(true)">{{
          $t(' 导出全部 ')
        }}</el-button>
      </div>
    </div>

    <div class="list" v-loading="isListLoading">
      <el-table
        :data="$items"
        stripe
        :empty-text="$t(`暂未获取问答记录，请刷新重试`)"
        tooltip-effect="light"
        style="width: 100%"
        header-row-class-name="table-header-title"
        @select="handleSelect"
        @select-all="handleSelectAll"
        ref="multipleTableRef"
      >
        <el-table-column type="expand">
          <template #default="{ row }">
            <ul class="expand-ul">
              <li>
                <div class="expand-left">{{ $t('提问：') }}</div>
                <div class="markdow-answer-expand">{{ row.question }}</div>
              </li>
              <li>
                <div class="expand-left">{{ $t('答案：') }}</div>
                <div
                  class="markdow-answer-expand markdown-body"
                  v-if="detectMarkdown(row.answer)"
                  v-html="renderMarkdown(row.answer)"
                ></div>
                <div v-else class="markdow-answer-expand">{{ row.answer }}</div>
              </li>
            </ul>
          </template>
        </el-table-column>
        <el-table-column v-if="!isMobile" type="selection" width="55" />
        <el-table-column v-if="!isMobile" prop="seq" :label="$t(`序号`)" align="left" width="80" />
        <el-table-column :label="$t(`提问`)">
          <template #default="{ row }">
            <div class="answer-column-container">{{ row.question }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t(`回答`)">
          <template #default="{ row }">
            <div class="answer-column-container">{{ row.answer }}</div>
          </template>
        </el-table-column>
        <el-table-column v-if="!isMobile" :label="$t(`时间`)" align="left" width="150">
          <template #default="{ row }">
            {{ toSimpleDateTime(row.created) }}
          </template>
        </el-table-column>
        <el-tooltip content="s" placement="bottom" effect="light">
          <el-table-column
            v-if="!isMobile"
            :label="$t(`提问者`)"
            align="left"
            :show-overflow-tooltip="true"
            width="100"
          >
            <template #default="scope">
              {{ scope.row?.sender?.nickname || scope.row.sender_uid }}
            </template>
          </el-table-column>
        </el-tooltip>
        <el-table-column fixed="right" :label="$t(`操作`)" :width="isMobile ? 60 : 150">
          <template #default="{ row }">
            <el-button type="primary" link @click="correctAnswer(row)">{{ $t('修正') }}</el-button>
            <el-button v-if="!isMobile" type="primary" link @click="onLinkContext(row)">{{
              $t('查看上下文')
            }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination
          background
          layout="prev, pager, next"
          :page-count="$pagination.page_count"
          :current-page="$pagination.page"
          @update:current-page="updateList"
        />
      </div>
    </div>
    <EnterQa
      activeNames="input-text"
      :defaultForm="defaultForm"
      :domainId="domainId"
      :sizeLimit="10"
      :qtyLimit="20"
      :apiUpload="apiUpload"
      :dialogVisible="dialogVisibleQa"
      @closeDialogVisble="() => (dialogVisibleQa = false)"
    />
  </div>
</template>
<script setup>
import * as apiReport from '@/api/report'
import EnterQa from '@/components/EnterAnswer/EnterQa.vue'
import SearchInput from '@/components/Input/SearchInput.vue'
import { useBasicLayout } from '@/composables/useBasicLayout'
import { currentEnvConfig } from '@/config'
import { RoutesMap } from '@/router'
import { useDomainStore } from '@/stores/domain'
import { toSimpleDateTime } from '@/utils/formatter'
import { detectMarkdown, renderMarkdown } from '@/utils/markdown'
import * as url from '@/utils/url'
import { debouncedWatch } from '@vueuse/core'
import { ElNotification as Notification } from 'element-plus'
import { storeToRefs } from 'pinia'
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const domainStoreI = useDomainStore()
const { domainInfo } = storeToRefs(domainStoreI)
const domainId = computed(() => domainInfo.value.id || route.params.botId)
const { isMobile } = useBasicLayout()

const source = ref('all')
const evaluation = ref('all')
const evaluationName = computed(() => {
  switch (evaluation.value) {
    case 'all':
      return t('全部评价')
    case 'none':
      return t('无评价')
    case 'like':
      return t('赞')
    case 'dislike':
      return t('踩')
    default:
      return t('全部评价')
  }
})
const sourceName = computed(() => {
  switch (source.value) {
    case 'all':
      return t('全部来源')
    case 'customer':
      return t('用户数据')
    case 'admin':
      return t('训练数据')
    default:
      return t('全部来源')
  }
})
const isListLoading = ref(true) // 列表加载状态
const $items = ref([]) // 列表内容
const $pagination = ref({}) // 分页信息（主要用于获取总条数）
const apiUpload = computed(() =>
  url.join(currentEnvConfig.uploadBaseURL, `/chato/api/domains/${domainId.value}/files/upload/qa`)
)
const dialogVisibleQa = ref(false)
const defaultForm = reactive({
  title: '',
  question_id: 0
})
const multipleTableRef = ref()
const multipleSelection = ref(new Set())
const timeRange = ref('')
const keyword = ref('')
const shortcuts = [
  {
    text: t('今日'),
    value: () => {
      const start = new Date()
      start.setHours(0, 0, 0)
      const end = new Date()
      end.setHours(23, 59, 59)
      return [start, end]
    }
  },
  {
    text: t('昨日'),
    value: () => {
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 1)
      start.setHours(0, 0, 0)
      const end = new Date()
      end.setTime(end.getTime() - 3600 * 1000 * 24 * 1)
      end.setHours(23, 59, 59)
      return [start, end]
    }
  },
  {
    text: t('近7天'),
    value: () => {
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 6)
      start.setHours(0, 0, 0)
      const end = new Date()
      end.setHours(23, 59, 59)
      return [start, end]
    }
  },
  {
    text: t('近一个月'),
    value: () => {
      const start = new Date()
      start.setTime(start.getTime() + 3600 * 1000 * 24 * 1)
      start.setMonth(start.getMonth() - 1)
      start.setHours(0, 0, 0)
      const end = new Date()
      end.setHours(23, 59, 59)
      return [start, end]
    }
  },
  {
    text: t('近半年'),
    value: () => {
      const start = new Date()
      start.setTime(start.getTime() + 3600 * 1000 * 24 * 1)
      start.setMonth(start.getMonth() - 6)
      start.setHours(0, 0, 0)
      const end = new Date()
      end.setHours(23, 59, 59)
      return [start, end]
    }
  },
  {
    text: t('近一年'),
    value: () => {
      const start = new Date()
      start.setTime(start.getTime() + 3600 * 1000 * 24 * 1)
      start.setFullYear(start.getFullYear() - 1)
      start.setHours(0, 0, 0)
      const end = new Date()
      end.setHours(23, 59, 59)
      return [start, end]
    }
  }
]

const defaultTime = [new Date(2023, 5, 1, 0, 0, 0), new Date(2023, 5, 1, 23, 59, 59)]
function init() {
  updateList()
}

function updateList(page = 1) {
  isListLoading.value = true
  const begin_time = timeRange.value ? timeRange.value[0] : null
  const end_time = timeRange.value ? timeRange.value[1] : null
  apiReport
    .getQuestions({
      domainId: domainId.value,
      source: source.value,
      evaluation: evaluation.value == 'all' ? null : evaluation.value,
      page,
      page_size: 20,
      begin_time,
      end_time,
      keyword: keyword.value
    })
    .then((res) => {
      $items.value = res.data?.data || []
      $pagination.value = res.data?.meta?.pagination || {}
      nextTick(() => {
        $items.value.forEach((item) => {
          if (multipleSelection.value.has(item.id)) {
            multipleTableRef.value.toggleRowSelection(item)
          }
        })
      })
    })
    .catch(() => {})
    .finally(() => {
      isListLoading.value = false
    })
}

debouncedWatch(keyword, () => updateList(1), { debounce: 300 })

const handleCommand = (command) => {
  source.value = command
  updateList(1)
}

const handleEvaluationCommand = (command) => {
  evaluation.value = command
  updateList(1)
}

const onLinkContext = (row) => {
  const { id } = row
  router.push({
    name: RoutesMap.tranning.reportContext,
    params: {
      ...route.params,
      chatId: `${id}_q`
    }
  })
}

function correctAnswer(e) {
  defaultForm.title = e.question
  defaultForm.question_id = e.id
  defaultForm.content = e.answer
  dialogVisibleQa.value = true
}

function handleSelect(val, row) {
  if (multipleSelection.value.has(row.id)) {
    multipleSelection.value.delete(row.id)
  } else {
    multipleSelection.value.add(row.id)
  }
}

function handleSelectAll(val) {
  if (val.length == 0) {
    $items.value.forEach((item) => {
      multipleSelection.value.delete(item.id)
    })
    return
  }
  val.forEach((item) => {
    multipleSelection.value.add(item.id)
  })
}

function timeChange() {
  updateList(1)
}

async function handleExport(isAll = false) {
  const exportArray = isAll ? [] : Array.from(multipleSelection.value)
  if (exportArray.length === 0 && !isAll) {
    Notification.error(t('抱歉，未勾选数据，无法导出。请先勾选数据再进行导出操作。'))
    return
  }
  isListLoading.value = true
  apiReport
    .exportQuestions({ id: exportArray, domainId: domainId.value })
    .then((res) => {
      let blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8',
        encoding: 'UTF-8'
      })
      let url = URL.createObjectURL(blob)
      let a = document.createElement('a')
      a.href = url
      a.click()
      URL.revokeObjectURL(url)
    })
    .catch(() => {})
    .finally(() => {
      isListLoading.value = false
    })
}

watch(domainId, (v) => v && init(), { immediate: true })
</script>
<style lang="scss" scoped>
.content-view-container {
  :deep(.el-col) {
    @apply flex items-center justify-center;
  }
}

.report-detail-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  row-gap: 24px;
  :deep(.el-page-header__icon) {
    font-size: 18px;
  }

  :deep(.el-divider--vertical) {
    border: none;
  }

  .button-container {
    display: flex;
    gap: 24px;

    :deep(.el-button) {
      width: 96px;
      height: 40px;
      margin-left: 0px;
    }
  }
}

.list {
  padding-top: 24px;
  margin: auto;
  width: 100%;
  overflow-x: scroll;
  .expand-ul {
    padding: 10px;
    li {
      display: flex;
      width: 100%;
      margin-bottom: 10px;
      .expand-left {
        width: 50px;
        margin-right: 10px;
        flex-shrink: 0;
        color: #303133;
        font-weight: bold;
      }
    }
  }
  .answer-column-container {
    @apply line-clamp-2;
  }
  :deep(.table-header-title) {
    color: $color;
  }

  .pagination {
    @apply flex items-center justify-between;
    margin-top: 24px;
    flex-direction: row-reverse;
  }
}
</style>
<style lang="scss">
.markdow-answer-expand {
  line-height: 20px;
  margin-top: -3px;
  img {
    width: 90px;
    height: 90px;
    margin: 10px 10px 0 0;
    float: left;
    border-radius: 4px;
  }
}
</style>
