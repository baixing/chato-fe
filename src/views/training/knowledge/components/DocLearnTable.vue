<script lang="ts" setup>
import { deleteFile, getWXPublicLearnCount, updateDocRefreshSwitch } from '@/api/file'
import SwitchWithStateMsg from '@/components/SwitchWithStateMsg/index.vue'
import SLTitle from '@/components/Title/SLTitle.vue'
import { useBasicLayout } from '@/composables/useBasicLayout'
import {
  UPLOAD_FILE_FORCED_CONVERSION_TO_TXT_TYPES,
  UPLOAD_FILE_VIDEO_AUDIO_TYPES
} from '@/constant/common'
import { EDocumentOperateType, LearningStatesPerformanceType } from '@/enum/knowledge'
import type { IPage } from '@/interface/common'
import type { IDocumentList } from '@/interface/knowledge'
import {
  FILE_STATUS_NAMES,
  FILE_TYPE_NAMES,
  getFileName,
  getFileStatusName,
  getFileTypeName,
  toSimpleDateTime
} from '@/utils/formatter'
import { convertSize, openPreviewUrl } from '@/utils/help'
import { ElMessageBox, ElNotification, ElNotification as Notification } from 'element-plus'
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ReplaceFile from './ReplaceFile.vue'
import { selectableDeclarations } from './config'

const { t } = useI18n()
const props = defineProps<{
  loading: boolean
  domainId: string | number
  docList: IDocumentList[]
  pagination: IPage
  selectStatus: string
  batchRemove: boolean
  learnCount: {
    success: number
    total: number
  }
}>()
let timerPublicLearn = null
const emit = defineEmits([
  'update:loading',
  'update:pagination',
  'editPreviewDoc',
  'refresh',
  'removeDoc',
  'update:selectStatus',
  'update:multipleSelection'
])

const selectableDeclarationsDoc = [
  ...selectableDeclarations,
  {
    label: FILE_STATUS_NAMES.crawl_error,
    value: LearningStatesPerformanceType.crawl_error
  }
]

const { isMobile } = useBasicLayout()

const internalLoading = computed({
  get: () => props.loading,
  set: (val) => emit('update:loading', val)
})

const internalPagination = computed({
  get: () => props.pagination,
  set: (val) => emit('update:pagination', val)
})

const internalSelectStatus = computed({
  get: () => props.selectStatus,
  set: (val) => emit('update:selectStatus', val)
})

const internalDomainId = computed(() => props.domainId)
const internalDocList = computed(() => props.docList)
const learnCount = computed(() => props.learnCount)

onMounted(() => {
  timerPublicLearn = setInterval(() => {
    getPublicLearnCount()
  }, 10000)
})

// 删除文档
function onDeleteFile(fileId) {
  const confirmMessage = t('删除后将影响机器人的训练结果，不可恢复！')
  ElMessageBox.confirm(confirmMessage, t('确认删除'), {
    confirmButtonText: t('确认'),
    cancelButtonText: t('取消'),
    type: 'warning'
  })
    .then(() => {
      removeFileCommon(fileId, t('删除成功'))
    })
    .catch(() => {
      Notification({
        type: 'info',
        message: t('已取消')
      })
    })
}

const getPublicLearnCount = async () => {
  const res = await getWXPublicLearnCount(Number(props.domainId))
  learnCount.value.success = Number(res.data.data.success)
  learnCount.value.total = Number(res.data.data.total)
}

// 删除文档公共方法
const removeFileCommon = async (fileId: number, message: string) => {
  internalLoading.value = true
  await deleteFile(fileId)
  emit('removeDoc', fileId, message)
}

// 编辑重试
function editFile(file: IDocumentList, type) {
  emit('editPreviewDoc', file, type)
}

