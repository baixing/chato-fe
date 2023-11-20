<template>
  <div
    class="text-[#303133] text-sm text-left leading-6 pt-4 mb-4"
    style="border-top: 1px solid #ebeef5"
    v-if="$notnull(appletAuthRes)"
  >
    <p class="font-medium mb-4">{{ $t('基础信息') }}</p>
    <p>
      {{ $t('小程序名称') }}：<span class="text-[#596780]">{{ appletAuthRes.name }}</span>
    </p>
    <p>
      {{ $t('APP ID') }}：<span class="text-[#596780]">{{ appletAuthRes.app_id }}</span>
    </p>
    <p>
      {{ $t('状态') }}：<span
        :class="
          appletAuthRes.status === EAppletExamineStatus.examining ? 'text-[#EA0000]' : 'theme-color'
        "
        >{{ appletAuthRes.status }}</span
      >
    </p>
    <p
      v-if="appletAuthRes.status === EAppletExamineStatus.release"
      class="flex justify-start items-center"
    >
      {{ $t('小程序码') }}：
      <img :src="appletAuthRes.qr_code" class="w-[150px] h-[150px]" />
    </p>
    <p v-if="appletAuthRes.error_msg">
      {{ $t('原因') }}： <span class="text-[#EA0000]">{{ appletAuthRes.error_msg }}</span>
    </p>
    <p class="flex justify-start items-center text-[#9DA3AF] text-xs mt-2">
      {{ $t('如果对审核状态有疑问？可以联系') }}
      <el-button type="primary" link @click="onContactUs">{{ $t('产品顾问') }}</el-button>
    </p>

    <el-row justify="end" v-if="appletAuthRes.error_msg">
      <el-col :lg="6" :xl="6" :sm="12" :xs="12" :md="12">
        <el-button size="large" type="primary" @click="handleRetry">
          {{ $t('重新授权') }}
        </el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { postMiniAppAuthStatusAPI } from '@/api/release'
import useSpaceRights from '@/composables/useSpaceRights'
import { EAppletExamineStatus } from '@/enum/release'
import { ESpaceRightsType } from '@/enum/space'
import type { IAppletAuthRes } from '@/interface/release'
import { $notnull } from '@/utils/help'
import { ElMessageBox } from 'element-plus'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  value: boolean
  domainId: number | string
}>()
const emit = defineEmits(['handleRetry'])

const { t } = useI18n()
const { checkRightsTypeNeedUpgrade } = useSpaceRights()

const loading = ref(false)
const appletAuthRes = ref<IAppletAuthRes>(null)
const timer = ref(null)

const handleRetry = () => {
  ElMessageBox.confirm(t('重新授权前请先到微信小程序管理后台解除授权？'), t('温馨提示'), {
    confirmButtonText: t('已解除'),
    cancelButtonText: t('取消')
  })
    .then(async () => {
      emit('handleRetry')
    })
    .catch(() => {})
}

const onContactUs = () => {
  checkRightsTypeNeedUpgrade(ESpaceRightsType.weixinAccount)
}

const init = async () => {
  try {
    loading.value = true
    const res = await postMiniAppAuthStatusAPI({ domain_id: props.domainId })
    appletAuthRes.value = res.data.data
  } catch (error) {
  } finally {
    loading.value = false
  }
}

watch(appletAuthRes, (v) => {
  if (!$notnull(v)) return

  const { status } = appletAuthRes.value

  if (status !== EAppletExamineStatus.release) {
    if (!timer.value) {
      timer.value = setInterval(init, 5000)
    }
  } else {
    clearInterval(timer.value)
    timer.value = null
  }
})

watch(
  () => props.value,
  (v) => {
    v && init()
  }
)
</script>
