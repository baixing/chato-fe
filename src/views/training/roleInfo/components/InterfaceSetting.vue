<template>
  <div class="chato-form">
    <div class="chato-form-item">
      <SLTitle class="chato-form-label">{{ t('机器人名字和头像') }}</SLTitle>
      <div class="interface-desc">
        <span>{{ t('可展示或隐藏顶部的名字和头像') }}</span>
        <SwitchWithStateMsg v-model:value="currentDomain.name_and_avatar_show" />
      </div>
    </div>
    <div class="chato-form-item">
      <div class="chato-form-label">{{ t('角色简介') }}</div>
      <div class="interface-desc">
        <span>{{ t('可展示或隐藏角色简介内容') }}</span>
        <SwitchWithStateMsg v-model:value="currentDomain.desc_show" />
      </div>
    </div>
    <div class="chato-form-item">
      <SLTitle
        tips="关闭时仅在后台训练中可查看来源文档，打开后所有人在与机器人对话时都可查看"
        class="chato-form-label"
      >
        {{ t('文档来源') }}
      </SLTitle>
      <div class="interface-desc">
        <div class="flex items-center gap-3">
          <span>{{ t('当回答引用了文档后，可查看回答对应的文档来源') }}</span>
          <el-button
            size="small"
            type="primary"
            link
            @click="onShowExample(EReleaseSettingExampleType.doc)"
          >
            {{ t('查看示例') }}
          </el-button>
        </div>
        <SwitchWithStateMsg
          v-model:value="currentDomain.question_ref_source_show"
          open-msg="开启"
          close-msg="关闭"
        />
      </div>
    </div>
    <div class="chato-form-item">
      <SLTitle
        tips="关闭时仅在后台训练中可修正，打开后在分享链接页面，所有人在与机器人对话时都可修正"
        class="chato-form-label"
      >
        {{ t('回答修正') }}
      </SLTitle>
      <div class="interface-desc">
        <div class="flex items-center gap-3">
          <span>{{ $t('当你的用户对话时，提供可修正的功能') }}</span>
          <el-button
            size="small"
            type="primary"
            link
            @click="onShowExample(EReleaseSettingExampleType.correct)"
          >
            {{ t('查看示例') }}
          </el-button>
        </div>
        <SwitchWithStateMsg
          :value="currentDomain.qa_modifiable"
          openMsg="开启"
          closeMsg="关闭"
          @change="onCorrectAnswerChange"
          :isShow="true"
        />
      </div>
      <div
        v-show="correctState.visible"
        v-loading="correctState.loading"
        class="flex flex-col items-center gap-3 text-[#3D3D3D] text-sm leading-5 mt-3"
      >
        <p class="flex-1 truncate w-full text-[#9DA3AF] whitespace-pre-wrap">
          {{ correctState.link }}
        </p>
        <p class="flex items-center justify-start gap-4 w-full">
          <el-button type="primary" plain @click="onCorrectClick" class="!bg-white !text-[#7C5CFC]">
            {{ correctState.expired ? $t('重新生成') : $t('复制分享连接') }}
          </el-button>
          <span v-if="correctState.expired" class="text-[#EA0000]">
            {{ $t('链接已失效，原链接可正常访问但无法修正') }}
          </span>
          <span v-else class="text-[#596780]">
            <span class="text-[#7C5CFC]">
              {{ $t('90天') }}
            </span>
            {{ $t('后该链接的修正功能将失效') }}
          </span>
        </p>
      </div>
    </div>
    <div class="chato-form-item">
      <SLTitle
        tips="与机器人对话时，可选择双方默认用文字或语音对话，对话模式切换电力值不变。"
        class="chato-form-label"
      >
        {{ t('对话设置') }}
      </SLTitle>
      <div class="interface-desc">
        <div class="flex items-center gap-3">
          <span>{{ t('当你的用户对话时，每组对话的沟通形式的模式选择') }}</span>
          <el-button
            size="small"
            type="primary"
            link
            @click="onShowExample(EReleaseSettingExampleType.chat)"
          >
            {{ t('查看示例') }}
          </el-button>
        </div>
      </div>
      <div class="flex gap-4 items-center text-[#303133] text-sm mt-[10px]">
        <span>{{ t('对话模式：') }}</span>
        <el-radio-group v-model="currentDomain.conversation_mode" @change="changeConversation">
          <el-radio
            v-for="item in DomainConversationModeOptions"
            :key="item.value"
            :label="item.value"
          >
            {{ t(item.label) }}
          </el-radio>
        </el-radio-group>
      </div>
      <div
        class="flex gap-4 items-center text-[#303133] text-sm mt-[10px]"
        v-if="currentDomain.conversation_mode === EDomainConversationMode.audio"
      >
        <span>{{ t('唤起方式：') }}</span>
        <el-radio-group
          v-model="currentDomain.conversation_arouse_mode"
          @change="changeConversation"
        >
          <el-radio
            v-for="item in DomainConversationModeArousalMethodOptions"
            :key="item.value"
            :label="item.value"
          >
            {{ t(item.label) }}
          </el-radio>
        </el-radio-group>
      </div>
      <div
        class="flex gap-4 items-center text-[#303133] text-sm mt-[10px]"
        v-if="currentDomain.conversation_mode === EDomainConversationMode.audio"
      >
        <span>{{ t('音色选择：') }}</span>
        <TimbreItem
          :iconStyle="'!text-[#9DA3AF]'"
          :value="currentDomain.conversation_mode_meta"
          :iconName="playAudio === currentDomain.conversation_mode_meta ? 'audio-pause' : undefined"
          :label="
            timbreList?.find((item) => item.value === currentDomain.conversation_mode_meta)?.label
          "
          :setValue="getTestTimbreUrl"
        />
        <div
          class="flex items-center py-2 px-3 rounded border border-solid border-[#7C5CFC] text-[#7C5CFC] cursor-pointer"
          @click="clickSelectTimbre"
        >
          {{ t('选择音色') }}
        </div>
      </div>
    </div>
    <div class="chato-form-item">
      <div class="chato-form-label flex items-center gap-[6px]">
        <SLTitle>{{ t('品牌 & logo') }}</SLTitle>
        <SpaceRightsFreeExpUpgrate
          v-if="currentRights.type === ESpaceCommercialType.free"
          :rights-type="ESpaceRightsType.brand"
        />
      </div>
      <div class="flex items-center justify-between gap-4 w-full relative">
        <ImgUpload
          :fixed="true"
          v-model:img-url="currentDomain.brand_logo"
          :is-initial-img="true"
        />
        <HansInputLimit
          v-model:value="currentDomain.brand_name"
          type="text"
          :limit="currentDomainHansLimit.brandName"
          class="w-full"
        />
        <SwitchWithStateMsg v-model:value="currentDomain.brand_show" />
        <SpaceRightsMask :visible="maskVisible" />
      </div>
    </div>
    <div class="chato-form-item">
      <div class="chato-form-label">{{ t('菜单栏') }}</div>
      <ChatShortcuts
        v-model:shortcuts="currentDomain.shortcuts"
        :domain-id="currentDomain.id.toString()"
      />
      <p class="text-xs text-[#9DA3AF] mt-4 leading-4">
        {{ t('用户点击菜单后，将回复对应内容。此类消息不消耗电力值。') }}
      </p>
    </div>
    <div class="chato-form-item">
      <div class="chato-form-label">{{ t('气泡设置') }}</div>
      <div class="flex gap-16 lg:flex-col lg:gap-4">
        <div class="flex items-center gap-4">
          <span class="interface-desc">{{ $t('对话气泡') }}</span>
          <el-color-picker v-model="currentDomain.message_style" />
        </div>
      </div>
    </div>
  </div>

  <Modal v-model:visible="exampleState.visible" title="查看示例" :footer="false">
    <div class="max-h-[65vh] overflow-y-auto">
      <img :src="exampleState.img" class="w-full" alt="" />
    </div>
  </Modal>
  <div>
    <audio ref="testAudio" :src="testAudioUrl" controls style="display: none"></audio>
  </div>
  <Modal v-model:visible="timbreDialogVisible" title="选择音色" @submit="setTimbre">
    <div class="grid gap-y-4 gap-x-4 grid-cols-2">
      <TimbreItem
        v-for="(item, index) in timbreList"
        :className="
          index === indexDialogTimbre
            ? '!border-[#7C5CFC] justify-between cursor-pointer !text-[#7C5CFC]'
            : 'justify-between cursor-pointer !text-black'
        "
        :iconName="playAudio === item.value ? 'audio-pause' : undefined"
        :key="item.value"
        :value="item.value"
        :label="item.label"
        :setValue="getTestTimbreUrl"
        @click="indexDialogTimbre = index"
      />
    </div>
  </Modal>