function previewFile(file: IDocumentList) {
  if (['txt', 'url'].includes(FILE_TYPE_NAMES[file.type]) && file.content_html) {
    emit('editPreviewDoc', file, EDocumentOperateType.preview)
  } else {
    openPreviewUrl(file.raw_file_url)
  }
}
const handleSelectionChange = (val: IDocumentList[]) => {
  emit('update:multipleSelection', val)
}

const formatDisplayFileName = (rowData: IDocumentList) => {
  if (
    UPLOAD_FILE_FORCED_CONVERSION_TO_TXT_TYPES.includes(`.${rowData.type}`) &&
    !rowData.content_html
  ) {
    return rowData.title
  } else {
    return getFileName(rowData.title)
  }
}

const checkDocTypeQuestionConvert = (rowData: IDocumentList) => {
  return (
    UPLOAD_FILE_VIDEO_AUDIO_TYPES.includes(`.${rowData.type}`) ||
    LearningStatesPerformanceType.pending === rowData.status
  )
}

const formatDisplayFileType = (rowData: IDocumentList) => {
  if (
    UPLOAD_FILE_FORCED_CONVERSION_TO_TXT_TYPES.includes(`.${rowData.type}`) &&
    !rowData.content_html
  ) {
    return rowData.type
  } else {
    return getFileTypeName(rowData.type)
  }
}

const formatDisplayCharacter = (rowData: IDocumentList) => {
  // 如果是txt文件或音视频或图片转成 txt 文件，且生成的 txt 文件有内容，则显示字符数，不然就显示文件大小值
  if (
    rowData.type === 'text' ||
    rowData.type === 'url' ||
    (UPLOAD_FILE_FORCED_CONVERSION_TO_TXT_TYPES.includes(`.${rowData.type}`) &&
      rowData.content_html)
  ) {
    return `${rowData.raw_size} ${t('字符')}`
  } else {
    return convertSize(rowData.raw_size)
  }
}

const timingVisible = ref(false)
const timingFormState = reactive<{
  fileId: number
  refresh_switch: number
}>({
  fileId: null,
  refresh_switch: 0
})
const onOpenTimingConfig = (item: IDocumentList) => {
  timingFormState.fileId = item.id
  timingFormState.refresh_switch = item.refresh_switch
  timingVisible.value = true
}

const onSaveTimingConfig = async () => {
  try {
    await updateDocRefreshSwitch(timingFormState.fileId, timingFormState.refresh_switch)
    ElNotification.success(t('操作成功'))
    emit('refresh')
  } catch {}
}

onUnmounted(() => {
  clearInterval(timerPublicLearn)
})
</script>

