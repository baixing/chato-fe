<template>
  <Topbar :title="$t('我的机器人')" />
  <ContentLayout>
    <div v-loading="initing">
      <div class="grid grid-cols-2 lg:grid-cols-1 gap-5 lg:gap-4">
        <div
          data-script="Chato-createBot"
          class="bg-white rounded-lg p-5 flex gap-3 transition-shadow cursor-pointer h-full hover:shadow-md lg:p-4 lg:h-auto"
          @click="onNew"
        >
          <div
            class="w-12 h-12 flex items-center justify-center rounded-full overflow-hidden shrink-0 bg-[#F2F3F5] lg:w-10 lg:h-10"
          >
            <el-icon :size="20" class="text-[#596780]"><Plus /></el-icon>
          </div>
          <div>
            <p class="font-medium text-sm leading-5 text-[#7C5CFC] mb-2">{{ $t('创建机器人') }}</p>
            <p class="text-[#9DA3AF] text-[13px] leading-[22px]">
              {{ $t('快速创建一个属于你的机器人吧！') }}
            </p>
          </div>
        </div>
        <BotListCard
          v-for="item in domainList"
          :key="item.id"
          :bot="item"
          @delete="onDelete"
          @cloneRobot="cloneRobot"
          @sync="onOpenSync"
        />
      </div>
    </div>
    <el-dialog
      v-model="dialogState.visible"
      :title="dialogState.title"
      :width="isMobile ? '80%' : '40%'"
    >
      <el-row align="middle" class="mb-5">
        <el-col :span="5">{{ $t('机器人分类') }}</el-col>
        <el-col :span="19">
          <el-select v-model="opDomain.category" :placeholder="$t(`请选择机器人分类`)">
            <el-option
              v-for="item in DomainCategoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-col>
      </el-row>
      <template #footer>
        <div class="flex justify-end items-center gap-3">
          <el-button @click="onClose">{{ $t('取消') }}</el-button>
          <el-button type="primary" @click="onSync" :loading="syncSubmiting">{{
            $t(' 确认 ')
          }}</el-button>
        </div>
      </template>
    </el-dialog>
  </ContentLayout>
