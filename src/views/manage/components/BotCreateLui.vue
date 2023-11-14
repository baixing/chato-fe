<template>
  <div
    ref="scrollContainerRef"
    v-loading="loading"
    element-loading-background="rgba(255, 255, 255, 0.08)"
    class="h-full overflow-y-auto lg:px-4 xl:px-[18%] 2xl:px-[24%] pt-3 pb-8 space-y-4 scroll-smooth"
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
            {{ $t('我可以基于AI大模型，帮你 10 秒快速定制') }}
          </p>
        </div>
      </div>
    </Transition>
    <Transition name="left">
      <div v-show="currentStep > 1">
        <ChatoDomainAvatar />
        <div class="left-bubble">
          <div class="title !mb-2">
            <!-- <img src="@/assets/img/emoji/surprise.png" class="w-5" /> -->
            {{ $t('🤖 训练机器人非常简单') }}
          </div>
          <p>
            {{ $t('AI会帮你生成一切，包括形象和个性，以及学习知识') }}
          </p>
        </div>
      </div>
    </Transition>
    <Transition name="left">
      <div v-show="currentStep > 2">
        <ChatoDomainAvatar />
        <div class="left-bubble">
          <div class="title !mb-2">
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
      <div v-show="currentStep > 3">
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
      <div v-show="currentStep > 3 && formState.name" class="flex justify-end">
        <div class="right-bubble">{{ formState.name }}</div>
      </div>
    </Transition>
    <Transition name="left">
      <div v-show="currentStep > 4">
        <ChatoDomainAvatar />
        <div class="left-bubble">
          <div class="title">
            <!-- <img src="@/assets/img/emoji/yeah.png" class="w-5" /> -->
            {{ $t('😁 你的机器人诞生了！') }}
          </div>
          <p>
            {{ $t(`你创建的机器人「`) + formState.name + '」' }}
          </p>
          <p>
            {{ $t(`生日：`) + nowDay }}
          </p>
          <p>
            {{ $t('基于AI大模型的TA有很多常识，现在就可以马上体验') }}
          </p>
          <!-- <el-button type="primary" round>
            {{ $t('快去看看') }}
          </el-button> -->
        </div>
      </div>
    </Transition>
    <Transition name="left">
      <div v-show="currentStep > 5">
        <ChatoDomainAvatar />
        <div class="left-bubble">
          <div class="title">
            <!-- <img src="@/assets/img/emoji/yeah.png" class="w-5" /> -->
            {{ $t('😁 你的机器人诞生了！') }}
          </div>
          <p>
            {{ $t(`你创建的机器人「${formState.name}」`) }}
          </p>
          <p>
            {{ $t(`生日：${nowDay}`) }}
          </p>
          <p>
            {{ $t('基于AI大模型的TA有很多常识，现在就可以马上体验') }}
          </p>
          <!-- <el-button type="primary" round>
            {{ $t('快去看看') }}
          </el-button> -->
        </div>
      </div>
    </Transition>
    <Transition name="left">
      <div v-show="currentStep > 6">
        <ChatoDomainAvatar />
        <div class="left-bubble">
          <div class="title">
            <!-- <img src="@/assets/img/emoji/yeah.png" class="w-5" /> -->
            {{ $t('😁 你的机器人诞生了！') }}
          </div>
          <p>
            {{ $t(`你创建的机器人「${formState.name}」`) }}
          </p>
          <p>
            {{ $t(`生日：${nowDay}`) }}
          </p>
          <p>
            {{ $t('基于AI大模型的TA有很多常识，现在就可以马上体验') }}
          </p>
          <!-- <el-button type="primary" round>
            {{ $t('快去看看') }}
          </el-button> -->
        </div>
      </div>
    </Transition>
    <Transition name="left">
      <div v-show="currentStep > 7">
        <ChatoDomainAvatar />
        <div class="left-bubble">
          <div class="title">
            <!-- <img src="@/assets/img/emoji/yeah.png" class="w-5" /> -->
            {{ $t('😁 你的机器人诞生了！') }}
          </div>
          <p>
            {{ $t(`你创建的机器人「${formState.name}」`) }}
          </p>
          <p>
            {{ $t(`生日：${nowDay}`) }}
          </p>
          <p>
            {{ $t('基于AI大模型的TA有很多常识，现在就可以马上体验') }}
          </p>
          <!-- <el-button type="primary" round>
            {{ $t('快去看看') }}
          </el-button> -->
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { getFirstGuideInterestDomains } from '@/api/industry'
import { DomainCreateSymbol } from '@/constant/domain'
import type { IDomainInfo } from '@/interface/domain'
import dayjs from 'dayjs'
import { inject, ref } from 'vue'

const currentStep = ref(0)
const loading = ref(false)
const interestDomains = ref<IDomainInfo[]>([])
const formState = inject(DomainCreateSymbol)
const increaseStep = () => {
  currentStep.value += 1
}
const delayIncreaseStep = (time = 300) => {
  setTimeout(() => {
    increaseStep()
  }, time)
}
const setObjByObj = <T extends object>(obj1: T, obj2: T, pick?: (keyof T)[]) => {
  Object.keys(obj2).forEach((key) => {
    const _key = key as keyof T
    if (pick.includes(_key)) return
    obj1[_key] = obj2[_key] ?? obj1[_key]
  })
}

const onSelectInterest = (item: IDomainInfo) => {
  console.log(item, formState)
  setObjByObj(formState, item, ['org', 'id'])
  // console.log(formState)
  delayIncreaseStep(500)
  delayIncreaseStep(1000)
  delayIncreaseStep(1500)
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
    delayIncreaseStep(1500)
    interestDomains.value = data
    console.log(interestDomains.value)
  } catch (e) {
  } finally {
    loading.value = false
  }
}
init()
</script>
<style lang="scss">
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