<template>
  <div class="file-list">
    <el-table
      :data="internalDocList"
      stripe
      style="width: 100%"
      @selection-change="handleSelectionChange"
      header-row-class-name="table-header-title"
    >
      <el-table-column v-if="batchRemove" type="selection" width="55" />
      <el-table-column v-if="!isMobile" label="id" prop="id" width="100" />
      <el-table-column :label="$t('文件名')">
        <template #default="scope">
          <a
            class="cm-link cm-link-preview"
            href="#rpreview"
            @click.prevent="previewFile(scope.row)"
          >
            {{ formatDisplayFileName(scope.row) }}
          </a>
        </template>
      </el-table-column>
      <el-table-column v-if="!isMobile" :label="$t('格式')" width="70">
        <template #default="scope">
          {{ formatDisplayFileType(scope.row) }}
        </template>
      </el-table-column>
      <el-table-column v-if="!isMobile" :label="$t('大小/字符数')" width="150">
        <template #default="scope">
          <span>{{ formatDisplayCharacter(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column width="150">
        <template #header>
          <el-dropdown class="mt-[5px]">
            <div class="cursor-pointer text-[#303133] flex items-center">
              {{ $t(FILE_STATUS_NAMES[internalSelectStatus]) }}
              <el-icon class="ml-[12px]">
                <arrow-down />
              </el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="item in selectableDeclarationsDoc"
                  :key="item.value"
                  :value="item.value"
                  @click="internalSelectStatus = item.value"
                >
                  {{ $t(item.label) }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template #default="scope">
          <span data-script="Chato-learn-status" class="flex items-center">
            {{ $t(getFileStatusName(scope.row.status)) }}
            <el-tooltip
              v-if="scope.row.status === LearningStatesPerformanceType.error"
              effect="dark"
              :content="scope.row.learn_error"
              placement="top"
              class="max-w-[300px]"
            >
              <svg-icon name="question-circle" class="ml-[4px]"></svg-icon>
            </el-tooltip>
          </span>
        </template>
      </el-table-column>

      <el-table-column v-if="!isMobile" :label="$t('创建时间')" width="170">
        <template #default="scope">
          {{ toSimpleDateTime(scope.row.created) }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('操作')" width="180" fixed="right">
        <template #default="scope">
          <div class="flex flex-wrap gap-3 items-center">
            <el-button
              v-if="scope.row.status === LearningStatesPerformanceType.error"
              @click.prevent="editFile(scope.row, EDocumentOperateType.retry)"
              type="primary"
              link
              class="p-0"
            >
              {{ $t('重试') }}
            </el-button>
            <el-button
              v-else-if="scope.row.type === 'text' || scope.row.type === 'url'"
              @click.prevent="editFile(scope.row, EDocumentOperateType.update)"
              :disabled="scope.row.status !== LearningStatesPerformanceType.learned"
              type="primary"
              link
              class="p-0"
            >
              {{ $t('编辑') }}
            </el-button>
            <ReplaceFile
              v-else
              :domainId="internalDomainId"
              :row="scope.row"
              type="file"
              @removeFile="removeFileCommon"
            />
            <el-button
              v-if="FILE_TYPE_NAMES[scope.row.type] === 'url'"
              @click.prevent="onOpenTimingConfig(scope.row)"
              type="primary"
              link
              class="p-0"
            >
              {{ $t('配置定时任务') }}
            </el-button>
            <el-button link type="danger" class="p-0 !ml-0" @click="onDeleteFile(scope.row.id)">
              {{ $t('删除') }}
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination !justify-between w-full" v-if="internalPagination.page_count > 1">
      <div class="text-[#9DA3AF] text-sm" v-if="learnCount.total - learnCount.success > 0">
        {{ t('正在进行的任务：已抓取的公众号文章') }}
        <span class="text-[#7C5CFC]">{{ learnCount.success }}</span> {{ t('条；等待中的文章') }}
        <span class="text-[#7C5CFC]">{{ learnCount.total - learnCount.success }}</span>
        {{ t('条') }}
      </div>
      <div v-else></div>
      <el-pagination
        background
        layout="prev, pager, next"
        :page-size="internalPagination.page_size"
        :page-count="internalPagination.page_count"
        v-model:current-page="internalPagination.page"
      />
    </div>

    <Modal v-model:visible="timingVisible" title="配置定时任务" @submit="onSaveTimingConfig">
      <el-form label-position="right" :model="timingFormState" class="chato-form">
        <el-form-item class="!mb-0">
          <template #label>
            <SLTitle tips="开启后，将于每周一 03:00 定时再次学习当前网页内容。">
              {{ t('定时刷新') }}
            </SLTitle>
          </template>
          <SwitchWithStateMsg
            v-model:value="timingFormState.refresh_switch"
            open-msg="开启"
            close-msg="关闭"
            msg-position="right"
          />
        </el-form-item>
      </el-form>
    </Modal>
  </div>
</template>

<style lang="scss" scoped>
.file-list {
  margin: auto;
  width: 100%;
  overflow-x: scroll;

  :deep(.table-header-title) {
    color: $color;
    .el-table__cell {
      background: #f2f3f5 !important;
    }
  }

  .pagination {
    @apply flex items-center justify-end;

    margin-top: 30px;
  }
}
</style>
