<template>
  <div
    class="bg-[url('@/assets/img/home/case-bg.png')] relative bg-right-bottom bg-contain bg-no-repeat mt-16 mb-32 flex justify-between h-[694px] box-border pr-[124px] pl-16 max-w-[1075px] mx-auto lg:justify-normal lg:flex-col lg:bg-none lg:h-auto lg:mb-12 lg:p-0 xl:pl-0 xl:pr-24"
  >
    <h3
      class="hidden text-5xl leading-[72px] font-medium text-[#303133] text-center lg:text-[26px] lg:leading-[38px] lg:block"
    >
      {{ $t('行业') }}
      <strong class="tracking-[0.08em] bg-clip-text text-transparent line-grad-bg">
        {{ $t('案例') }}
      </strong>
    </h3>
    <IndustryCaseCard v-if="isMobile" :item="caseList[activeIndex]" />
    <div v-else class="mt-[70px] pl-[22px]">
      <IndustryCaseCard
        v-for="(item, index) in caseList"
        :key="`case_${index}`"
        :item="item"
        :index="index"
        :active="activeIndex === index"
        @select="onSelectCase"
      />
    </div>
    <div>
      <div
        class="top-tag px-6 py-3 rounded-[22px] w-fit mx-auto flex items-center justify-center gap-1 text-white font-medium text-xs mb-5"
      >
        <img
          v-if="caseList[activeIndex].tagName.includes($t('飞书'))"
          class="w-4 h-4"
          :src="caseList[activeIndex].tagIcon"
        />
        <svg-icon v-else :name="caseList[activeIndex].tagIcon" svg-class="w-4 h-4 text-white" />
        <span>{{ caseList[activeIndex].tagName }}</span>
      </div>
      <el-carousel
        v-if="isMobile"
        indicator-position="outside"
        :initial-index="activeIndex"
        :interval="2000"
        @change="(c) => (activeIndex = c)"
        arrow="never"
        height="auto"
        class="carousel-container"
      >
        <el-carousel-item v-for="(item, index) in caseList" :key="`case_m_${index}`">
          <el-image :src="item.caseImg" fit="contain" class="w-full h-fit" />
        </el-carousel-item>
        <el-image
          :src="caseList[activeIndex].caseImg"
          fit="contain"
          lazy
          class="w-full h-fit opacity-0"
        />
      </el-carousel>
      <el-image v-else class="w-[355px]" :src="caseList[activeIndex].caseImg" lazy fit="contain" />
    </div>

    <span
      class="case-pic-bg w-10 h-10 rounded-full flex items-center justify-center absolute top-[158px] left-[43%] lg:hidden xl:left-[40%]"
    >
      <svg-icon name="picture" svg-class="w-5 h-5 text-white"></svg-icon>
    </span>
    <span
      class="case-voice-bg w-14 h-14 rounded-full flex items-center justify-center absolute bottom-[121px] left-[45%] lg:hidden xl:left-[38%]"
    >
      <svg-icon name="chat-sound" svg-class="w-8 h-8 text-white"></svg-icon>
    </span>
    <span
      class="case-bot-bg rounded-[20px] w-[76px] h-[74px] flex items-center justify-center absolute top-[323px] right-0 lg:hidden"
    >
      <svg-icon name="robot" svg-class="text-white w-9 h-8"></svg-icon>
    </span>
    <div v-if="isMobile" class="m-bg"></div>
  </div>
</template>
<script lang="ts" setup>
// 引入顺序
import CpChato from '@/assets/img/home/cp/chato.png'
import EmShine from '@/assets/img/home/emoji/shine.png'
// 引入顺序
import CpTswct from '@/assets/img/home/cp/tswct.png'
import EmEye from '@/assets/img/home/emoji/eye.png'
// 引入顺序
import CpJpcg from '@/assets/img/home/cp/jpcg.png'
import EmHeart from '@/assets/img/home/emoji/heart.png'
// 引入顺序
import CpWjs from '@/assets/img/home/cp/wjs.png'
import EmPerson from '@/assets/img/home/emoji/person.png'
// 引入顺序
import CpXlai from '@/assets/img/home/cp/xlai.png'
import EmSuperman from '@/assets/img/home/emoji/superman.png'
// 引入顺序
import FsActive from '@/assets/img/fs-active.png'
import CpYywj from '@/assets/img/home/cp/yywj.png'
import EmNet from '@/assets/img/home/emoji/net.png'
import { useBasicLayout } from '@/composables/useBasicLayout'
import useImagePath from '@/composables/useImagePath'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import IndustryCaseCard from './IndustryCaseCard.vue'

