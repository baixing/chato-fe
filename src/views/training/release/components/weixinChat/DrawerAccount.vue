<template>
  <el-drawer
    ref="account-drawer"
    v-model="visible"
    :title="$t(`查看账号`)"
    :before-close="handleClose"
    class="serach-account-container"
    :size="isMobile ? '100%' : '40%'"
    v-loading="loading"
  >
    <el-collapse v-model="activeNames" accordion>
      <el-collapse-item v-for="(item, index) in accountList" :key="item.wx_user_id" :name="index">
        <template #title>
          <p class="leading-5 break-all">{{ $t('自定义账号') }}：{{ item.name }}</p>
        </template>
        <div class="account-detail">
          <p>
            {{ $t('头像') }}：
            <img :src="item.avatar" class="w-[32px] h-[32px] rounded-full" alt="" />
          </p>
          <p>
            {{ $t('名称') }}： <span class="">{{ item.name }}</span>
          </p>
          <p>
            {{ $t('组织') }}： <span class="text-[#596780]">{{ item.corp_name }}</span>
          </p>
          <p>
            {{ $t('单聊') }}： <span class="text-[#596780]">{{ item.people_cnt }}</span>
          </p>
          <p>
            {{ $t('群聊') }}： <span class="text-[#596780]">{{ formatGroups(item.groups) }}</span>
          </p>
          <p>
            {{ $t('名称') }}： <span class="text-[#596780]">{{ item.name }}</span>
          </p>
          <p>
            {{ $t('状态') }}： <span class="text-[#596780]">{{ item.status }}</span>
          </p>
          <p>
            <span class="shrink-0">{{ $t('操作') }}：</span>
            <el-row justify="start" :gutter="20" class="w-full">
              <el-col :span="5">
                <el-button
                  class="!border-[#7C5CFC] !text-[#7C5CFC]"
                  @click="handleRestart(item.wx_user_id)"
                >
                  {{ $t('重启') }}
                </el-button>
              </el-col>
              <el-col :span="5" v-if="item.status === EAccountStatus.online">
                <el-button
                  class="!border-[#7C5CFC] !text-[#7C5CFC]"
                  @click="handleOffline(item.wx_user_id)"
                >
                  {{ $t('下线') }}
                </el-button>
              </el-col>
            </el-row>
          </p>
        </div>
      </el-collapse-item>
    </el-collapse>
  </el-drawer>
</template>
<script lang="ts" setup>
import { useBasicLayout } from '@/composables/useBasicLayout'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessageBox, ElLoading, ElNotification as Notification } from 'element-plus'
import { serachAccountListAPI, postAccountRestartAPI, postAccountOfflineAPI } from '@/api/release'
import type { IAccountList } from '@/interface/release'
import { EAccountStatus } from '@/enum/release'

const props = defineProps<{
  value: boolean
  orgId: number
}>()
const emit = defineEmits(['update:value', 'handleRestartAccount'])
const { t } = useI18n()
const { isMobile } = useBasicLayout()
const activeNames = ref([])
const loading = ref<boolean>(false)
const accountList = ref<IAccountList[]>([])
const visible = computed({
  get: () => props.value,
  set: (val) => emit('update:value', val)
})

const handleClose = () => {
  visible.value = false
  activeNames.value = []
}

const formatGroups = (list: string[]) => {
  return list.filter((item) => item !== '').join('；')
}

const handleOffline = (id: string) => {
  ElMessageBox.confirm(
    t('是否确认下线该账号？下线后将停止服务该账号下的群聊和单聊'),
    t('确认下线'),
    {
      confirmButtonText: t('确认'),
      cancelButtonText: t('取消'),
      customStyle: {
        '--el-messagebox-content-font-size': '12px'
      }
    }
  )
    .then(async () => {
      const loading = ElLoading.service({
        lock: true,
        text: t('下线中...'),
        background: 'rgba(0, 0, 0, 0.7)'
      })
      try {
        await postAccountOfflineAPI({ wx_host_user_id: id })
        Notification.success('下线成功')
        init()
      } catch (e) {
      } finally {
        loading.close()
      }
    })
    .catch(() => {})
}

const handleRestart = (id: string) => {
  ElMessageBox.confirm(
    t(
      '是否重启该账号？请使用已创建的账号去重启，重启后即可在线服务。<br> 勿使用新账号重启，新账号重启相当于新建账号，已创建的单聊/群聊会失效。'
    ),
    t('确认重启'),
    {
      confirmButtonText: t('确认'),
      cancelButtonText: t('取消'),
      customStyle: {
        '--el-messagebox-content-font-size': '12px',
        '--el-messagebox-width': '461px'
      },
      dangerouslyUseHTMLString: true
    }
  )
    .then(async () => {
      const loading = ElLoading.service({
        lock: true,
        text: t('重启中...'),
        background: 'rgba(0, 0, 0, 0.7)'
      })
      try {
        const res = await postAccountRestartAPI({ wx_host_user_id: id })
        emit('handleRestartAccount', { ...res.data.data, wx_user_id: id })
        visible.value = false
      } catch (e) {
      } finally {
        loading.close()
      }
    })
    .catch(() => {})
}

const init = async () => {
  try {
    loading.value = true
    const res = await serachAccountListAPI(props.orgId)
    accountList.value = res.data.data
  } catch (error) {
  } finally {
    loading.value = true
  }
}

watch(
  () => props.value,
  (v) => {
    v && init()
  }
)
</script>

<style lang="scss">
.serach-account-container {
  .el-drawer__header {
    @apply mb-5 text-[#303133] font-medium;
  }
  .el-drawer__body {
    @apply pt-0;
  }
  .el-collapse {
    @apply border-t-0;
  }
  .el-form-item__label {
    @apply text-sm text-[#303133];
  }
}
</style>

<style scoped lang="scss">
.account-detail {
  p {
    @apply flex items-center justify-start mb-3 text-sm text-[#303133];
    .content {
      @apply text-[#596780];
    }
  }
}
</style>
