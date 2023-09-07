<template>
  <header>
    <h2>{{ $t('仪表盘') }}</h2>
    <div class="action">
      <el-radio-group v-model="$dateRangeType" @change="onChangeDateRangeType">
        <el-radio-button label="today">{{ $t('今天') }}</el-radio-button>
        <el-radio-button label="week">{{ $t('最近 7 天') }}</el-radio-button>
        <el-radio-button label="month">{{ $t('最近 30 天') }}</el-radio-button>
      </el-radio-group>
    </div>
  </header>
  <div class="main-body">
    <div class="summary" v-loading="isSummaryLoading">
      <div class="amount">
        <h4>{{ $t('问题总数') }}</h4>
        <div class="value">
          {{ typeof $pagination.total === 'number' ? $pagination.total : '--' }}
        </div>
      </div>
      <div class="score">
        <h4>{{ $t('平均评分') }}</h4>
        <div class="value">
          {{
            typeof $summary.ave_owner_score === 'number'
              ? trimDecimal($summary.ave_owner_score, 1)
              : '-.-'
          }}
        </div>
      </div>
      <div class="hit-rate" v-if="false">
        <h4>{{ $t('搜索命中率') }}</h4>
        <div class="value">
          {{
            typeof $summary.resp_rate === 'number' ? trimDecimal($summary.resp_rate * 100) : '--'
          }}
          <span class="unit">%</span>
        </div>
      </div>
      <div class="response-time">
        <h4>{{ $t('平均响应时间') }}</h4>
        <div class="value">
          {{ typeof $summary.ave_time === 'number' ? trimDecimal($summary.ave_time, 1) : '--' }}
          <span class="unit">{{ $t('秒') }}</span>
        </div>
      </div>
    </div>
    <div class="list" v-loading="isListLoading">
      <el-table
        :data="$items"
        stripe
        :empty-text="$t(`暂未获取问答记录，请刷新重试`)"
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="60" align="right" />
        <el-table-column prop="question" :label="$t(`提问`)" min-width="120" />
        <el-table-column prop="answer" :label="$t(`回答`)" min-width="200" />
        <el-table-column prop="status" :label="$t(`状态`)" width="80" align="center" />
        <el-table-column :label="$t(`评分`)" width="60" align="right">
          <template #default="scope">
            <template v-if="typeof scope.row.owner_score === 'number'">
              {{ scope.row.owner_score }}
            </template>
            <template v-else>
              <el-popover
                placement="top-end"
                title=""
                :width="150"
                trigger="hover"
                :visible="scope.row.popoverRating"
              >
                <template #reference>
                  <a class="cm-link" href="#rate" @click.prevent="">{{ $t('评分') }}</a>
                </template>
                <el-rate
                  @change="
                    (value) => {
                      rate(scope.row, value)
                      scope.row.popoverRating = false
                    }
                  "
                  :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                />
              </el-popover>
            </template>
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
  </div>
</template>
<script setup>
import {
  getOrgDashboardQuestions,
  getOrgDashboardSummary,
  rateDashboardQuestion
} from '@/api/dashboard'
import { trimDecimal } from '@/utils/formatter'
import { getDateRangeParamsByType } from '@/utils/timeRange'
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const orgId = route.params.orgId

const isSummaryLoading = ref(true) // 指标加载状态
const isListLoading = ref(true) // 列表加载状态
const $summary = ref({}) // 指标内容
const $items = ref([]) // 列表内容
const $pagination = ref({}) // 分页信息（主要用于获取总条数）
const $dateRangeType = ref('week') // 日期跨度类型：today | week | month
let dateRangeParams = {} // 起止时间请求参数

init()

function init() {
  updateDateRangeParams($dateRangeType.value)
  updateSummary()
  updateList()
}

function updateDateRangeParams(type) {
  dateRangeParams = getDateRangeParamsByType(type)
}

function updateSummary() {
  isSummaryLoading.value = true
  getOrgDashboardSummary(orgId, dateRangeParams)
    .then((res) => {
      $summary.value = res.data?.data || {}
    })
    .catch((err) => {})
    .finally(() => {
      isSummaryLoading.value = false
    })
}

function updateList(page = 1) {
  isListLoading.value = true
  getOrgDashboardQuestions(orgId, page, dateRangeParams)
    .then((res) => {
      $items.value = res.data?.data || []
      $pagination.value = res.data?.meta?.pagination || {}
    })
    .catch((err) => {})
    .finally(() => {
      isListLoading.value = false
    })
}

function rate(row, value) {
  const id = row.id
  if (!id) return
  isListLoading.value = true
  rateDashboardQuestion(id, value)
    .then(() => {
      row.owner_score = value
      updateSummary()
    })
    .finally(() => {
      isListLoading.value = false
    })
}

function onChangeDateRangeType(dateRangeType) {
  updateDateRangeParams(dateRangeType)
  updateList()
  updateSummary()
}
</script>
<style lang="scss" scoped>
.page-main {
  header {
    box-sizing: border-box;
    @apply flex items-center justify-between;
    height: 60px;
    padding: 10px 20px;
    border-bottom: 1px solid #222;

    h2 {
      line-height: 40px;
      font-size: 18px;
      white-space: nowrap;
    }

    .action {
      display: flex;
    }
  }

  .main-body {
    padding: 20px;
    padding-bottom: 40px;

    .pagination {
      @apply flex items-center justify-center;
      margin-top: 30px;
    }
  }
}

.summary {
  box-sizing: border-box;
  @apply flex items-center justify-between;
  margin-bottom: 50px;
  text-align: center;

  > div {
    position: relative;
    padding: 20px 10px 40px;
    // width: 24%;
    flex: 1 1 auto;
    background-color: #222;
    border-radius: $box-corner-radius;
    + div {
      margin-left: 15px;
    }
  }

  .value {
    font-size: 40px;
    height: 50px;
    white-space: nowrap;
    .unit {
      margin-left: -0.3em;
      font-size: 20px;
    }
  }
  h4 {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 20px;
    font-weight: inherit;
    font-size: $fs-s;
    color: #999;
  }
}
</style>
