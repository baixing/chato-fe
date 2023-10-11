<template>
  <div class="qa-container" v-loading="loading">
    <div
      v-if="
        !pagination.page_count &&
        QaSelectStatus === LearningStatesPerformanceType.all &&
        !searchInput
      "
      class="flex flex-col items-center justify-center mt-[20vh]"
    >
      <img
        :src="emptyQAPath"
        class="w-[321px] h-[201px] object-cover mb-12 lg:w-[240px] lg:h-[150px] lg:mb-8"
      />
      <p class="text-[#9DA3AF] text-xs mb-6">
        {{ $t('您还没有录入问答，快去录入吧！') }}
      </p>
      <el-button type="primary" plain @click="() => (dialogVisibleQa = true)">
        {{ $t('录入问答') }}
      </el-button>
    </div>
    <template v-else>
      <div class="flex justify-between items-center flex-wrap gap-4">
        <div class="flex gap-4 items-center flex-wrap">
          <el-button @click="handleTriggerMate">{{ $t('批量操作') }}</el-button>
          <SearchInput v-model:value="searchInput" />
          <el-button
            :disabled="!multipleSelection.length"
            v-if="batchRemove"
            @click="handleBatchRemove"
            link
            class="text-[#303133]"
          >
            <el-icon class="mr-[4px]"><Delete /></el-icon>
            {{ $t(' 删除') }}
          </el-button>
        </div>
        <div class="space-x-6 lg:space-x-0 lg:space-y-4">
          <span class="text-xs text-[#9DA3AF] lg:block">
            {{ $t('完成录入后，AI 通过 5-10 分钟消化知识，并最终优先根据问答知识回复') }}
          </span>
          <el-button type="primary" @click="() => (dialogVisibleQa = true)">
            {{ $t('录入问答') }}
          </el-button>
        </div>
      </div>
      <QaLearnTable
        v-model:selectStatus="QaSelectStatus"
        v-model:loading="loading"
        :batchRemove="batchRemove"
        :domainId="domainId"
        :domain-slug="domainInfo.slug"
        :activeNames="activeNames"
        :doc-list="(tableData as IDocumentList[])"
        v-model:multipleSelection="multipleSelection"
        v-model:pagination="pagination"
        @after-remove="onAfterRemove"
        @edit-preview-doc="onEditPreviewQA"
      />
    </template>
  </div>
  <EnterQa
    @setSuccess="onCloseDialog"
    :activeNames="activeNames"
    :defaultForm="currentEdit"
    :domainId="domainId"
    :sizeLimit="sizeLimit"
    :qtyLimit="qtyLimit"
    :apiUpload="apiUpload"
    :dialogVisible="dialogVisibleQa"
    @updateSpecailTipVisible="specailTipVisible = tableData.length"
    @reloadList="initQAList"
    @closeDialogVisble="onCloseDialog"
  />
