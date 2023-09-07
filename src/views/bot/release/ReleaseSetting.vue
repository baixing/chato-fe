<template>
  <div v-loading="initing">
    <FLTitle class="!mb-5">
      <p class="flex items-center gap-[6px]">
        {{ $t('用量限制')
        }}<el-tooltip placement="right">
          <template #content>
            <p class="lg:max-w-[214px]">
              {{
                $t(
                  '限制将作用于外部用户，同一设备同一浏览器访问时识别为一名用户，成员在后台训练时的对话量不在限制范围内；超出后的回复不计入电力值。'
                )
              }}
            </p>
          </template>
          <svg-icon name="question-circle" svg-class="text-[#596780] w-4 h-4 cursor-pointer" />
        </el-tooltip>
      </p>
    </FLTitle>
    <div class="flex gap-5 lg:flex-col mb-7">
      <div class="border border-solid border-[#E4E7ED] rounded-lg flex-1">
        <div
          class="flex px-6 py-4 justify-between items-center text-sm left-5 font-medium"
          style="border-bottom: 1px solid #e4e7ed"
        >
          <span class="text-[#3D3D3D]">{{ $t('按使用频率') }}</span>
          <SwitchWithStateMsg
            v-model:value="customerLimitState.rate_limit_switch"
            size="small"
            :openMsg="$t(`打开`)"
            :closeMsg="$t(`关闭`)"
            msg-position="left"
          />
        </div>
        <div class="p-6 text-[#3D3D3D] text-sm leading-4">
          <div class="flex gap-2 items-center mb-8 flex-wrap">
            {{ $t('每隔')
            }}<el-input-number
              :min="1"
              :max="60"
              v-model="customerLimitState.rate_limit.time_seconds"
              controls-position="right"
              class="!w-20"
            />{{ $t('秒，只能发送')
            }}<el-input-number
              :min="1"
              :max="9999"
              v-model="customerLimitState.rate_limit.num"
              controls-position="right"
              class="!w-20"
            />{{ $t('条') }}
          </div>
          <p class="text-[#596780] mb-4">{{ $t('超出默认将回复') }}</p>
          <el-input type="text" v-model="customerLimitState.rate_limit.response" />
        </div>
      </div>
      <div class="border border-solid border-[#E4E7ED] rounded-lg flex-1">
        <div
          class="flex px-6 py-4 justify-between items-center text-sm left-5 font-medium"
          style="border-bottom: 1px solid #e4e7ed"
        >
          <span class="text-[#3D3D3D]">{{ $t('按使用量') }}</span>
          <SwitchWithStateMsg
            v-model:value="customerLimitState.quota_limit_switch"
            size="small"
            :openMsg="$t(`打开`)"
            :closeMsg="$t(`关闭`)"
            msg-position="left"
          />
        </div>
        <div class="p-6 text-[#3D3D3D] text-sm leading-4">
          <div class="flex gap-2 items-center mb-8">
            {{ $t('每个用户总共可回复')
            }}<el-input-number
              :min="1"
              :max="9999"
              v-model="customerLimitState.quota_limit.total"
              controls-position="right"
              class="!w-20"
            />{{ $t('条') }}
          </div>
          <p class="text-[#596780] mb-4">{{ $t('超出默认将回复') }}</p>
          <el-input type="text" v-model="customerLimitState.quota_limit.response" />
        </div>
      </div>
    </div>
    <div class="relative mb-14">
      <FLTitle class="!mb-5">
        <p class="flex items-center gap-[6px]">
          {{ $t('对话广告')
          }}<el-tooltip placement="right">
            <template #content>
              <p class="lg:max-w-[214px]">
                {{ $t('广告将按照以下频率和文案展示给用户；广告不计入电力值。') }}
              </p>
            </template>
            <svg-icon name="question-circle" svg-class="text-[#596780] w-4 h-4 cursor-pointer" />
          </el-tooltip>
        </p>
      </FLTitle>
      <div class="flex justify-between items-center gap-5 mb-6">
        <div class="text-sm text-[#3D3D3D] font-normal leading-4 flex items-center gap-3">
          {{ $t('每个用户每隔')
          }}<el-input-number
            v-model="settingState.domain.ad_frequency"
            :min="1"
            controls-position="right"
            class="!w-20 mx-2"
          />{{ $t('条，展示一次广告') }}
          <el-button
            size="small"
            type="primary"
            link
            @click="onShowExample(EReleaseSettingExampleType.ad)"
          >
            {{ $t('查看示例') }}
          </el-button>
        </div>
        <SwitchWithStateMsg
          v-model:value="settingState.show.ad_show"
          :close-msg="$t(`关闭`)"
          :open-msg="$t(`开启`)"
          msg-position="left"
          size="small"
        />
      </div>
      <div v-show="settingState.show.ad_show">
        <HansInputLimit
          v-model:value="settingState.domain.ad_content"
          type="textarea"
          :rows="3"
          :limit="HansLimit.adText"
          class="w-full mb-4"
        />
        <CollectFormConfig ref="collectFormConfigRef" />
      </div>
      <SpaceRightsMask :visible="maskVisible" :rightsType="ESpaceRightsType.brand" />
    </div>
    <FLTitle class="!mb-5">
      <p class="flex items-center gap-[6px]">
        {{ $t('文档来源')
        }}<el-tooltip placement="right">
          <template #content>
            <p class="lg:max-w-[214px]">
              {{ $t('关闭时仅在后台训练中可查看来源文档，打开后所有人在与机器人对话时都可查看') }}
            </p>
          </template>
          <svg-icon name="question-circle" svg-class="text-[#596780] w-4 h-4 cursor-pointer" />
        </el-tooltip>
      </p>
    </FLTitle>
    <div class="flex items-center justify-between gap-3 mb-14 lg:flex-col lg:items-start">
      <div class="flex items-center gap-3 lg:flex-col lg:items-start">
        <p class="text-sm text-[#3D3D3D] leading-5">
          {{ $t('当回答引用了文档后，可查看回答对应的文档来源。') }}
        </p>

        <el-button
          size="small"
          type="primary"
          link
          @click="onShowExample(EReleaseSettingExampleType.doc)"
        >
          {{ $t('查看示例') }}
        </el-button>
      </div>
      <SwitchWithStateMsg
        v-model:value="settingState.show.question_ref_source_show"
        size="small"
        :openMsg="$t(`打开`)"
        :closeMsg="$t(`关闭`)"
        msg-position="left"
      />
    </div>
    <FLTitle class="!mb-5">
      <p class="flex items-center gap-[6px]">
        {{ $t('回答修正')
        }}<el-tooltip placement="right">
          <template #content>
            <p class="lg:max-w-[214px]">
              {{
                $t(
                  '关闭时仅在后台训练中可修正，打开后在分享链接页面，所有人在与机器人对话时都可修正'
                )
              }}
            </p>
          </template>
          <svg-icon name="question-circle" svg-class="text-[#596780] w-4 h-4 cursor-pointer" />
        </el-tooltip>
      </p>
    </FLTitle>
    <div class="flex items-center justify-between gap-3 mb-5 lg:flex-col lg:items-start">
      <div class="flex items-center gap-3 lg:flex-col lg:items-start">
        <p class="text-sm text-[#3D3D3D] leading-5">
          {{ $t('当你的用户对话时，提供可修正的功能。') }}
        </p>
        <el-button
          size="small"
          type="primary"
          link
          @click="onShowExample(EReleaseSettingExampleType.correct)"
        >
          {{ $t('查看示例') }}
        </el-button>
      </div>
      <SwitchWithStateMsg
        :value="settingState.show.qa_modifiable"
        :openMsg="$t(`开启`)"
        :closeMsg="$t(`关闭`)"
        msg-position="left"
        @change="onCorrectAnswerChange"
      />
    </div>
    <div
      v-show="correctState.visible"
      v-loading="correctState.loading"
      class="flex flex-col items-center gap-4 text-[#3D3D3D] text-sm leading-[22px]"
    >
      <p class="flex-1 truncate w-full text-[#9DA3AF]">
        {{ correctState.link }}
      </p>
      <p class="flex items-center justify-start gap-4 w-full">
        <el-button type="primary" plain @click="onCorrectClick" class="!bg-white !text-[#7C5CFC]">
          {{ correctState.expired ? $t('重新生成') : $t('复制分享连接') }}
        </el-button>
        <span v-if="correctState.expired" class="text-[#EA0000]">{{
          $t('链接已失效，原链接可正常访问但无法修正')
        }}</span>
        <span v-else class="text-[#596780]">
          <span class="text-[#7C5CFC]">{{ $t('7天') }}</span
          >{{ $t('后该链接的修正功能将失效') }}</span
        >
      </p>
    </div>

    <el-button type="primary" @click="onSave" size="large" class="mt-14">{{
      $t('保存设置')
    }}</el-button>
  </div>
  <ViewExampleImgDialog
    v-model:visible="exampleState.visible"
    :img="exampleState.img"
    :dialog-default-width="exampleState.width"
  />
