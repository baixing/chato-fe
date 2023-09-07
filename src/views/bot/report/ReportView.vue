<template>
  <div class="content-view-container" v-loading="$isLoading">
    <div class="section">
      <div class="section-body">
        <el-row :gutter="24">
          <el-col :lg="8" :xl="8" :xs="12" :sm="12" :md="12" class="col-margin">
            <el-card
              shadow="never"
              style="width: 100%; height: 160px; border-radius: 2px; padding: 12px"
            >
              <p class="cardTitle">{{ $t('全部对话数') }}</p>
              <p class="cardContent">
                {{ data.all_question_count }}
              </p>
            </el-card>
          </el-col>
          <el-col :lg="8" :xl="8" :xs="12" :sm="12" :md="12" class="col-margin">
            <el-card
              shadow="never"
              style="width: 100%; height: 160px; border-radius: 2px; padding: 12px"
            >
              <p class="cardTitle">{{ $t('本周对话数') }}</p>
              <p class="cardContent">
                {{ data.week_question_count }}
              </p>
            </el-card>
          </el-col>
          <el-col :lg="8" :xl="8" :xs="12" :sm="12" :md="12" class="col-margin">
            <el-card
              shadow="never"
              style="width: 100%; height: 160px; border-radius: 2px; padding: 12px"
            >
              <p class="cardTitle">{{ $t('昨日对话数') }}</p>
              <p class="cardContent">
                {{ data.yesterday_question_count }}
              </p>
            </el-card>
          </el-col>
          <el-col :lg="8" :xl="8" :xs="12" :sm="12" :md="12" class="col-margin">
            <el-card
              shadow="never"
              style="width: 100%; height: 160px; border-radius: 2px; padding: 12px"
            >
              <p class="cardTitle">{{ $t('全部用户') }}</p>
              <p class="cardContent">
                {{ data.all_user_count }}
              </p>
            </el-card>
          </el-col>
          <el-col :lg="8" :xl="8" :xs="12" :sm="12" :md="12" class="col-margin">
            <el-card
              shadow="never"
              style="width: 100%; height: 160px; border-radius: 2px; padding: 12px"
            >
              <p class="cardTitle">{{ $t('本周用户') }}</p>
              <p class="cardContent">
                {{ data.week_user_count }}
              </p>
            </el-card>
          </el-col>
          <el-col :lg="8" :xl="8" :xs="12" :sm="12" :md="12" class="col-margin">
            <el-card
              shadow="never"
              style="width: 100%; height: 160px; border-radius: 2px; padding: 12px"
            >
              <p class="cardTitle">{{ $t('昨日用户') }}</p>
              <p class="cardContent">
                {{ data.yesterday_user_count }}
              </p>
            </el-card>
          </el-col>
          <el-col :lg="8" :xl="8" :xs="12" :sm="12" :md="12" class="col-margin">
            <el-card
              shadow="never"
              style="width: 100%; height: 160px; border-radius: 2px; padding: 12px"
            >
              <p class="cardTitle">{{ $t('用户反馈数') }}</p>
              <p class="cardContent">
                {{ data.all_evaluation_count }}
              </p>
            </el-card>
          </el-col>
          <el-col :lg="8" :xl="8" :xs="12" :sm="12" :md="12" class="col-margin">
            <el-card
              shadow="never"
              style="width: 100%; height: 160px; border-radius: 2px; padding: 12px"
            >
              <p class="cardTitle">{{ $t('反馈满意数') }}</p>
              <p class="cardContent">
                {{ data.like_evaluation_count }}
              </p>
            </el-card>
          </el-col>
          <el-col :lg="8" :xl="8" :xs="12" :sm="12" :md="12" class="col-margin">
            <el-card
              shadow="never"
              style="width: 100%; height: 160px; border-radius: 2px; padding: 12px"
            >
              <p class="cardTitle">{{ $t('用户满意度') }}</p>
              <p class="cardContent">{{ data.like_evaluation_percent }}%</p>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>
<script setup>
import * as apiReport from '@/api/report'
import { useDomainStore } from '@/stores/domain'
import { storeToRefs } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const domainStoreI = useDomainStore()
const { domainInfo } = storeToRefs(domainStoreI)
const domainId = computed(() => domainInfo.value.id || route.params.botId)
const orgId = computed(() => domainInfo.value.org || 0)
const data = reactive({
  all_question_count: 0,
  all_user_count: 0,
  week_question_count: 0,
  week_user_count: 0,
  yesterday_question_count: 0,
  yesterday_user_count: 0,
  all_evaluation_count: 0,
  like_evaluation_count: 0,
  like_evaluation_percent: 0.0
})
const $isLoading = ref(true)

function init() {
  $isLoading.value = true
  apiReport
    .getQuestionsSummary(orgId.value, domainId.value)
    .then((res) => {
      const detail = res?.data?.data || {}
      data.all_question_count = detail.all_question_count || 0
      data.all_user_count = detail.all_user_count || 0
      data.week_question_count = detail.week_question_count || 0
      data.week_user_count = detail.week_user_count || 0
      data.yesterday_question_count = detail.yesterday_question_count || 0
      data.yesterday_user_count = detail.yesterday_user_count || 0
      data.all_evaluation_count = detail.all_evaluation_count || 0
      data.like_evaluation_count = detail.like_evaluation_count || 0
      data.like_evaluation_percent = detail.like_evaluation_percent || 0.0
    })
    .catch(() => {})
    .finally(() => {
      $isLoading.value = false
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

.col-margin {
  margin-bottom: 24px;
}

.cardTitle {
  height: 24px;
  font-size: 16px;
}

.cardContent {
  font-size: 32px;
  font-weight: 500;
  line-height: 1.5;
  padding-top: 24px;
}

.action {
  margin-top: 40px;
}
</style>
