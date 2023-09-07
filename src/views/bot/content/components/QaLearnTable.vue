<template>
  <div class="file-list" v-loading="internalLoading">
    <el-table
      :data="internalDocList"
      style="width: 100%"
      header-row-class-name="table-header-title"
      @selection-change="handleSelectionChange"
    >
      <el-table-column v-if="batchRemove" type="selection" width="55" />
      <el-table-column v-if="!isMobile" label="id" prop="id" width="100" />
      <el-table-column :label="$t(`文件名`)">
        <template #default="scope">
          <a
            class="cm-link cm-link-preview"
            href="#rpreview"
            @click.prevent="previewFile(scope.row)"
          >
            {{ scope.row.title }}
          </a>
        </template>
      </el-table-column>
      <el-table-column v-if="!isMobile" :label="$t(`格式`)" width="100">
        <template #default="scope">
          {{ getFileTypeName(scope.row.type) }}
        </template>
      </el-table-column>
      <el-table-column v-if="!isMobile" :label="$t(`大小/字符数`)" width="150">
        <template #default="scope">
          <span v-if="scope.row.type === 'text'">{{ scope.row.raw_size }}{{ $t('字符') }}</span>
          <span v-else>{{ convertSize(scope.row.raw_size) }}</span>
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
                  v-for="item in selectableDeclarations"
                  :key="item.value"
                  :value="item.value"
                  @click="internalSelectStatus = item.value"
                  >{{ $t(item.label) }}</el-dropdown-item
                >
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
      <el-table-column v-if="!isMobile" :label="$t(`创建时间`)" width="170">
        <template #default="scope">
          {{ toSimpleDateTime(scope.row.created) }}
        </template>
      </el-table-column>
      <el-table-column :label="$t(`操作`)" width="100" fixed="right">
        <template #default="scope">
          <div class="flex flex-wrap gap-3 items-center">
            <el-button
              v-if="scope.row.type === 'text'"
              @click.prevent="editFile(scope.row)"
              type="primary"
              :disabled="scope.row.status !== 'learned'"
              link
              class="!p-0"
              >{{ $t('编辑') }}</el-button
            >
            <ReplaceFile
              v-else
              :domainId="domainId"
              :row="scope.row"
              type="template"
              @removeFile="removeFileCommon"
            />
            <el-button link type="danger" class="p-0 !ml-0" @click="deleteFile(scope.row.id)">{{
              $t('删除')
            }}</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination" v-if="internalPagination.page_count > 1">
      <el-pagination
        background
        layout="prev, pager, next"
        :page-size="internalPagination.page_size"
        :page-count="internalPagination.page_count"
        v-model:current-page="internalPagination.page"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { uploadQa } from '@/api/file'
import { useBasicLayout } from '@/composables/useBasicLayout'
import { LearningStatesPerformanceType } from '@/enum/knowledge'
import type { IPage } from '@/interface/common'
import type { IDocumentList } from '@/interface/knowledge'
import {
  FILE_STATUS_NAMES,
  getFileStatusName,
  getFileTypeName,
  toSimpleDateTime
} from '@/utils/formatter'
import { convertSize, openPreviewUrl } from '@/utils/help'
import { ElMessageBox, ElNotification as Notification } from 'element-plus'
import { computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { selectableDeclarations } from '../config'
import ReplaceFile from './ReplaceFile.vue'
const { t } = useI18n()
const props = defineProps<{
  loading: boolean
  domainId: string
  domainSlug: string
  docList: IDocumentList[]
  pagination: IPage
  selectStatus: string
  batchRemove: boolean
}>()

const emit = defineEmits([
  'update:loading',
  'update:pagination',
  'editPreviewDoc',
  'afterRemove',
  'update:selectStatus',
  'update:multipleSelection'
])

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

const internalDocList = computed(() => props.docList)

// 用户输入文本
const inputTextForm = reactive({
  id: 0,
  title: '',
  content_html: '',
  status: 'create'
})

// 删除文档
function deleteFile(fileId) {
  const confirmMessage = t('删除后将影响机器人的训练结果，不可恢复！')
  ElMessageBox.confirm(confirmMessage, t('确认删除'), {
    confirmButtonText: t('确认'),
    cancelButtonText: t('取消'),
    type: 'warning'
  })
    .then(() => {
      inputTextForm.id = fileId
      inputTextForm.status = 'delete'
      removeFileCommon(fileId, t('删除成功'))
    })
    .catch(() => {
      Notification({
        type: 'info',
        message: t('已取消')
      })
    })
}

// 删除文档公共方法
const removeFileCommon = async (fileId: number, message: string) => {
  internalLoading.value = true
  await uploadQa(props.domainSlug, inputTextForm)
  emit('afterRemove', fileId, message)
}

// 编辑文本
function editFile(file) {
  emit('editPreviewDoc', file, 'update')
}

function previewFile(file) {
  if (file.type === 'text') {
    emit('editPreviewDoc', file, 'preview')
  } else {
    openPreviewUrl(file.raw_file_url)
  }
}

const handleSelectionChange = (val: IDocumentList[]) => {
  emit('update:multipleSelection', val)
}
</script>
<style lang="scss" scoped>
.file-list {
  margin: auto;
  margin-top: 24px;
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
