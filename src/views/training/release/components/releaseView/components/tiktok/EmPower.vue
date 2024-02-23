<template>
  <Modal
    width="45%"
    mobile-width="100%"
    v-model:visible="internalVisible"
    :title="$t(`抖音授权`)"
    :footer="false"
    class="text-[12px]"
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
      <div v-show="tiktokStatus">
        <p class="text-sm mb-2 font-medium text-[#303133]">{{ $t('抖音配置') }}</p>
        <div class="space-x-3 mb-3">
          <span class="inline-flex items-center gap-2">
            {{ $t('回复私信') }}
            <SwitchWithStateMsg
              :value="tiktokStatus?.additions?.douyin_im_receive_msg_switch"
              msg-position="right"
              open-msg="开启"
              close-msg="关闭"
              @change="(v) => onChangeTiktokAdditions('douyin_im_receive_msg_switch', v)"
            />
          </span>
          <span class="inline-flex items-center gap-2">
            {{ $t('回复评论') }}
            <SwitchWithStateMsg
              :value="tiktokStatus?.additions?.douyin_item_comment_reply_switch"
              msg-position="right"
              open-msg="开启"
              close-msg="关闭"
              @change="(v) => onChangeTiktokAdditions('douyin_item_comment_reply_switch', v)"
            />
          </span>
        </div>
      </div>
      <p
        class="text-[#EA0000] mb-[16px]"
        v-if="tiktokStatus?.s_status === EAfficialAccountStatusType.deleted"
      >
        {{ $t('授权超过时间，已失效') }}
      </p>
      <p class="text-[#EA0000] mb-[16px]">
        {{ $t('该功能仅开放给认证过的品牌号/企业号，包括其员工号扫码授权，未认证的人员不可使用') }}
      </p>
      <div class="leading-7 text-[#596780]">
        <p class="text-[14px] font-medium text-[#303133]">
          {{ $t('授权须知：') }}
        </p>
        <p>{{ $t('1.单次扫码最长支持6个月，失效后请再次扫码绑定') }}</p>
        <p>{{ $t('2.禁止后再启用，需要再次扫码绑定') }}</p>
        <p>{{ $t('3.单个抖音账号仅支持一个机器人回复') }}</p>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import { getCommonGraph } from '@/api/graph'
import { getTitokServiceConfig } from '@/api/release'
import Modal from '@/components/Modal/index.vue'
import SwitchWithStateMsg from '@/components/SwitchWithStateMsg/index.vue'
import useGlobalProperties from '@/composables/useGlobalProperties'
import { ChannelStatusTiktok } from '@/constant/release'
import { EAfficialAccountStatusType, EChannelType } from '@/enum/release'
import { $notnull } from '@/utils/help'
import { ElLoading, ElMessage, ElNotification } from 'element-plus'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const emit = defineEmits(['update:value'])
const props = defineProps<{
  value: boolean
  domainSlug: string
}>()
const tiktokStatus = ref<{
  id: number
  s_status: string
  additions: {
    douyin_im_receive_msg_switch: boolean
    douyin_item_comment_reply_switch: boolean
  }
}>()
const tiktokServiceConfig = ref<string>('') // 抖音配置
const loading = ref(false)
const { postCommonGraph } = useGlobalProperties()
const internalVisible = computed({
  get: () => props.value,
  set: (v) => emit('update:value', v)
})

const onChangeTiktokAdditions = async (key: string, val: boolean) => {
  try {
    const params = {
      ...tiktokStatus.value.additions,
      [key]: Boolean(val)
    }
    await postCommonGraph(`mp_account/save`, {
      id: tiktokStatus.value.id,
      additions: {
        ...params
      }
    })
    tiktokStatus.value.additions[key] = val
    ElNotification.success(t('操作成功'))
  } catch (e) {}
}

// 授权状态
const initTiktokStatus = async () => {
  loading.value = true
  const res = await getCommonGraph<any>('mp_account', {
    filter: `type_def=="${EChannelType.DOUYIN}" and domain_slug=="${props.domainSlug}"`
  })
  const list = res.data.data
  // getChannelType(EChannelType.DOUYIN, props.domainSlug)
  if ($notnull(list)) {
    tiktokStatus.value = list[0]
    if (!list[0].additions) {
      tiktokStatus.value.additions = {
        douyin_im_receive_msg_switch: true,
        douyin_item_comment_reply_switch: true
      }
    }
  }

  loading.value = false
}

// 获取抖音配置
const geTikTokConfig = async () => {
  const res = await getTitokServiceConfig(props.domainSlug)
  tiktokServiceConfig.value = res.data.data.url
}

// 授权
const handleEmpower = async (txt: string) => {
  if ([ChannelStatusTiktok[EAfficialAccountStatusType.disabled], t('立即授权')].includes(txt)) {
    return window.open(tiktokServiceConfig.value)
  } else {
    // 解除授权
    const loading = ElLoading.service({
      lock: true,
      text: t('解除授权中...'),
      background: 'rgba(0, 0, 0, 0.7)'
    })
    try {
      const resAccount = await getCommonGraph<any>('mp_account', {
        filter: `domain_slug=="${props.domainSlug}" and type_def=="${EChannelType.DOUYIN}" and s_status=="${EAfficialAccountStatusType.normal}"`
      })
      const account = resAccount.data.data

      if ($notnull(account)) {
        const res = await postCommonGraph<any>('mp_account/save', {
          id: account[0].id,
          s_status: EAfficialAccountStatusType.disabled
        })
        tiktokStatus.value = res.data.data || {}
        ElMessage.success(t('解除成功'))
      }

      // patchChannelType(EChannelType.DOUYIN, props.domainSlug, ∑∂ddddfr{
      //   s_status: EAfficialAccountStatusType.disabled
      // })
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
  if (tiktokStatus.value?.s_status) {
    return ChannelStatusTiktok[tiktokStatus.value.s_status]
  } else {
    return t('立即授权')
  }
})
</script>
