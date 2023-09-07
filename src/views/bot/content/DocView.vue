<template>
  <div v-loading="initing">
    <div
      v-if="
        !pagination.page_count &&
        DocSelectStatus === LearningStatesPerformanceType.all &&
        !searchInput
      "
      class="flex flex-col items-center justify-center mt-[20vh]"
    >
      <img
        :src="emptydocImg"
        class="w-[332px] h-[196px] object-cover mb-12 lg:w-[249px] lg:h-[147px] lg:mb-8"
      />
      <p class="text-[#9DA3AF] text-xs mb-6">
        {{ $t('您还没有录入文档，快去录入吧！') }}
      </p>
      <el-button
        type="primary"
        size="large"
        plain
        @click="() => (dialogVisible = true)"
        class="bg-white"
        >{{ $t('录入文档') }}</el-button
      >
    </div>
    <template v-else>
      <div class="flex justify-between items-center flex-wrap gap-4">
        <p class="tab-describe">
          {{ $t('完成录入后，AI 将快速完成素材浏览学习，并通过 5-10 分钟消化知识，随后可前往')
          }}<router-link
            :to="{
              name: RoutesMap.tranning.botChat,
              params: { botId: domainId }
            }"
            >{{ $t('聊天演示') }}</router-link
          >{{ $t('测试效果。') }}
        </p>
        <el-button type="primary" size="large" @click="() => (dialogVisible = true)">{{
          $t('录入文档')
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
      <DocLearnTable
        :batchRemove="batchRemove"
        v-model:selectStatus="DocSelectStatus"
        v-model:loading="loading"
        v-model:multipleSelection="multipleSelection"
        :domain-id="domainId"
        :doc-list="(tableData as IDocumentList[])"
        v-model:pagination="pagination"
        @remove-doc="onRemoveDoc"
        @edit-preview-doc="onEditPreviewDoc"
      />
    </template>
    <EnterDoc
      :specailTipVisible="specailTipVisible"
      :domain-id="domainId"
      :defaultForm="currentEdit"
      :sizeLimit="sizeLimit"
      :qtyLimit="qtyLimit"
      :apiUpload="apiUpload"
      :dialogVisible="dialogVisible"
      @updateSpecailTipVisible="specailTipVisible = tableData.length"
      @setSuccess="onCloseDialog"
      @reloadList="initDocList"
      @closeDialogVisble="onCloseDialog"
    />
  </div>
</template>
<script lang="ts" setup>
import { deleteRetryFileMate, getFilesByDomainId } from '@/api/file'
import EnterDoc from '@/components/EnterAnswer/EnterDoc.vue'
import SearchInput from '@/components/Input/SearchInput.vue'
import useImagePath from '@/composables/useImagePath'
import { currentEnvConfig } from '@/config'
import { USER_ROLES } from '@/constant/common'
import {
  DeleteRetryFileMateStatusType,
  EDocumentOperateType,
  EKnowledgeBusinessType,
  LearningStatesPerformanceType
} from '@/enum/knowledge'
import type { IPage } from '@/interface/common'
import type { GetFilesByDomainIdType, IDocumentForm, IDocumentList } from '@/interface/knowledge'
import { RoutesMap } from '@/router'
import { useBase } from '@/stores/base'
import { useDomainStore } from '@/stores/domain'
import * as url from '@/utils/url'
import { ElLoading, ElMessageBox, ElNotification } from 'element-plus'
import { debounce } from 'lodash'
import { storeToRefs } from 'pinia'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import DocLearnTable from './components/DocLearnTable.vue'
const { ImagePath: emptydocImg } = useImagePath('empty-doc')

const { t } = useI18n()
let timer = null
const base = useBase()
const route = useRoute()
const domainStoreI = useDomainStore()
const { domainInfo } = storeToRefs(domainStoreI)
const domainId = (domainInfo.value.id || route.params.botId).toString()
const qtyLimit = base.userInfo.role === USER_ROLES.SUPERMAN ? 1000 : 20 // 同时上传的文件数量限制
const sizeLimit = 30 // 单个文件的体积限制（MB）
const apiUpload = computed(() =>
  url.join(currentEnvConfig.uploadBaseURL, `/chato/api/domains/${domainId}/files/upload/document`)
)
const serachStatus = ref(false)
const searchInput = ref<string>('')
const multipleSelection = ref<IDocumentList[]>([])
const DocSelectStatus = ref(LearningStatesPerformanceType.all)
const batchRemove = ref<boolean>(false)
const initing = ref(true)
const loading = ref(true)
const tableData = ref<IDocumentList[]>([])
const pagination = ref<IPage>({
  page: 1,
  page_size: 10,
  total: 0,
  page_count: 0
})
const specailTipVisible = ref(0)

const currentEdit = ref<IDocumentForm>({})
const dialogVisible = ref(false)

const onEditPreviewDoc = (value: any, type: EDocumentOperateType) => {
  if (type === EDocumentOperateType.retry) {
    deteleOrRetryFile(DeleteRetryFileMateStatusType.pending, [value.id])
    return
  }
  dialogVisible.value = true
  currentEdit.value = {
    title: value.title,
    content_html: value.content_html,
    id: value.id,
    status: type
  }
}

const onCloseDialog = (refresh = true) => {
  dialogVisible.value = false
  refresh && initDocList()
  currentEdit.value = {}
}

const onRemoveDoc = async (fileId: number, message: string) => {
  await initDocList()
  ElNotification({
    type: 'success',
    message
  })
}

const initDocList = async (callStatus = false) => {
  loading.value = true
  try {
    const params: GetFilesByDomainIdType = {
      page: pagination.value.page,
      business_type: EKnowledgeBusinessType.document,
      keyword: searchInput.value
    }
    if (DocSelectStatus.value !== LearningStatesPerformanceType.all) {
      params.status = DocSelectStatus.value
    }
    const {
      data: { data, meta }
    } = await getFilesByDomainId(domainId, params)
    tableData.value = data
    pagination.value.page_count = meta.pagination.page_count
    callStatus ? (specailTipVisible.value = tableData.value.length) : ''
  } catch (err) {
  } finally {
    loading.value = false
    serachStatus.value = false
  }
}

const init = async () => {
  try {
    initing.value = true
    await initDocList(true)
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
      initDocList()
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
      const ids = multipleSelection.value.map((item) => item.id)
      const res = await deteleOrRetryFile(DeleteRetryFileMateStatusType.deleted, ids)
      const code = res.code === 200
      const message = res.message
      initDocList()
      ElNotification({
        type: code ? 'success' : 'error',
        message: code ? t('删除成功') : message
      })
    })
    .catch(() => {})
}

const delayedAPICall = debounce(() => {
  initDocList()
}, 100)

const watchPagination = watch(
  () => pagination.value.page,
  () => initDocList()
)

const watchSearchInput = watch(searchInput, () => {
  delayedAPICall()
})

const watchTable = watch(
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
          initDocList()
        }, 10000)
      }
    } else {
      clearInterval(timer)
    }
  },
  { deep: true }
)

const wacthQaSelectStatus = watch(DocSelectStatus, () => {
  init()
})

onMounted(() => {
  init()
})

onUnmounted(() => {
  watchTable()
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
</style>
