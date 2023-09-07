<template>
  <div v-if="isShowUpgrate" class="content-view-container">
    <UpgrateVersion />
  </div>
  <template v-else>
    <div class="report-detail-title">
      <div class="flex gap-4 overflow-hidden flex-1 flex-wrap lg:flex-col">
        <div class="flex gap-4 w-fit flex-wrap">
          <el-select v-model="selectId" size="large">
            <el-option
              v-for="item in selectList"
              :key="item.id"
              :label="item.title"
              :value="item.id"
            ></el-option>
          </el-select>
          <el-date-picker
            size="large"
            v-model="timeRange"
            value-format="YYYY-MM-DD HH:mm:ss"
            @change="updateList(1)"
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
        <el-button v-if="multipleSelection.size > 0" type="primary" @click="() => handleExport()">
          {{ $t('导出当前') }}
        </el-button>
        <el-button type="primary" @click="() => handleExport(true)">
          {{ $t('导出全部') }}
        </el-button>
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
              <li>{{ $t('序号') }}：{{ row.id }}</li>
              <li>{{ $t('填写时间') }}：{{ toSimpleDateTime(row.created) }}</li>
              <li>{{ $t('用户ID') }}：{{ row.sender_uid }}</li>
              <li v-for="item in curSelectInfo.fields" :key="item.id" :label="item.name">
                {{ item.name }}：{{ row[item.field_id] }}
              </li>
            </ul>
          </template>
        </el-table-column>
        <el-table-column v-if="!isMobile" type="selection" width="55" />
        <el-table-column v-if="!isMobile" prop="id" :label="$t(`序号`)" align="left" width="80" />
        <el-table-column v-if="!isMobile" :label="$t(`填写时间`)" align="left" width="150">
          <template #default="{ row }">
            {{ toSimpleDateTime(row.created) }}
          </template>
        </el-table-column>
        <el-table-column :label="$t(`用户ID`)" prop="sender_uid" />
        <el-table-column v-for="item in curSelectInfo.fields" :key="item.id" :label="item.name">
          <template #default="{ row }">
            {{ row[item.field_id] }}
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
  </template>
</template>

<script setup lang="ts">
import {
  exportFormCollectDetailList,
  getFormCollectDetailList,
  getFormCollectSelect
} from '@/api/report'
import SearchInput from '@/components/Input/SearchInput.vue'
import { useBasicLayout } from '@/composables/useBasicLayout'
import useSpaceRights from '@/composables/useSpaceRights'
import { ESpaceCommercialType } from '@/enum/space'
import type { IPage, TPagingList } from '@/interface/common'
import type { IFormCollectDetailList, IFormCollectSelect } from '@/interface/report'
import { useDomainStore } from '@/stores/domain'
import { toSimpleDateTime } from '@/utils/formatter'
import { downloadFile } from '@/utils/help'
import { debouncedWatch } from '@vueuse/core'
import { ElNotification as Notification } from 'element-plus'
import { storeToRefs } from 'pinia'
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import UpgrateVersion from './components/UpgrateVersion.vue'
const { t } = useI18n()
const route = useRoute()
const domainStoreI = useDomainStore()
const { domainInfo } = storeToRefs(domainStoreI)
const domainId = computed(() => domainInfo.value.id || route.params.botId)
const { isMobile } = useBasicLayout()
const { isAllowedCommercialType } = useSpaceRights()
const isListLoading = ref(false) // 列表加载状态
const $items = ref<IFormCollectDetailList[]>([]) // 列表内容
const $pagination = ref<Partial<IPage>>({}) // 分页信息（主要用于获取总条数）
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

const selectList = ref<IFormCollectSelect[]>([])
const selectId = ref()
const curSelectInfo = computed(() => {
  return selectId.value
    ? selectList.value.filter((item) => item.id == selectId.value)[0]
    : { fields: [], id: 0 }
})

const isShowUpgrate = computed(() => isAllowedCommercialType([ESpaceCommercialType.free]))

async function init() {
  await getSelectList()
}

const fieldsKeywords = (text: string) => {
  return curSelectInfo.value.fields.reduce((pre, cur) => {
    return (pre += `+or+${cur.field_id}=="${text}"`)
  }, '')
}

const updateList = async (page = 1) => {
  isListLoading.value = true
  const begin_time = timeRange.value ? timeRange.value[0] : '2023-7-1'
  const end_time = timeRange.value ? timeRange.value[1] : '2123-7-2'
  let filter = `(created>="${begin_time}"+and+created<="${end_time}")${
    keyword.value ? fieldsKeywords(keyword.value) : ''
  }`
  if (selectId.value) filter += '+and+form==' + selectId.value
  try {
    const res = await getFormCollectDetailList({
      page,
      size: 20,
      filter
    })
    $items.value = res.data?.data || []
    $pagination.value = res.data?.pagination || {}
    nextTick(() => {
      $items.value.forEach((item) => {
        if (multipleSelection.value.has(item.id)) {
          multipleTableRef.value.toggleRowSelection(item)
        }
      })
    })
  } catch (e) {
  } finally {
    isListLoading.value = false
  }
}

debouncedWatch(keyword, () => updateList(1), { debounce: 300 })

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

async function handleExport(isAll = false) {
  const exportArray = isAll ? [] : Array.from(multipleSelection.value)
  if (exportArray.length === 0 && !isAll) {
    Notification.error(t('抱歉，未勾选数据，无法导出。请先勾选数据再进行导出操作。'))
    return
  }
  isListLoading.value = true
  try {
    const params: TPagingList = {}
    if (isAll) {
      params.size = 1000
      params.filter = `form==${curSelectInfo.value.id}`
    } else {
      params.filter = `id${exportArray.length === 1 ? '==' : '+in+'}(${exportArray.join(
        ','
      )})+form==${curSelectInfo.value.id}`
    }
    const res = await exportFormCollectDetailList(params)
    downloadFile(res.data)
  } catch (e) {
  } finally {
    isListLoading.value = false
  }
}

const getSelectList = async () => {
  const {
    data: { data }
  } = await getFormCollectSelect({
    page: 1,
    size: 100,
    filter: `domain_id==${domainId.value}`
  })
  selectList.value = data
  selectId.value = data.length > 0 ? data[0].id : ''
}

watch(domainId, (v) => v && init(), { immediate: true })
watch(selectId, (v) => {
  multipleSelection.value.clear()
  v && updateList(1)
})
</script>

<style lang="scss" scoped>
.content-view-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.list {
  padding-top: 24px;
  margin: auto;
  width: 100%;
  overflow-x: scroll;
  :deep(.el-col) {
    @apply flex items-center justify-center;
  }
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
  :deep(.table-header-title) {
    color: $color;
  }

  .pagination {
    @apply flex items-center justify-between;
    margin-top: 24px;
    flex-direction: row-reverse;
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
</style>

<style lang="scss">
.page-center-container {
  position: relative;
}
</style>
