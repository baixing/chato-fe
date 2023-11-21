<template>
  <div
    ref="scrollContainerRef"
    v-loading="loading"
    element-loading-background="rgba(255, 255, 255, 0.08)"
    class="bot-create-center-padding h-full overflow-y-auto lg:px-4 xl:px-[18%] 2xl:px-[24%] pt-3 pb-8 space-y-4 scroll-smooth"
  >
    <Transition name="left">
      <div v-show="currentStep > 0">
        <ChatoDomainAvatar />
        <div class="left-bubble">
          <div class="title !mb-2">
            <img src="@/assets/img/emoji/surprise.png" class="w-5" />
            {{ $t('Hi，欢迎进入 Chato 世界！') }}
          </div>
          <p>
            {{ $t('基于多种AI大模型，帮你 10 秒快速定制') }}
          </p>
          <div class="title !mb-2 !mt-3">
            <!-- <img src="@/assets/img/emoji/surprise.png" class="w-5" /> -->
            {{ $t('🤖 训练机器人非常简单') }}
          </div>
          <p>
            {{ $t('AI可包办一切，包括初始化设置和自我学习升级') }}
          </p>
          <div class="title !mb-2 !mt-3">
            <!-- <img src="@/assets/img/emoji/surprise.png" class="w-5" /> -->
            {{ $t('👀 可以把机器人发布到各端') }}
          </div>
          <p>
            {{ $t('网页、企微、微信、小红书、抖音、钉钉、飞书、API等....') }}
          </p>
        </div>
      </div>
    </Transition>
    <Transition name="left">
      <div v-show="currentStep > 1">
        <ChatoDomainAvatar />
        <div class="left-bubble">
          <div class="title">
            <img src="@/assets/img/emoji/bot.png" class="w-5" />
            {{ $t('请选择你想尝试制作什么机器人？') }}
          </div>
          <div class="flex flex-wrap gap-3">
            <span
              v-for="item in interestDomains"
              :key="item.id"
              @click="onSelectInterest(item)"
              class="select-tag"
            >
              {{ item.name }}
            </span>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="right">
      <div v-show="currentStep > 2 && formState.name" class="flex justify-end">
        <div class="right-bubble">{{ formState.name }}</div>
      </div>
    </Transition>
    <Transition name="left">
      <div v-show="currentStep > 3">
        <ChatoDomainAvatar />
        <div class="left-bubble">
          <div class="title">
            {{ $t('😁 你的机器人诞生了！') }}
          </div>
          <p>
            {{ $t(`你创建的机器人「${formState.name}」`) }}
          </p>
          <p>
            {{ $t(`生日：${nowDay}`) }}
          </p>
          <p v-if="isMobile">
            {{ $t('基于AI大模型的TA有很多常识，现在就可以') }}
          </p>
          <p v-else>
            {{ $t('基于AI大模型的TA有很多常识，现在就可以右侧输入体验') }}
          </p>
          <el-button
            v-if="isMobile"
            class="!text-[#7C5CFC] !text-xs cursor-pointer mt-[10px] !rounded-lg !border-[#7C5CFC]"
            @click="onClickTab('preview')"
            plain
            >{{ $t('马上体验') }}
          </el-button>
        </div>
      </div>
    </Transition>
    <Transition name="left">
      <div v-show="currentStep > 4">
        <ChatoDomainAvatar />
        <div class="left-bubble">
          <div class="title">
            {{ $t('💪 让TA更加强大的方式') }}
          </div>
          <p>
            {{ $t(`☞ TA的信息完整度12%，`) }}
            <span class="text-[#7C5CFC] cursor-pointer" @click="onClickTab('gui')">
              {{ $t('完善资料') }}
            </span>
          </p>
          <p>
            {{ $t(`☞ TA目前只有大模型知识，`) }}
            <span
              class="text-[#7C5CFC] cursor-pointer"
              @click="onSetDOCModalVisible(true, pushDOCItem)"
              >{{ $t('灌输知识') }}</span
            >
          </p>
          <p>
            {{ $t('☞ 让大家都来向TA提问，') }}
            <span
              class="text-[#7C5CFC] cursor-pointer"
              @click="delayIncreaseStep(500, { name: 'left', type: 'share' })"
            >
              {{ $t('分享发布') }}
            </span>
          </p>
          <p>
            {{ $t(`☞ 互联网用户目前可以访问你的机器人，如不需要可`)
            }}<span class="text-[#7C5CFC] cursor-pointer" @click="onBotTocPrivacy">
              {{ $t('关闭') }}
            </span>
          </p>
        </div>
      </div>
    </Transition>
    <div v-for="(item, index) in transitionList" :key="index">
      <Transition :name="item.name">
        <div :style="{ 'text-align': `-webkit-${item.name}`  } as unknown as StyleValue">
          <ChatoDomainAvatar v-if="item.name === 'left'" />
          <div :class="`${item.name}-bubble`" v-if="item.type === 'share'">
            <div class="title">
              {{ $t('✨ 欢迎把TA分享给任何人') }}
            </div>
            <p class="flex items-center">
              {{ $t(`☞  网页访问，`) }}
              <span
                class="text-[#7C5CFC] cursor-pointer mr-1"
                @click="$copyText(link, '链接已复制成功，快分享给你的好友吧！')"
                >{{ $t('复制链接') }}
              </span>
              <QrCode
                :value="link"
                :bordered="false"
                errorLevel="M"
                :isImg="false"
                title="下载码"
              />
            </p>
            <p>
              {{ $t(`☞  小程序访问，`) }}
              <span class="text-[#7C5CFC] cursor-pointer mr-1" @click="copyText">{{
                $t('复制链接')
              }}</span>
            </p>
            <p>
              {{ $t('☞  微信抖音等第三方') }}
              <span class="text-[#7C5CFC] cursor-pointer mr-1" @click="routerPush">{{
                $t('前往分享')
              }}</span>
            </p>
          </div>
          <div :class="`${item.name}-bubble`" v-if="item.type === 'doc'">
            <p
              v-for="file in item.filesList"
              :key="file.id"
              class="flex text-[#fff] text-sm items-center gap-2"
            >
              <svg-icon name="document" svg-class="w-4 h-4" />
              <span class="flex-1 truncate transition-colors cursor-pointer">
                {{ file.title }}
              </span>
              <!-- <span class="text-[#7C5CFC]">{{ $t(getFileStatusName(item.status)) }}</span>
              <el-button link :icon="Close" @click="onDeleteFile(item.id)" /> -->
            </p>
          </div>
          <div :class="`${item.name}-bubble`" v-else>
            <div class="title" v-if="item.title">
              {{ $t(item.title) }}
            </div>
            <p v-if="item.data">
              {{ $t(item.data) }}
            </p>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getAppletLink } from '@/api/domain'
