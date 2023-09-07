<template>
  <Modal
    width="45%"
    mobile-width="100%"
    v-model:visible="internalVisible"
    :title="$t(`抖音授权`)"
    :footer="false"
    class="official-account-container text-[12px]"
  >
    <div class="w-full" v-loading="loading">
      <p class="text-[14px]">{{ $t('请前往「抖音」扫码授权') }}</p>
      <div class="my-[16px] flex justify-start items-center">
        <el-button type="primary" size="large" @click="handleEmpower(btnText)">{{
          btnText
        }}</el-button>
        <span class="ml-[12px] text-[#9DA3AF] text-[12px]">{{ $t(' 如授权状态未更新，请') }}</span>
        <el-button @click="initTiktokStatus" type="primary" link class="!text-[12px]">{{
          $t('刷新')
        }}</el-button>
      </div>
      <p
        class="text-[#EA0000] mb-[16px]"
        v-if="tiktokStatus?.s_status === AfficialAccountStatusType.deleted"
      >
        {{ $t('授权超过时间，已失效') }}
      </p>
      <div class="leading-7 text-[#596780]">
        <p class="text-[14px] font-medium text-[#303133]">
          {{ $t('授权须知：') }}
        </p>
        <p>
          {{
            $t('1.该功能仅开放给认证过的品牌号/企业号，包括其员工号扫码授权，未认证的人员不可使用')
          }}
        </p>
        <p>{{ $t('2.单次扫码最长支持6个月，失效后请再次扫码绑定') }}</p>
        <p>{{ $t('3.禁止后再启用，需要再次扫码绑定') }}</p>
        <p>{{ $t('4.单个抖音账号仅支持一个机器人回复') }}</p>
      </div>
    </div>
  </Modal>
</template>
<script lang="ts" setup>
import { getChannelType, getTitokServiceConfig, patchChannelType } from '@/api/release'
import Modal from '@/components/Modal/index.vue'
import { ChannelStatusTiktok } from '@/constant/release'
import { AfficialAccountStatusType, EChannelType } from '@/enum/release'
import { ElLoading, ElMessage } from 'element-plus'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const emit = defineEmits(['update:value'])
const props = defineProps<{
  value: boolean
  domain_slug: string
}>()
const tiktokStatus = ref({ s_status: '' })
const tiktokServiceConfig = ref<string>('') // 抖音配置
const loading = ref(false)

const internalVisible = computed({
  get: () => props.value,
  set: (v) => emit('update:value', v)
})

// 授权状态
const initTiktokStatus = async () => {
  loading.value = true
  const res = await getChannelType(EChannelType.DOUYIN, props.domain_slug)
  tiktokStatus.value = res.data.data || {}
  loading.value = false
}

// 获取抖音配置
const geTikTokConfig = async () => {
  const res = await getTitokServiceConfig(props.domain_slug)
  tiktokServiceConfig.value = res.data.data.url
}

// 授权
const handleEmpower = async (txt: string) => {
  if ([ChannelStatusTiktok[AfficialAccountStatusType.disabled], t('立即授权')].includes(txt)) {
    return window.open(tiktokServiceConfig.value)
  } else {
    // 解除授权
    const loading = ElLoading.service({
      lock: true,
      text: t('解除授权中...'),
      background: 'rgba(0, 0, 0, 0.7)'
    })
    try {
      const res = await patchChannelType(EChannelType.DOUYIN, props.domain_slug, {
        s_status: AfficialAccountStatusType.disabled
      })
      tiktokStatus.value = res.data.data || {}
      ElMessage.success(t('解除成功'))
    } catch (e) {
      ElMessage.error(t('解除失败'))
    } finally {
      loading.close()
    }
  }
}

watch(
  () => props.value,
  async (v) => {
    if (v) {
      try {
        loading.value = true
        !tiktokServiceConfig.value && (await geTikTokConfig())
        await initTiktokStatus()
      } catch (e) {
      } finally {
        loading.value = false
      }
    }
  }
)

const btnText = computed(() => {
  if (tiktokStatus.value.s_status) {
    return ChannelStatusTiktok[tiktokStatus.value.s_status]
  } else {
    return t('立即授权')
  }
})
</script>
<style lang="scss" scoped>
.official-account-container {
  .el-dialog__header {
    margin-right: 0;
  }
  .el-dialog__body {
    padding-top: 0;
    padding-bottom: 24px;
  }
}
</style>
