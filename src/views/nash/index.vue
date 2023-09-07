<template>
  <div
    id="nashContainer"
    class="bg-[url('@/assets/img/home-header.png')] bg-right-top bg-contain bg-no-repeat bg-fixed h-full w-full overflow-auto"
    style="background-color: #fff"
  >
    <div class="w-[74%] mx-auto max-w-7xl mb-16 overflow-hidden lg:w-[90%]">
      <h1 class="font-medium text-[#303133] text-[28px] text-center h-[140px] leading-[140px]">
        {{ $t('云南纳什智能科技有限公司') }}
      </h1>
      <img :src="ImagePath" class="w-full" />
      <div
        class="mt-16 mb-10 text-6xl text-center font-medium text-[#e4e7ed4d] relative lg:mt-10 lg:mb-6 lg:text-5xl"
      >
        ABOUT US
        <h2
          class="text-[#3D3D3D] text-2xl tracking-wider absolute left-2/4 -translate-x-1/2 top-2/4 -translate-y-1/2 lg:text-xl"
        >
          {{ $t('关于我们') }}
        </h2>
      </div>
      <section class="flex flex-col gap-14 px-[14%] text-base lg:px-[5%] lg:text-sm">
        <div class="wow fadeInDown flex gap-6 items-center leading-[30px] text-[#596780]">
          <div
            class="w-[78px] h-[78px] flex items-center justify-center rounded-2xl bg-[#F6F9FF] text-center shrink-0 align-middle lg:w-16 lg:h-16"
          >
            <svg-icon svg-class="w-8 h-8 text-[#3269F0] lg:w-6 lg:h-6" name="earth" />
          </div>
          <p>
            {{
              $t(
                '云南纳什智能科技有限公司是一家专注于 AI 领域的领先企业。我们深入研究 AI技术，不断探索和创新，致力于将 AI技术应用于企业的各个领域，为客户提供更加智能化、高效化的解决方案。'
              )
            }}
          </p>
        </div>
        <div class="wow fadeInDown flex gap-6 items-center leading-[30px] text-[#596780]">
          <div
            class="w-[78px] h-[78px] flex items-center justify-center rounded-2xl bg-[#F6F9FF] shrink-0 lg:w-16 lg:h-16"
          >
            <svg-icon svg-class="w-8 h-8 text-[#3269F0] lg:w-6 lg:h-6" name="bot" />
          </div>
          <p>
            {{
              $t(
                '我们的主要产品是 Chato，一款企业级 AI知识服务和内容生产工具。通过角色设定和训练素材，生成定制版助理机器人，支持发布至各类终端，提供知识服务。Chato帮助企业先人一步运用 AI 理念，释放难以想象的产出与价值。'
              )
            }}
          </p>
        </div>
        <div class="wow fadeInDown flex gap-6 items-center leading-[30px] text-[#596780]">
          <div
            class="w-[78px] h-[78px] flex items-center justify-center rounded-2xl bg-[#F6F9FF] text-center shrink-0 lg:w-16 lg:h-16"
          >
            <svg-icon svg-class="w-8 h-8 text-[#3269F0] lg:w-6 lg:h-6" name="badge" />
          </div>
          <p>
            {{
              $t(
                '我们的理念是“因 AI 而强大”，这准确地表达了我们对 AI 技术的信心和承诺。我们相信，AI技术将会改变未来的世界，让我们的生活变得更加便捷和智能化。我们将一直秉持这一理念，不断推动AI 技术的发展，为客户提供更加优质的服务和产品。'
              )
            }}
          </p>
        </div>
        <div class="wow fadeInDown flex gap-6 items-center leading-[30px] text-[#596780]">
          <div
            class="w-[78px] h-[78px] flex items-center justify-center rounded-2xl bg-[#F6F9FF] text-center shrink-0 lg:w-16 lg:h-16"
          >
            <svg-icon svg-class="w-8 h-8 text-[#3269F0] lg:w-6 lg:h-6" name="group" />
          </div>
          <p>
            {{
              $t(
                '我们的优势在于专业性和可信赖性。我们的技术团队由一批拥有多年 AI领域经验的专业人士组成，能够为客户提供最先进的解决方案。我们还与国内外多家知名企业合作，共同推动AI 技术的发展。如果您对我们的公司和产品感兴趣，欢迎随时联系我们，我们将竭诚为您服务！'
              )
            }}
          </p>
        </div>
      </section>
    </div>
  </div>
</template>
<script lang="ts" setup>
import useImagePath from '@/composables/useImagePath'
import { useLocales } from '@/stores/locales'
import { onMounted } from 'vue'
import WOW from 'wow.js'

const { ImagePath } = useImagePath('nash')
const { setLocale } = useLocales()

onMounted(() => {
  const wow = new WOW({
    offset: 50, // 定义浏览器视口底部与隐藏框顶部之间的距离。当用户滚动并到达此距离时，隐藏的框会显示出来。
    mobile: true, // 在移动设备上打开/关闭 WOW.js。
    live: true, // 在页面上同时检查新的 WOW 元素。
    scrollContainer: '#nashContainer'
  })
  wow.init()
})
</script>