import { getFirstGuideInterestDomains } from '@/api/industry'
import { useBasicLayout } from '@/composables/useBasicLayout'
import useGlobalProperties from '@/composables/useGlobalProperties'
import { DomainCreateSymbol } from '@/constant/domain'
import type { IDomainInfo } from '@/interface/domain'
import type { IDocumentList } from '@/interface/knowledge'
import { useBase } from '@/stores/base'
import QrCode from '@/views/training/release/components/releaseWebAPP/components/webPage/QrCode.vue'
import dayjs from 'dayjs'
import { storeToRefs } from 'pinia'
import { computed, inject, nextTick, ref, watch, type StyleValue } from 'vue'
import { useRouter } from 'vue-router'

type ITransitionItem =
  | {
      name: 'left' | 'right'
      type: 'share' | 'text'
      title?: string
      data?: string
    }
  | {
      name: 'left' | 'right'
      type: 'doc'
      filesList: IDocumentList[]
    }

defineProps<{
  onClickTab: (value) => void
  onSetDOCModalVisible: (value: boolean, cd?: Function) => void
}>()

const currentStep = ref(0)
const loading = ref(false)
const router = useRouter()
const interestDomains = ref<IDomainInfo[]>([])
const transitionList = ref<ITransitionItem[]>([])
const formState = inject(DomainCreateSymbol)
const { isMobile } = useBasicLayout()
const { $copyText } = useGlobalProperties()
const baseStoreI = useBase()
const { orgInfo } = storeToRefs(baseStoreI)

const userRoute = computed(() => `/t/bot/${formState.id}/release`)
const link = computed(() => `${window.location.origin}/b/${formState.slug}`)
const increaseStep = () => {
  currentStep.value += 1
}

const routerPush = () => router.push({ path: userRoute.value })

