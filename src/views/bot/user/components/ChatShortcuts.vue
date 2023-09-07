<template>
  <el-table
    :data="internalShortcut"
    size="default"
    :empty-text="$t(`您还没有设置菜单栏`)"
    header-cell-class-name="!bg-[#F2F3F5] !text-sm !font-normal"
    max-height="250"
    style="width: 100%"
  >
    <el-table-column v-if="!isMobile" :label="$t(`序号`)" width="100">
      <template #default="scope">{{ $t(' 回复设置') }}{{ scope.$index + 1 }} </template>
    </el-table-column>
    <el-table-column prop="title" :label="$t(`关键词`)">
      <template #default="scope">
        {{ scope.row.title }}
      </template>
    </el-table-column>
    <el-table-column :label="$t(`回复内容`)" width="115">
      <template #default="{ row }">
        {{ rednerRowResponseSummary(row) }}
      </template>
    </el-table-column>
    <el-table-column fixed="right" :label="$t(`操作`)" width="140">
      <template #default="scope">
        <el-row :gutter="10" align="middle">
          <el-col :span="8">
            <a
              class="cm-link"
              href="#rpreview"
              @click.prevent="onEditViewShortcut(scope.$index, 'preview')"
              >{{ $t('查看') }}</a
            >
          </el-col>
          <el-col :span="8">
            <a
              class="cm-link"
              href="#rate"
              @click.prevent="onEditViewShortcut(scope.$index, 'edit')"
              >{{ $t('编辑') }}</a
            >
          </el-col>
          <el-col :span="8">
            <a class="cm-link" href="#rate" @click.prevent="onDeleteShortcut(scope.$index)">{{
              $t('删除')
            }}</a>
          </el-col>
        </el-row>
      </template>
    </el-table-column>
  </el-table>
  <el-button
    v-if="internalShortcut.length < 3"
    class="mt-5 p-0"
    type="primary"
    link
    @click="onAddShortcut"
    >{{ $t('+ 添加菜单栏') }}</el-button
  >

  <AddShortcut
    @setSuccess="
      (shortcut) => {
        dialogVisible = !dialogVisible
        internalShortcut[shortcut.index] = shortcut
      }
    "
    :default-form="curShortcut"
    :apiUpload="apiUpload"
    :dialogVisible="dialogVisible"
    @closeDialogVisble="() => (dialogVisible = false)"
  />
</template>

<script setup lang="ts">
import { useBasicLayout } from '@/composables/useBasicLayout'
import { currentEnvConfig } from '@/config'
import type { IDomainShortcut } from '@/interface/domain'
import type { TDefaultShortcutProps } from '@/interface/userInterface'
import { $notnull } from '@/utils/help'
import * as url from '@/utils/url'
import { ElNotification } from 'element-plus'
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AddShortcut from './AddShortcut.vue'

const { t } = useI18n()
const props = defineProps<{
  shortcuts: IDomainShortcut[]
  domainId: string
}>()

const emit = defineEmits(['update:shortcuts'])

const internalShortcut = computed({
  get: () => props.shortcuts,
  set: (val) => emit('update:shortcuts', val)
})

const apiUpload = url.join(currentEnvConfig.uploadBaseURL, '/chato/api/file/upload/file')

const { isMobile } = useBasicLayout()

const DefaultShortcut: TDefaultShortcutProps = {
  title: '',
  response: '',
  image: '',
  images: [],
  status: 'create',
  index: 0
}

let curShortcut = reactive({ ...DefaultShortcut })

const dialogVisible = ref(false)

const onAddShortcut = () => {
  const len = internalShortcut.value.length
  if (len >= 3) {
    ElNotification.error(t('最多添加3个快捷回复'))
    return
  }
  curShortcut = Object.assign(curShortcut, { ...DefaultShortcut, index: len })
  dialogVisible.value = true
}

const onEditViewShortcut = (index: number, type: 'preview' | 'edit') => {
  let list = []
  const internalShortcutItem = internalShortcut.value[index]
  const newState = {
    title: internalShortcutItem.title,
    response: internalShortcutItem.response,
    images: [],
    status: type,
    index
  }
  if ($notnull(internalShortcutItem.images)) {
    list = internalShortcutItem.images
  } else if ($notnull(internalShortcutItem.image)) {
    list = [internalShortcutItem.image]
  }
  newState.images = list
  curShortcut = Object.assign(curShortcut, newState)
  dialogVisible.value = true
}

const onDeleteShortcut = (index: number) => {
  internalShortcut.value.splice(index, 1)
}

const rednerRowResponseSummary = (row: IDomainShortcut) => {
  const summary = []
  if (row.response) {
    summary.push(t('文字'))
  }
  if ($notnull(row.images)) {
    summary.push(t('图片'))
  }

  return summary.join(' + ')
}
</script>