</template>
<script lang="ts" setup>
import { cloneDomainRobot, updateDomainInResource } from '@/api/domain'
import { deletesDomain } from '@/api/user'
import Topbar from '@/components/Topbar/index.vue'
import { useBasicLayout } from '@/composables/useBasicLayout'
import useSpaceRights from '@/composables/useSpaceRights'
import { DomainCategoryOptions } from '@/constant/domain'
import { ESpaceRightsType } from '@/enum/space'
import type { IDomainInfo } from '@/interface/domain'
import ContentLayout from '@/layout/ContentLayout.vue'
import { RoutesMap } from '@/router'
import { useChatStore } from '@/stores/chat'
import { useDomainStore } from '@/stores/domain'
import type { Action } from 'element-plus'
import { ElLoading, ElMessage, ElMessageBox, ElNotification, ElSelect } from 'element-plus'
import { storeToRefs } from 'pinia'
import { reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import BotListCard from './components/BotListCard.vue'

const { t } = useI18n()
const router = useRouter()
const chatStoreI = useChatStore()
const domainStoreI = useDomainStore()
const loading = ref()
const initing = ref(false)
const dialogState = reactive({
  visible: false,
  title: '',
  action: '',
  type: ''
})
const { domainList } = storeToRefs(domainStoreI)
const { checkRightsTypeNeedUpgrade } = useSpaceRights()
const { isMobile } = useBasicLayout()

const onNew = async () => {
  const needUpgrade = await checkRightsTypeNeedUpgrade(ESpaceRightsType.bot)
  if (needUpgrade) {
    return
  }
  router.push({ name: RoutesMap.manager.create })
}

const onRefresh = async () => {
  try {
    initing.value = true
    await domainStoreI.initDomainList()
    await chatStoreI.initChatList()
  } catch (err) {
  } finally {
    initing.value = false
  }
}

const onDelete = async (item: IDomainInfo) => {
  try {
    const confirmMessage = t(
      '确定要删除您的聊天机器人吗？删除同时废止链接、嵌入代码、API 接口，此操作无法撤消。'
    )

    await ElMessageBox.confirm(confirmMessage, t('确认删除'), {
      confirmButtonText: t('确认'),
      cancelButtonText: t('取消'),
      type: 'warning'
    })

    loading.value = ElLoading.service({
      lock: true,
      text: t('删除中...'),
      background: 'rgba(0, 0, 0, 0.7)'
    })
    await deletesDomain(item.id)
    ElNotification.success(t('删除成功'))
    await onRefresh()
  } catch (err) {
  } finally {
    loading.value.close()
  }
}

const opDomain = ref<Partial<IDomainInfo>>({})

const onOpenSync = async (bot: IDomainInfo, type: 'visible' | 'template') => {
  opDomain.value = { ...bot }

  let actionType = type === 'visible' ? t('可见') : t('不可见')
  if (type === 'template') {
    actionType = bot.template ? t('资源广场机器人') : t('模板机器人')
  }

  dialogState.title = t('设置为{actionType}', { actionType: actionType })
  dialogState.type = type
  dialogState.visible = true
}

const syncSubmiting = ref(false)

const onSync = async () => {
  try {
    const saveValue = Number(
      !(dialogState.type === 'visible' ? opDomain.value.visible : opDomain.value.template)
    )

    syncSubmiting.value = true
    await updateDomainInResource(opDomain.value.id, {
      visible: dialogState.type === 'visible' ? saveValue : opDomain.value.visible,
      template: dialogState.type === 'template' ? saveValue : opDomain.value.template,
      category: opDomain.value.category
    })
    dialogState.visible = false
    ElNotification.success(t('操作成功'))
    await onRefresh()
  } catch (err) {
  } finally {
    syncSubmiting.value = false
  }
}

const onClose = () => {
  dialogState.visible = false
  opDomain.value = {}
}

const cloneDomainRobotSubmit = async (slug: string, is_need_document: 0 | 1, name: string) => {
  loading.value = ElLoading.service({
    lock: true,
    text: t('克隆中...'),
    background: 'rgba(0, 0, 0, 0.7)'
  })
  try {
    await cloneDomainRobot(slug, { is_need_document })
    ElMessage.success(t('克隆成功，{name}已创建成功', { name: name }))
    await onRefresh()
  } catch (e) {
  } finally {
    loading.value.close()
  }
}

const cloneRobotSubmit = (slug: string, robotName: string, is_need_document: 0 | 1) => {
  ElMessageBox.confirm(
    t('复制并新建{robotName}，新建后{slot1}包含知识库', {
      robotName: robotName,
      slot1: is_need_document === 0 ? t('不') : ''
    }),
    t('克隆机器人'),

    {
      confirmButtonText: t('确认'),
      cancelButtonText: t('取消'),
      type: 'warning'
    }
  )
    .then(() => {
      cloneDomainRobotSubmit(slug, is_need_document, robotName)
    })
    .catch(() => {})
}

const cloneRobot = async (id: string, name: string) => {
  ElMessageBox.confirm(t('复制并新建此机器人，是否需要包含知识库？'), t('克隆机器人'), {
    confirmButtonText: t('包含'),
    cancelButtonText: t('不包含'),
    distinguishCancelAndClose: true,
    type: 'warning'
  })
    .then(() => {
      cloneRobotSubmit(id, name, 1)
    })
    .catch((action: Action) => {
      action === 'cancel' ? cloneRobotSubmit(id, name, 0) : ''
    })
}

watch(
  domainList,
  (d) => {
    if (!d.length) {
      router.push({ name: RoutesMap.manager.create })
    }
  },
  { immediate: true }
)
</script>