// 获取home/caseImg目录下的图片路径
const { ImagePath: CaseChatoPath } = useImagePath('chato', 'home/caseImg')
const { ImagePath: CaseTswctPath } = useImagePath('tswct', 'home/caseImg')
const { ImagePath: CaseXlaiPath } = useImagePath('xlai', 'home/caseImg')
const { ImagePath: CaseWjsPath } = useImagePath('wjs', 'home/caseImg')
const { ImagePath: CaseJpcgPath } = useImagePath('jpcg', 'home/caseImg')
const { ImagePath: CaseYywjPath } = useImagePath('yywj', 'home/caseImg')

const { t } = useI18n()
const caseList = computed(() => [
  {
    logo: CpChato,
    emoji: EmShine,
    title: t('Chato 智能客服'),
    caseImg: CaseChatoPath.value,
    tagName: t('网页发布'),
    tagIcon: 'computer-filled'
  },
  {
    logo: CpTswct,
    emoji: EmEye,
    title: t('天使湾数字 AI 创投经理'),
    caseImg: CaseTswctPath.value,
    tagName: t('API 接入'),
    tagIcon: 'api-access'
  },
  {
    logo: CpXlai,
    emoji: EmHeart,
    title: t('心聊 AI 微信群聊咨询师'),
    caseImg: CaseXlaiPath.value,
    tagName: t('微信群聊'),
    tagIcon: 'wechat-filled'
  },
  {
    logo: CpWjs,
    emoji: EmPerson,
    title: t('王建硕公众号 AI 分身'),
    caseImg: CaseWjsPath.value,
    tagName: t('微信公众号'),
    tagIcon: 'wx-public'
  },
  {
    logo: CpJpcg,
    emoji: EmSuperman,
    title: t('金牌橱柜 VIP 顾问'),
    caseImg: CaseJpcgPath.value,
    tagName: t('飞书群聊'),
    tagIcon: FsActive
  },
  {
    logo: CpYywj,
    emoji: EmNet,
    title: t('地道英语外教'),
    caseImg: CaseYywjPath.value,
    tagName: t('JS 嵌入'),
    tagIcon: 'js-access'
  }
])

let timer
const activeIndex = ref(0)
const { isMobile } = useBasicLayout()

const onSelectCase = (index: number) => {
  activeIndex.value = index
  clearTimeout(timer)
  onTimerListener()
}

const onTimerListener = () => {
  timer = setInterval(() => {
    if (activeIndex.value === caseList.value.length - 1) {
      activeIndex.value = 0
    } else {
      activeIndex.value += 1
    }
  }, 2000)
}

onMounted(() => {
  !isMobile.value && onTimerListener()
})

onBeforeUnmount(() => {
  clearTimeout(timer)
})

watch(isMobile, () => {
  if (isMobile.value) {
    !timer && onTimerListener()
  } else {
    timer && clearTimeout(timer)
  }
})
</script>
<style lang="scss" scoped>
.case-pic-bg {
  background: linear-gradient(155deg, #ffa8e5 1%, #ffe45e 95%);
}
.case-voice-bg {
  background: linear-gradient(155deg, #cc92ff 1%, #4fb0ff 95%);
}

.case-bot-bg {
  background: linear-gradient(153deg, #4278f6 -37%, #51c8ff 110%);
}

.case-active {
  transform: scale(1.2) translateX(8%);
  box-shadow: 0px 20px 23.2px -19px rgba(106, 86, 219, 0.17);
  margin-bottom: 38px;

  &:last-child {
    margin-bottom: 0;
  }

  & > div {
    color: #7c5cfc;
    border-color: #ebdaff;
  }

  &::after {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: -16px;
    content: '';
    background-color: #7c5cfc;
    width: 6px;
    height: 40px;
    border-top-right-radius: 20px;
    border-bottom-right-radius: 20px;
  }
}

.top-tag {
  background: linear-gradient(159deg, #7c5cfc -11%, #5c87fc 94%);
}

.line-grad-bg {
  background-image: linear-gradient(117deg, #0547ff -84%, #d683ff 125%);
}

.m-bg {
  position: absolute;
  left: -80px;
  top: 0;
  width: 354px;
  height: 354px;
  z-index: -1;
  border-radius: 100%;
  background: linear-gradient(180deg, #eff2f9 -2%, rgba(239, 242, 249, 0) 99%);
}

.carousel-container {
  :deep(.el-carousel__indicators) {
    margin-top: 28px;
  }

  :deep(.el-carousel__button) {
    width: 8px;
    height: 8px;
    border-radius: 100%;
  }
}
</style>
