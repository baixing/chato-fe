<template>
  <Modal width="40%" mbile-width="95%" v-model:visible="visible" title="名单管理" :footer="false">
    <el-row class="w-full mb-4" justify="end">
      <el-col :span="4">
        <el-button type="primary" size="large" @click="enterUserVisible = true">
          {{ $t('录入用户') }}
        </el-button>
      </el-col>
    </el-row>

    <el-table
      v-loading="loading"
      :data="mobileList"
      style="width: 100%"
      header-row-class-name="table-header-title"
    >
      <el-table-column type="index" label="序号" width="80" />
      <el-table-column prop="mobile" label="手机号" width="150" />
      <el-table-column prop="remark" label="备注" />
      <el-table-column label="操作" header-align="center" width="120" fixed="right">
        <template #default="scope">
          <el-row class="w-full">
            <el-col :span="12">
              <el-button link type="primary" @click="handleEdit(scope.row)">
                {{ $t('编辑') }}
              </el-button>
            </el-col>
            <el-col :span="12">
              <el-button link type="danger" @click="handlerRemoveItem(scope.row.id)">
                {{ $t('删除') }}
              </el-button>
            </el-col>
          </el-row>
        </template>
      </el-table-column>
    </el-table>

    <div class="w-full flex items-center justify-end mt-4 overflow-x-scroll" v-if="page_count > 1">
      <el-pagination
        background
        layout="prev, pager, next"
        :page-size="page_size"
        :page-count="page_count"
        v-model:current-page="pageValue"
      />
    </div>
  </Modal>
  <EditUser
    v-model:value="editUserVisible"
    :editItem="settingItem"
    @handleEditSubmit="handleEditSubmit"
    @handleReloadList="emit('handleReloadList')"
  />
  <EnterUser
    v-model:value="enterUserVisible"
    :domainId="domainId"
    @handleEditSubmit="handleEditSubmit"
    @handleReloadList="emit('handleReloadList')"
  />
</template>

<script setup lang="ts">
import { postCommonGraph } from '@/api/graph'
import useGlobalProperties from '@/composables/useGlobalProperties'
import type { IMobileLimitItem } from '@/interface/release'
import { ElLoading, ElNotification as Notification } from 'element-plus'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import EditUser from './EditUser.vue'
import EnterUser from './EnterUser.vue'

const emit = defineEmits(['update:page', 'update:value', 'handleReloadList'])
const props = defineProps<{
  page: number
  total: number
  page_count: number
  page_size: number
  value: boolean
  domainId: number
  mobileList: IMobileLimitItem[]
}>()

const { t } = useI18n()
const loading = ref<boolean>(false)
const editUserVisible = ref<boolean>(false)
const enterUserVisible = ref<boolean>(false)
const settingItem = ref<IMobileLimitItem>()
const { deleteCommonGraph } = useGlobalProperties()
const pageValue = computed({
  set: (val) => emit('update:page', val),
  get: () => props.page
})

const visible = computed({
  get: () => props.value,
  set: (val) => emit('update:value', val)
})

const handlerRemoveItem = async (id: number) => {
  await deleteCommonGraph('domain_mobile_limit/' + id)
  emit('handleReloadList')
}

const handleEdit = (item: IMobileLimitItem) => {
  settingItem.value = item
  editUserVisible.value = true
}

// 快速录入
const handleEditSubmit = async (item: IMobileLimitItem) => {
  const loading = ElLoading.service({
    lock: true,
    text: t('保存中...'),
    background: 'rgba(0, 0, 0, 0.7)'
  })
  try {
    await postCommonGraph('domain_mobile_limit/save', {
      ...item,
      domain_id: props.domainId,
      id: null
    })
    // await postMobileLimitAPI(props.domainId, item)
    emit('handleReloadList')
    enterUserVisible.value = false
    editUserVisible.value = false
    Notification.success(t('保存成功'))
  } catch (error) {
  } finally {
    loading.close()
  }
}
</script>

<style scoped lang="scss">
:deep(.table-header-title) {
  color: $color;
  .el-table__cell {
    background: #f2f3f5 !important;
  }
}
</style>
