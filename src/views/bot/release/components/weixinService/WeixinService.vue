<template>
  <Modal
    width="45%"
    mobile-width="100%"
    v-model:visible="visible"
    :title="$t(`配置微信客服`)"
    :footer="false"
    class="official-account-container"
  >
    <div v-loading="loading" class="cursor-pointer">
      <WeixinInput
        v-if="index === 1"
        :placeholder="$t(`请填写开发者ID`)"
        :labelName="$t(`企业ID`)"
        :btnText="$t(`确认，并下一步`)"
        :url="weixinServiceImg1"
        @handleCancle="handleCancle"
        @handleBtn="(info) => handleBtn(2, info)"
        @changesketchDialogVisible="changesketchDialogVisible"
      >
        <p>
          {{ $t('第一步： 进入微信')
          }}<a
            href="https://kf.weixin.qq.com/kf/frame#/corpinfo"
            target="_blank"
            class="text-[#2AC74A]"
            >{{ $t('「微信客服后台」') }}</a
          >{{ $t('，复制“企业ID”信息') }}
        </p>
        <p class="text-[#9DA3AF] text-[12px] my-[12px]">
          {{ $t('将企业ID信息，粘贴在下方输入框') }}
        </p>
      </WeixinInput>
      <WeixinText
        v-if="index === 2 && $notnull(config)"
        :index="index"
        @handleCopy="(e: string) => emit('handleCopy', e)"
        :list="config"
      >
        <template v-slot:top>
          <p class="text-[#303133]">
            {{ $t('第二步：复制以下信息，并填入微信后台') }}
          </p>
          <p class="my-[12px] text-[12px] text-[#9DA3AF">
            {{ $t('路径：开发配置—点击“开始使用”—填写信息—点击“完成”') }}
          </p>
          <p class="mb-[12px] text-[#7C5CFC]" @click="changesketchDialogVisible(weixinServiceImg2)">
            {{ $t('查看示意图') }}
          </p>
        </template>
        <template v-slot:bottom>
          <WeixinBtn
            :disabled="false"
            :btnText="$t(`确认，并下一步`)"
            @handleCopy="(e: string) => emit('handleCopy', e)"
            @handleCancle="handleCancle"
            @handleBtn="() => handleBtn(3)"
          />
        </template>
      </WeixinText>
      <WeixinInput
        v-if="index === 3"
        :placeholder="$t(`请填写开发者Secret`)"
        labelName="Secret"
        :btnText="$t(`确认`)"
        :url="weixinServiceImg3"
        @handleCancle="handleCancle"
        @handleBtn="(info) => handleBtn(4, info)"
        @changesketchDialogVisible="changesketchDialogVisible"
      >
        <p class="mb-[12px]">
          {{ $t('第三步：复制Secret信息，并填入下面输入框') }}
        </p>
      </WeixinInput>
      <WeixinText
        v-if="index === 4 && $notnull(config)"
        :list="config"
        @handleCopy="(e: string) => emit('handleCopy', e)"
      >
        <template v-slot:top>
          <p class="mb-[16px]">
            <el-switch
              @change="handleChange"
              v-model="showWeixin"
              size="large"
              :active-text="$t(`开启`)"
              :inactive-text="$t(`关闭`)"
            />
          </p>
          <p class="text-[#303133] mb-[12px]">{{ $t('服务器配置') }}</p>
        </template>
        <template v-slot:bottom>
          <p class="text-[#7C5CFC]" @click="() => handleBtn(1)">
            {{ $t('重新配置') }}
          </p>
        </template>
      </WeixinText>
    </div>
    <SketchDialog v-model:value="sketchDialogVisible" :url="previewUrl" />
  </Modal>
</template>
<script lang="ts" setup>
import {
  getChannelType,
  patchChannelType,
  patchWeixinConfig,
  postWeixinConfig
} from '@/api/release'
import Modal from '@/components/Modal/index.vue'
import useImagePath from '@/composables/useImagePath'
import { AfficialAccountStatusType, EChannelType } from '@/enum/release'
import type { weixinConfigType } from '@/interface/release'
import { $notnull } from '@/utils/help'
import { computed, ref, watch } from 'vue'
import SketchDialog from '../SketchDialog.vue'
import WeixinBtn from './components/WeixinBtn.vue'
import WeixinInput from './components/WeixinInput.vue'
import WeixinText from './components/WeixinText.vue'

const { ImagePath: weixinServiceImg1 } = useImagePath('weixin-service-1', 'release')
const { ImagePath: weixinServiceImg2 } = useImagePath('weixin-service-2', 'release')
const { ImagePath: weixinServiceImg3 } = useImagePath('weixin-service-3', 'release')
const props = defineProps<{
  value: boolean
  domain_slug: string
}>()
const emit = defineEmits(['update:value', 'handleCopy'])
const visible = computed({
  get: () => props.value,
  set: (val) => emit('update:value', val)
})
const loading = ref(false)
const index = ref<number>(1)
const config = ref<any>({})
const showWeixin = ref<boolean>(false)
const sketchDialogVisible = ref<boolean>(false)
const previewUrl = ref<string>('')

const handleCancle = () => {
  index.value = 1
  emit('update:value', false)
}

const handleBtn = async (n: number, e: { input: '' } = { input: '' }) => {
  let result = true
  if (n === 2) {
    result = await submitAppId(postWeixinConfig, e.input)
  }
  if (n === 4) {
    result = await submitAppId(patchWeixinConfig, {
      app_id: config.value.app_id,
      app_secret: e.input
    })
  }
  result ? (index.value = n) : ''
}

const submitAppId = async (
  call: (domain_slug: string, e: weixinConfigType | string) => Promise<any>,
  e: weixinConfigType | string
) => {
  try {
    loading.value = true
    const {
      data: { data }
    } = await call(props.domain_slug, e)
    config.value = { ...config.value, ...data }
    return true
  } catch (e) {
    return false
  } finally {
    loading.value = false
  }
}

const handleChange = async () => {
  const patchData = {
    app_id: config.value.app_id,
    app_secret: config.value.app_secret,
    s_status: showWeixin.value
      ? AfficialAccountStatusType.normal
      : AfficialAccountStatusType.disabled
  }
  try {
    const {
      data: { data }
    } = await patchChannelType(EChannelType.WECHAT_KF, props.domain_slug, patchData)
    config.value = data
  } catch (e) {}
}

const changesketchDialogVisible = (url: string) => {
  previewUrl.value = url
  sketchDialogVisible.value = true
}

const init = async () => {
  try {
    loading.value = true
    const {
      data: { data }
    } = await getChannelType(EChannelType.WECHAT_KF, props.domain_slug)
    config.value = data || {}
  } catch (e) {
  } finally {
    loading.value = false
  }
}

watch(config, (v) => {
  $notnull(config.value.app_secret) ? (index.value = 4) : ''
  showWeixin.value = config.value.s_status === AfficialAccountStatusType.normal ? true : false
})

watch(
  () => props.value,
  (v) => {
    if (v && $notnull(config)) {
      init()
    }
  }
)
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