</template>
<script lang="ts" setup>
import { deleteRetryFileMate, getFilesByDomainId } from '@/api/file'
import EnterQa from '@/components/EnterAnswer/EnterQa.vue'
import SearchInput from '@/components/Input/SearchInput.vue'
import useImagePath from '@/composables/useImagePath'
import { currentEnvConfig } from '@/config'
import { USER_ROLES } from '@/constant/common'
import { KnowledgeLearningFinalStatus } from '@/constant/knowledge'
import {
  DeleteRetryFileMateStatusType,
  EDocumentOperateType,
  EDocumentTabType,
  EKnowledgeBusinessType,
  LearningStatesPerformanceType
} from '@/enum/knowledge'
import type { IPage } from '@/interface/common'
import type { GetFilesByDomainIdType, IDocumentList, IQAForm } from '@/interface/knowledge'
import { useBase } from '@/stores/base'
import { useDomainStore } from '@/stores/domain'
import { $notnull } from '@/utils/help'
import * as url from '@/utils/url'
import { debouncedWatch } from '@vueuse/core'
import { ElLoading, ElMessageBox, ElNotification } from 'element-plus'
import { storeToRefs } from 'pinia'
import { computed, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import QaLearnTable from './QaLearnTable.vue'

const { t } = useI18n()
const { ImagePath: emptyQAPath } = useImagePath('empty-qa')

let timer = null
const route = useRoute()
const base = useBase()
const domainStoreI = useDomainStore()
const { domainInfo } = storeToRefs(domainStoreI)
const domainId = computed(() => domainInfo.value.id || (route.params.botId as string))
const qtyLimit = base.userInfo.role === USER_ROLES.SUPERMAN ? 1000 : 20 // 同时上传的文件数量限制
const sizeLimit = 30 // 单个文件的体积限制（MB）
const apiUpload = computed(() =>
  url.join(currentEnvConfig.uploadBaseURL, `/chato/api/domains/${domainId.value}/files/upload/qa`)
)
const multipleSelection = ref<IDocumentList[]>([])
const batchRemove = ref<boolean>(false)
const QaSelectStatus = ref(LearningStatesPerformanceType.all)
const searchInput = ref<string>('')
const loading = ref(true)
const tableData = ref<IDocumentList[]>([])
const pagination = ref<IPage>({
  page: 1,
  page_size: 10,
  total: 0,
  page_count: 0
})
const currentEdit = ref<IQAForm>()
const activeNames = ref<EDocumentTabType.uploadDoc | EDocumentTabType.inputText>(
  EDocumentTabType.inputText
)
const dialogVisibleQa = ref(false)
const specailTipVisible = ref(0)

const onEditPreviewQA = (value: any, type: EDocumentOperateType) => {
  if (type === EDocumentOperateType.retry) {
    deteleOrRetryFile(DeleteRetryFileMateStatusType.pending, [value.id])
    return
  }
  let list = []
  currentEdit.value = {
    id: value.id,
    question_id: 0,
    content: value.content_html,
    images: [],
    title: value.title,
    modalType: type
  }
  if ($notnull(value.images)) {
    list = value.images
  } else if ($notnull(value.image)) {
    list = [value.image]
  }
  currentEdit.value.images = list
  activeNames.value = EDocumentTabType.inputText
  dialogVisibleQa.value = true
}

const onCloseDialog = (refresh = true) => {
  dialogVisibleQa.value = false
  refresh && initQAList()
  currentEdit.value = {}
}

const onAfterRemove = async (fileId: number, message: string) => {
  await initQAList()
  ElNotification({
    type: 'success',
    message
  })
}

const initQAList = async () => {
  loading.value = true
  try {
    const params: GetFilesByDomainIdType = {
      page: pagination.value.page,
      business_type: EKnowledgeBusinessType.qa,
      keyword: searchInput.value
    }
    if (QaSelectStatus.value !== LearningStatesPerformanceType.all) {
      params.status = QaSelectStatus.value
    }
    const {
      data: { data, meta }
    } = await getFilesByDomainId(domainId.value, params)
    tableData.value = data
    pagination.value.page_count = meta.pagination.page_count
    specailTipVisible.value = data.length
  } catch (err) {
  } finally {
    loading.value = false
  }
}

const handleTriggerMate = () => {
  batchRemove.value = !batchRemove.value
  if (batchRemove.value) {
    clearInterval(timer)
  } else {
    timer = setInterval(() => {
      initQAList()
    }, 10000)
  }
}

const deteleOrRetryFile = async (type: DeleteRetryFileMateStatusType, ids: number[]) => {
  const loading = ElLoading.service({
    lock: true,
    text: type === DeleteRetryFileMateStatusType.deleted ? t('删除中...') : t('重试中...'),
    background: 'rgba(0, 0, 0, 0.7)'
  })
  const data = {
    status: type,
    ids: ids
  }
  const res = await deleteRetryFileMate(domainId.value, data)
  loading.close()
  return {
    code: res.data.code,
    message: res.data.msg || res.data.message
  }
}

const handleBatchRemove = () => {
  if (!multipleSelection.value.length) return
  ElMessageBox.confirm(t('您确认确删除这些文件吗？'), t('温馨提示'), {
    confirmButtonText: t('确认'),
    cancelButtonText: t('取消'),
    type: 'warning'
  })
    .then(async () => {
      const loading = ElLoading.service({
        lock: true,
        text: t('保存中'),
        background: 'rgba(0, 0, 0, 0.7)'
      })
      const ids = multipleSelection.value.map((item) => item.id)
      const res = await deteleOrRetryFile(DeleteRetryFileMateStatusType.deleted, ids)
      const code = res.code === 200
      const message = res.message
      loading.close()
      initQAList()
      ElNotification({
        type: code ? 'success' : 'error',
        message: code ? t('删除成功') : message
      })
    })
    .catch(() => {})
}

watch(
  tableData,
  () => {
    if (!tableData.value.length) {
      clearInterval(timer)
      return
    }

    const startTag = tableData.value.some(
      (item) => !KnowledgeLearningFinalStatus.includes(item.status)
    )
    if (startTag) {
      if (!timer) {
        timer = setInterval(() => {
          initQAList()
        }, 10000)
      }
    } else {
      clearInterval(timer)
    }
  },
  { deep: true }
)

debouncedWatch(searchInput, () => initQAList(), { debounce: 300 })

watch(
  [() => pagination.value.page, domainId, QaSelectStatus],
  ([page, v1, v2]) => {
    if (page || v1 || v2) {
      initQAList()
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  clearInterval(timer)
})
</script>
<style lang="scss" scoped>
:deep(.el-message-box) {
  --el-messagebox-width: 461px;
}

.qa-container {
  :deep(.file-list) {
    margin-top: 31px;
  }
}
</style>
