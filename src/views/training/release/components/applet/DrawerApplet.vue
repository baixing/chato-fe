<template>
  <el-drawer
    ref="applet-drawer"
    v-model="visible"
    :title="$t(`查看小程序`)"
    :size="isMobile ? '100%' : '40%'"
    :before-close="handleClose"
    v-loading="loading"
  >
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
            appletAuthRes.status === EAppletExamineStatus.examining
              ? 'text-[#EA0000]'
              : 'theme-color'
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
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElMessageBox } from 'element-plus'
import { postMiniAppAuthStatusAPI } from '@/api/release'
import type { IAppletAuthRes } from '@/interface/release'
import useSpaceRights from '@/composables/useSpaceRights'
import { ESpaceRightsType } from '@/enum/space'
import { $notnull } from '@/utils/help'
import { useBasicLayout } from '@/composables/useBasicLayout'
import { useI18n } from 'vue-i18n'
import { EAppletExamineStatus } from '@/enum/release'

const props = defineProps<{
  value: boolean
  domainId: number
}>()
const emit = defineEmits(['update:value', 'handleRetry'])

const { t } = useI18n()
const { isMobile } = useBasicLayout()
const { checkRightsTypeNeedUpgrade } = useSpaceRights()
const visible = computed({
  get: () => props.value,
  set: (val) => emit('update:value', val)
})
const loading = ref(false)
const appletAuthRes = ref<IAppletAuthRes>(null)

const handleClose = () => {
  visible.value = false
}

const handleRetry = () => {
  ElMessageBox.confirm(t('重新授权前请先到微信小程序管理后台解除授权？'), t('温馨提示'), {
    confirmButtonText: t('已解除'),
    cancelButtonText: t('取消')
  })
    .then(async () => {
      handleClose()
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

watch(visible, (v) => {
  v && init()
})
</script>