</template>
<script lang="ts" setup>
import {
  checkDomainCorrectTicketIsExpired,
  generateDomainCorrectTicket,
  getDomainDetailV2,
  saveDomainV2
} from '@/api/domain'
import HansInputLimit from '@/components/Input/HansInputLimit.vue'
import SpaceRightsMask from '@/components/Space/SpaceRightsMask.vue'
import SwitchWithStateMsg from '@/components/SwitchWithStateMsg/index.vue'
import FLTitle from '@/components/Title/FLTitle.vue'
import useImagePath from '@/composables/useImagePath'
import { currentEnvConfig } from '@/config'
import { EReleaseSettingExampleType } from '@/enum/release'
import { ESpaceRightsType } from '@/enum/space'
import type { IDomainDetail } from '@/interface/domain'
import { useDomainStore } from '@/stores/domain'
import { useSpaceStore } from '@/stores/space'
import { $notnull, copyPaste } from '@/utils/help'
import { getStringWidth } from '@/utils/string'
import { ElLoading, ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import { storeToRefs } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import CollectFormConfig from './components/CollectFormConfig.vue'
import ViewExampleImgDialog from './components/ViewExampleImgDialog.vue'

const { ImagePath: CorrectAnswerImg } = useImagePath('correct-answer', 'example')
const { ImagePath: DocSourceImg } = useImagePath('doc-source', 'example')
const { ImagePath: AdImg } = useImagePath('ad', 'example', 'webp')
const { t } = useI18n()

type TDosageParams = {
  rate_limit_switch: boolean
  rate_limit: {
    time_seconds: number
    num: number
    response: string
  }

  quota_limit_switch: boolean
  quota_limit: {
    total: number
    response: string
  }
}

type TSettingParams = {
  show: {
    ad_show: boolean
    question_ref_source_show: boolean
    qa_modifiable: boolean
  }
  domain: {
    ad_frequency: number
    ad_content: string
  }
}

const HansLimit = {
  adText: 100
}

const initing = ref(false)
const loading = ref()
const collectFormConfigRef = ref()
const domainStoreI = useDomainStore()
const spaceStoreI = useSpaceStore()
const { domainInfo } = storeToRefs(domainStoreI)
const { currentRights } = storeToRefs(spaceStoreI)
const slug = computed(() => domainInfo.value.slug)

let customerLimitState = reactive<TDosageParams>({
  rate_limit_switch: false,
  rate_limit: {
    time_seconds: 60,
    num: 60,
    response: t('当前咨询用户过多，请排队等候')
  },

  quota_limit_switch: false,
  quota_limit: {
    total: 60,
    response: t('抱歉，您已经达到最大对话上限')
  }
})

const DefaultADFrequency = 30
const DefaultADContent = t(
  'Chato ——基于AI技术 轻松创建对话机器人，赶快来 Chato 创建一个属于自己的机器人吧'
)

let settingState = reactive<TSettingParams>({
  show: {
    ad_show: true,
    question_ref_source_show: false,
    qa_modifiable: false
  },
  domain: {
    ad_frequency: DefaultADFrequency,
    ad_content: DefaultADContent
  }
})

const maskVisible = computed(() => !currentRights.value.ad)

const beforeSaveCheck = () => {
  let msg = ''

  if (getStringWidth(settingState.domain.ad_content) > HansLimit.adText) {
    msg = t('广告文案不能超过 {slot1} 字符', { slot1: HansLimit.adText })
  }

  if (msg) {
    ElMessage.warning(msg)
    return false
  }

  return true
}

const exampleState = reactive({
  visible: false,
  img: '',
  width: ''
})

const onShowExample = (type: EReleaseSettingExampleType) => {
  exampleState.visible = true
  switch (type) {
    case EReleaseSettingExampleType.doc:
      exampleState.img = DocSourceImg.value
      break
    case EReleaseSettingExampleType.correct:
      exampleState.img = CorrectAnswerImg.value
      break
    case EReleaseSettingExampleType.ad:
      exampleState.img = AdImg.value
      exampleState.width = '60%'
      break
  }
}

const correctState = reactive({
  loading: false,
  visible: false,
  link: '',
  ticket: '',
  expired: false
})

const checkCorrectTicketExpired = async () => {
  const {
    data: { data }
  } = await checkDomainCorrectTicketIsExpired({
    ticket: correctState.ticket,
    slug: slug.value
  })
  return data
}

const initCorrect = async (needCheck = true) => {
  try {
    correctState.loading = true
    correctState.visible = true

    const {
      data: { data: ticketData }
    } = await generateDomainCorrectTicket(slug.value)
    correctState.ticket = ticketData
    correctState.link = `${currentEnvConfig.scriptURL}/b/${slug.value}?ticket=${ticketData}`

    if (needCheck) {
      const isExpired = await checkCorrectTicketExpired()
      correctState.expired = isExpired
    }
  } catch (e) {
  } finally {
    correctState.loading = false
  }
}

const onCorrectClick = async () => {
  if (correctState.expired) {
    await initCorrect(false)
    ElNotification.success(t('链接已重新生成'))
  } else {
    copyPaste(correctState.link)
  }
}

const onCorrectAnswerChange = async (val: boolean) => {
  try {
    let action = t('关闭')
    let msg = t('关闭后所有对话用户都不再可以修正对话，是否确认关闭？')
    if (val) {
      action = t('开启')
      msg = t('开启后所有用户都可以修正对话，其修正内容将参与到学习，是否确认开启？')
    }

    await ElMessageBox.confirm(msg, t('确认{action}', { action: action }), {
      confirmButtonText: t('确认'),
      cancelButtonText: t('取消'),
      type: 'warning'
    })

    settingState.show.qa_modifiable = val

    if (val) {
      await initCorrect()
    } else {
      correctState.visible = false
    }
  } catch (err) {}
}

const onSave = async () => {
  if (!beforeSaveCheck()) {
    return
  }

  try {
    loading.value = ElLoading.service({
      lock: true,
      text: t('保存中'),
      background: 'rgba(0, 0, 0, 0.7)'
    })
    // TODO: 推进后端接口改动，支持只传递要修改的字段，而不是全部的字段
    const saveParams = {
      ...domainDetailRes,
      customer_limit: customerLimitState,
      domain: { ...domainInfo.value, ...settingState.domain },
      show: { ...domainDetailRes.show, ...settingState.show }
    }

    await saveDomainV2(slug.value, saveParams)
    collectFormConfigRef.value?.onUpdateAbleAdForm()
    ElNotification.success(t('保存成功'))
  } catch (e) {
  } finally {
    loading.value.close()
  }
}

let domainDetailRes: IDomainDetail

const init = async () => {
  initing.value = true

  try {
    const res = await getDomainDetailV2(slug.value)
    domainDetailRes = res.data.data
    const { show, customer_limit, domain } = domainDetailRes

    const resDomain = {
      ad_frequency: domain.ad_frequency || DefaultADFrequency,
      ad_content: domain.ad_content || DefaultADContent
    }
    const resShow = {
      ad_show: show.ad_show !== null ? show.ad_show : true,
      question_ref_source_show:
        show.question_ref_source_show !== null ? show.question_ref_source_show : false,
      qa_modifiable: show.qa_modifiable !== null ? show.qa_modifiable : false
    }

    if ($notnull(customer_limit)) {
      customerLimitState = Object.assign(customerLimitState, customer_limit)
    }
    settingState = Object.assign(settingState, {
      show: resShow,
      domain: resDomain
    })

    if (show.qa_modifiable) {
      await initCorrect()
    }
  } catch (e) {
  } finally {
    initing.value = false
  }
}

watch(slug, (v) => v && init(), { immediate: true })
</script>