</template>

<script setup lang="ts">
import {
  checkDomainCorrectTicketIsExpired,
  generateDomainCorrectTicket,
  getTestTimbreUrl as getTestTimbreUrlApi
} from '@/api/domain'
import TimbreItem from '@/components/BotSetting/TimbreItem.vue'
import ImgUpload from '@/components/ImgUpload/ImgUpload.vue'
import HansInputLimit from '@/components/Input/HansInputLimit.vue'
import Modal from '@/components/Modal/index.vue'
import SpaceRightsFreeExpUpgrate from '@/components/Space/SpaceRightsFreeExpUpgrate.vue'
import SpaceRightsMask from '@/components/Space/SpaceRightsMask.vue'
import SwitchWithStateMsg from '@/components/SwitchWithStateMsg/index.vue'
import SLTitle from '@/components/Title/SLTitle.vue'
import useImagePath from '@/composables/useImagePath'
import { currentEnvConfig } from '@/config'
import { TTSTIMBE } from '@/constant/common'
import {
  DomainConversationModeArousalMethodOptions,
  DomainConversationModeOptions,
  DomainEditSymbol,
  DomainHansLimitSymbol
} from '@/constant/domain'
import { FreeCommercialTypeExperienceDay } from '@/constant/space'
import { EDomainConversationMode } from '@/enum/domain'
import { EReleaseSettingExampleType } from '@/enum/release'
import { ESpaceCommercialType, ESpaceRightsType } from '@/enum/space'
import type { IDomainInfo } from '@/interface/domain'
import type { ITimbreOptions } from '@/interface/tts'
import { useBase } from '@/stores/base'
import { useSpaceStore } from '@/stores/space'
import { copyPaste } from '@/utils/help'
import { getSpecifiedDateSinceNowDay } from '@/utils/timeRange'
import { ElMessageBox, ElNotification } from 'element-plus'
import { storeToRefs } from 'pinia'
import { computed, inject, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ChatShortcuts from './ChatShortcuts.vue'

const currentDomain = inject<Partial<IDomainInfo>>(DomainEditSymbol)
const currentDomainHansLimit = inject<Record<string, number>>(DomainHansLimitSymbol)

const { t } = useI18n()
const { ImagePath: CorrectAnswerImg } = useImagePath('correct-answer', 'example')
const { ImagePath: DocSourceImg } = useImagePath('doc-source', 'example')
const { ImagePath: ChatModeImg } = useImagePath('chat-mode', 'example')

const exampleState = reactive({
  visible: false,
  img: ''
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
    case EReleaseSettingExampleType.chat:
      exampleState.img = ChatModeImg.value
      break
  }
}

const baseStoreI = useBase()
const spaceStoreI = useSpaceStore()
const { currentRights } = storeToRefs(spaceStoreI)
const { orgInfo } = storeToRefs(baseStoreI)
const specifiedBetweenDay = getSpecifiedDateSinceNowDay(orgInfo.value.created)
const maskVisible = computed(
  () =>
    !currentRights.value.brand ||
    (currentRights.value.type === ESpaceCommercialType.free &&
      specifiedBetweenDay > FreeCommercialTypeExperienceDay)
)
//----- 音色部分 ----
const timbreList = ref<ITimbreOptions[]>()
const timbreDialogVisible = ref<boolean>(false)
const testAudio = ref<HTMLAudioElement>()
const testAudioUrl = ref<string>()
const indexDialogTimbre = ref<number>()
const playAudio = ref<string>()
// ----- 回答修正 -----
const correctState = reactive({
  loading: false,
  visible: false,
  link: '',
  ticket: '',
  expired: false
})

const setTimbre = () => {
  currentDomain.conversation_mode_meta = timbreList.value[indexDialogTimbre.value].value
  timbreDialogVisible.value = false
}

const clickSelectTimbre = () => {
  timbreDialogVisible.value = true
  indexDialogTimbre.value = timbreList.value.findIndex(
    (item) => item.value === currentDomain.conversation_mode_meta
  )
}

const getTestTimbreUrl = async (value: string) => {
  try {
    if (playAudio.value != undefined) {
      testAudio.value.pause()
      playAudio.value = undefined
      testAudioUrl.value = undefined
      return
    }
    playAudio.value = value
    const res = await getTestTimbreUrlApi(value)
    testAudioUrl.value = res.data.data.contentList[0].url
    testAudio.value.addEventListener('canplaythrough', () => testAudio.value.play())
    testAudio.value.addEventListener('ended', () => (playAudio.value = undefined))
  } catch (error) {}
}

const checkCorrectTicketExpired = async () => {
  const {
    data: { data }
  } = await checkDomainCorrectTicketIsExpired({
    ticket: correctState.ticket,
    slug: currentDomain.slug
  })
  return data
}

const changeConversation = (value) => {
  if (
    value === EDomainConversationMode.audio &&
    !currentDomain.conversation_mode_meta &&
    timbreList.value.length
  ) {
    currentDomain.conversation_mode_meta = timbreList.value[0]?.value
  }
}

const getTimbreList = async () => {
  try {
    // const res = await getTimbreListApi()
    timbreList.value = TTSTIMBE.timbres.map<ITimbreOptions>((item, index) => ({
      label: TTSTIMBE.descriptions[index],
      value: item
    }))
  } catch (error) {}
}

const initCorrect = async (needCheck = true) => {
  try {
    correctState.loading = true
    correctState.visible = true

    const {
      data: { data: ticketData }
    } = await generateDomainCorrectTicket(currentDomain.slug)
    correctState.ticket = ticketData
    correctState.link = `${currentEnvConfig.scriptURL}/b/${currentDomain.slug}?ticket=${ticketData}`

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

const onCorrectAnswerChange = async (val: number, isShow?: boolean) => {
  try {
    let action = t('关闭')
    let msg = t('关闭后所有对话用户都不再可以修正对话，是否确认关闭？')
    if (val) {
      action = t('开启')
      msg = t('开启后所有用户都可以修正对话，其修正内容将参与到学习，是否确认开启？')
    }

    if (!isShow)
      await ElMessageBox.confirm(msg, t('确认{action}', { action: action }), {
        confirmButtonText: t('确认'),
        cancelButtonText: t('取消'),
        type: 'warning'
      })

    currentDomain.qa_modifiable = val

    if (val) {
      await initCorrect()
    } else {
      correctState.visible = false
    }
  } catch (err) {}
}
// ------------------

onMounted(() => {
  if (currentDomain.qa_modifiable) {
    initCorrect()
  }
  getTimbreList()
})

// ------------------
</script>

<style lang="scss" scoped>
.interface-desc {
  @apply text-sm leading-5 text-[#596780] flex items-center justify-between w-full;
}
</style>
