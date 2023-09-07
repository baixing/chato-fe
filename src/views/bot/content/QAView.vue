<template>
  <div class="qa-container" v-loading="initing">
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
      <el-button
        type="primary"
        size="large"
        plain
        @click="() => (dialogVisibleQa = true)"
        class="bg-white"
        >{{ $t('录入问答') }}</el-button
      >
    </div>
    <template v-else>
      <div class="flex justify-between items-center flex-wrap gap-4">
        <p class="tab-describe">
          {{ $t('完成录入后，AI 通过 5-10 分钟消化知识，并最终优先根据问答知识回复，可前往')
          }}<RouterLink
            :to="{
              name: RoutesMap.tranning.botChat,
              params: { botId: domainId }
            }"
            >{{ $t('聊天演示') }}</RouterLink
          >{{ $t('测试效果。') }}
        </p>
        <el-button type="primary" size="large" @click="() => (dialogVisibleQa = true)">{{
          $t('录入问答')
        }}</el-button>
      </div>
      <div class="flex justify-between items-center mt-[31px] flex-wrap">
        <div>
          <el-button @click="handleTriggerMate">{{ $t('批量操作') }}</el-button>
          <el-button
            :disabled="!multipleSelection.length"
            v-if="batchRemove"
            @click="handleBatchRemove"
            link
            class="ml-[16px] text-[#303133]"
          >
            <el-icon class="mr-[4px]"><Delete /></el-icon>{{ $t(' 删除') }}</el-button
          >
        </div>
        <SearchInput v-model:value="searchInput" />
      </div>
      <QaLearnTable
        v-model:selectStatus="QaSelectStatus"
        v-model:loading="loading"
        :batchRemove="batchRemove"
        :domain-id="domainId"
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
import {
  DeleteRetryFileMateStatusType,
  EDocumentOperateType,
  EDocumentTabType,
  EKnowledgeBusinessType,
  LearningStatesPerformanceType
} from '@/enum/knowledge'
import type { IPage } from '@/interface/common'
import type { GetFilesByDomainIdType, IDocumentList, IQAForm } from '@/interface/knowledge'
import { RoutesMap } from '@/router'
import { useBase } from '@/stores/base'
import { useDomainStore } from '@/stores/domain'
import { $notnull } from '@/utils/help'
import * as url from '@/utils/url'
import { ElLoading, ElMessageBox, ElNotification } from 'element-plus'
import { debounce } from 'lodash'
import { storeToRefs } from 'pinia'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import QaLearnTable from './components/QaLearnTable.vue'
const { ImagePath: emptyQAPath } = useImagePath('empty-qa')

const { t } = useI18n()
let timer = null
const route = useRoute()
const base = useBase()
const domainStoreI = useDomainStore()
const { domainInfo } = storeToRefs(domainStoreI)
const domainId = (domainInfo.value.id || route.params.botId).toString()
const qtyLimit = base.userInfo.role === USER_ROLES.SUPERMAN ? 1000 : 20 // 同时上传的文件数量限制
const sizeLimit = 30 // 单个文件的体积限制（MB）
const apiUpload = computed(() =>
  url.join(currentEnvConfig.uploadBaseURL, `/chato/api/domains/${domainId}/files/upload/qa`)
)
const multipleSelection = ref<IDocumentList[]>([])
const batchRemove = ref<boolean>(false)
const QaSelectStatus = ref(LearningStatesPerformanceType.all)
const searchInput = ref<string>('')
const initing = ref(true)
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

const initQAList = async (callStatus = false) => {
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
    } = await getFilesByDomainId(domainId, params)
    tableData.value = data
    pagination.value.page_count = meta.pagination.page_count
    callStatus ? (specailTipVisible.value = data.length) : ''
  } catch (err) {
  } finally {
    loading.value = false
  }
}

const init = async () => {
  try {
    initing.value = true
    await initQAList()
  } catch (err) {
  } finally {
    initing.value = false
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
  const res = await deleteRetryFileMate(domainId, data)
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

const delayedAPICall = debounce(() => {
  initQAList()
}, 100)

const watchPagination = watch(
  () => pagination.value.page,
  () => initQAList()
)

const watchTableData = watch(
  tableData,
  () => {
    if (!tableData.value.length) {
      clearInterval(timer)
      return
    }

    const startTag = tableData.value.some((item) => item.status !== 'learned')
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

const wacthQaSelectStatus = watch(QaSelectStatus, () => {
  init()
})

const watchSearchInput = watch(searchInput, () => {
  delayedAPICall()
})

onMounted(() => {
  init()
})

onUnmounted(() => {
  watchTableData()
  watchPagination()
  wacthQaSelectStatus()
  watchSearchInput()
  clearInterval(timer)
})
</script>
<style lang="scss" scoped>
:deep(.el-message-box) {
  --el-messagebox-width: 461px;
}
.tab-describe {
  font-size: 12px;
  color: #9da3af;
  line-height: 20px;

  a {
    color: #7c5cfc;
  }
}
.qa-container {
  :deep(.file-list) {
    margin-top: 31px;
  }
}
.mate-item {
  margin-right: 6px;
  padding-bottom: 12px;
  font-size: 16px;
  color: #596780;
}
.mate-selected {
  width: 64px;
  color: #303133;
  font-weight: 500;
  border-bottom: 2px solid #303133;
}
</style>
