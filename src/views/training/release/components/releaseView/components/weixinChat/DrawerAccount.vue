<template>
  <el-drawer
    ref="account-drawer"
    v-model="visible"
    :title="$t(`查看账号`)"
    :before-close="handleClose"
    :size="isMobile ? '100%' : '40%'"
    v-loading="loading"
  >
    <el-collapse v-model="activeNames" accordion>
      <el-collapse-item v-for="(item, index) in accountList" :key="item.id" :name="index">
        <template #title>
          <p class="leading-5 break-all">{{ $t('自定义账号') }}：{{ item.additions.name }}</p>
        </template>
        <div class="account-detail">
          <p>
            {{ $t('头像') }}：
            <Avatar
              :avatar="item.additions.avatar"
              :size="32"
              :name="item.additions.name"
              class="w-[32px] h-[32px] rounded-full"
            />
          </p>
          <p>
            {{ $t('名称') }}： <span class="">{{ item.additions.name }}</span>
          </p>
          <p>
            {{ $t('组织') }}： <span class="text-[#596780]">{{ item.additions.company_name }}</span>
          </p>
          <!-- <p>
            {{ $t('单聊') }}： <span class="text-[#596780]">{{ item.people_cnt }}</span>
          </p>
          <p>
            {{ $t('群聊') }}： <span class="text-[#596780]">{{ formatGroups(item.groups) }}</span>
          </p> -->
          <p>
            {{ $t('名称') }}： <span class="text-[#596780]">{{ item.additions.name }}</span>
          </p>
          <p>
            {{ $t('状态') }}：
            <span class="text-[#596780]">{{ AccountStatusNew[item.status] }}</span>
          </p>
          <p>
            <span class="shrink-0">{{ $t('操作') }}：</span>
            <el-row justify="start" :gutter="20" class="w-full">
              <el-col :span="5">
                <el-button
                  class="!border-[#7C5CFC] !text-[#7C5CFC]"
                  @click="handleRestart(item.hosting_id)"
                >
                  {{ $t('重启') }}
                </el-button>
              </el-col>
              <el-col :span="5" v-if="item.status === 1">
                <el-button
                  class="!border-[#7C5CFC] !text-[#7C5CFC]"
                  @click="handleOffline(item.hosting_id)"
                >
                  {{ $t('下线') }}
                </el-button>
              </el-col>
            </el-row>
          </p>
          <p class="mt-2">
            注意：托管账号如果是新账号需要在托管成功的20-30分钟内，进行验证操作，否则会被微信强制下线
          </p>
          <p>
            <span class="shrink-0">{{ $t('新用户验证') }}：</span>
            <el-row justify="start" :gutter="20" class="w-full">
              <el-col :span="5">
                <el-button
                  class="!border-[#7C5CFC] !text-[#7C5CFC]"
                  @click="handleCheck(item.hosting_id)"
                >
                  {{ $t('验证') }}
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
import { getCommonGraph } from '@/api/graph'
import { postAccountOfflineAPI, postAccountRestartAPI, postCheckAPI } from '@/api/release'
import { useBasicLayout } from '@/composables/useBasicLayout'
import { AccountStatusNew } from '@/enum/release'
import type { IAccountList } from '@/interface/release'
import { ElLoading, ElMessageBox, ElNotification as Notification } from 'element-plus'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

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
        await postAccountOfflineAPI({ hosting_id: id })
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
        const res = await postAccountRestartAPI({ hosting_id: id })
        emit('handleRestartAccount', { ...res.data.data })
        visible.value = false
      } catch (e) {
      } finally {
        loading.close()
      }
    })
    .catch(() => {})
}

const handleCheck = async (id) => {
  const loading = ElLoading.service({
    lock: true,
    text: t('重启中...'),
    background: 'rgba(0, 0, 0, 0.7)'
  })
  try {
    const res = await postCheckAPI({ hosting_id: id })
    emit('handleRestartAccount', { ...res.data.data })
  } catch (error) {
    console.log(error)
  } finally {
    loading.close()
  }
}

const init = async () => {
  try {
    loading.value = true
    const res = await getCommonGraph<any>('hosting_account', {
      filter: `org_id=="${props.orgId}"`,
      size: 500
    })
    //  serachAccountListAPI(props.orgId)
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