const pushDOCItem = (data: IDocumentList[]) => {
  if (data.length === 0) return
  delayIncreaseStep(500, {
    type: 'doc',
    name: 'right',
    filesList: data
  })
  delayIncreaseStep(1000, {
    type: 'text',
    name: 'left',
    data: '文档只需几分钟学习完'
  })
}

const onBotTocPrivacy = () => {
  formState.toc_privacy = 0
  delayIncreaseStep(0, {
    type: 'text',
    name: 'right',
    data: '关闭公开访问权限'
  })
  delayIncreaseStep(500, {
    type: 'text',
    name: 'left',
    data: '已关闭'
  })
}

const delayIncreaseStep = (time = 300, item?: ITransitionItem) => {
  setTimeout(() => {
    item ? transitionList.value.push(item) : increaseStep()
  }, time)
}

const copyText = async () => {
  const link = await getLinkByWX()
  $copyText(link, '链接已复制成功，快分享给你的好友吧！')
}

const setObjByObj = <T extends object>(obj1: T, obj2: T, pick?: (keyof T)[]) => {
  Object.keys(obj2).forEach((key) => {
    const _key = key as keyof T
    if (pick.includes(_key)) obj1[_key] = obj2[_key] ?? obj1[_key]
  })
}

const onSelectInterest = (item: IDomainInfo) => {
  setObjByObj(formState, item, [
    'avatar',
    'system_prompt',
    'welcome',
    'message_style',
    'suspend_style',
    'desc',
    'llm',
    'name',
    'top_k',
    'lang',
    'reply_tone',
    'qa_threshold',
    'doc_threshold',
    'temperature'
  ])
  if (!orgInfo.value.additions) {
    delayIncreaseStep(1000)
  } else {
    delayIncreaseStep(1000)
    delayIncreaseStep(2000)
    delayIncreaseStep(3000)
  }
}
const getLinkByWX = async () => {
  const res = await getAppletLink(formState.slug)
  return res.data.data.url_link
}

const nowDay = dayjs()
  .format('YYYY-MM-DD')
  .split('-')
  .reduce((pre, cur, index) => pre + cur + ['年', '月', '日'][index], '')
const init = async () => {
  try {
    loading.value = true
    const {
      data: { data }
    } = await getFirstGuideInterestDomains()
    increaseStep()
    delayIncreaseStep(500)
    delayIncreaseStep(1000)
    interestDomains.value = data
  } catch (e) {
  } finally {
    loading.value = false
  }
}
orgInfo.value.additions && init()
watch(orgInfo, (value) => {
  if (interestDomains.value.length > 0) return
  value.additions && init()
})
const scrollContainerRef = ref()
let latestScrollHeight = 0
const onScrollBottom = () => {
  nextTick(() => {
    const { scrollHeight, scrollTop } = scrollContainerRef.value

    if (latestScrollHeight !== scrollHeight && scrollHeight > scrollTop) {
      latestScrollHeight = scrollHeight
      scrollContainerRef.value.scrollTo({
        top: scrollHeight,
        behavior: 'smooth'
      })
    }
  })
}

watch(currentStep, () => {
  onScrollBottom()
})

watch(
  () => transitionList.value.length,
  () => {
    onScrollBottom()
  }
)
</script>
<style lang="scss">
.bot-create-center-padding {
  @apply px-16 lg:px-4;
}
.left-bubble {
  @apply w-fit mt-2 mr-3 bg-[#F8F8F8] rounded-2xl rounded-tl-[2px] overflow-hidden py-3 px-4 text-[15px] tracking-[0.13px] text-[#596780] break-words leading-6;

  .title {
    @apply flex items-center gap-1 font-medium text-[#303133] break-words mb-3;
  }

  .select-tag {
    @apply inline-block border border-solid border-[#E4E7ED] text-[13px] leading-5 py-[6px] px-4 cursor-pointer rounded-[18px] transition-colors hover:opacity-80;
  }
}

.right-bubble {
  @apply w-fit ml-3 bg-[#7C5CFC] rounded-2xl rounded-br-[2px] overflow-hidden py-3 px-4 text-[15px] tracking-[0.13px] text-white break-words leading-6;
}

.left-enter-active,
.left-leave-active {
  transition: all 0.5s ease;
}
.left-enter-from,
.left-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.right-enter-active,
.right-leave-active {
  transition: all 0.5s ease;
}
.right-enter-from,
.right-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
