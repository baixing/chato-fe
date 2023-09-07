<template>
  <div class="home-center-padding">
    <h2
      class="font-medium text-[50px] leading-[72px] mt-[125px] text-[#303133] text-center tracking-[4px] lg:text-3xl lg:leading-[40px] lg:mt-32"
    >
      {{ $t('基于知识库轻松定制') }}
    </h2>
    <div class="flex justify-center items-center mt-1 mb-[35px] h-24 lg:mb-4 lg:mt-1 lg:h-12">
      <span
        id="Chato_rolling_click"
        data-sensors-click
        @click="onEnter()"
        class="font-medium text-center bg-clip-text text-transparent text-[64px] leading-[95px] min-h-[95px] tracking-[8px] lg:text-[32px] lg:leading-[48px] lg:min-h-[48px] lg:tracking-[1px] line-grad-bg"
      >
        {{ title }}
      </span>
      <svg-icon svg-class="w-4 h-[75px] lg:w-2 lg:h-9" name="home_play" />
    </div>
    <section class="text-lg leading-9 text-[#696984] text-center lg:text-sm lg:leading-7">
      <p>
        {{ $t('只需上传学习素材或添加提示语，') }}<br class="hidden lg:block" />{{
          $t('即可获得独特个性和超强能力的专属助理机器人。')
        }}
      </p>
      <p>
        {{ $t('Chato 帮助企业先人一步运用 AI 理念，') }}<br class="hidden lg:block" />
        {{ $t('释放难以想象的产出与价值。') }}
      </p>
    </section>
    <div class="text-center flex gap-8 items-center justify-center lg:gap-4">
      <el-button
        class="w-[228px] !h-[60px] !text-lg font-medium tracking-[0.08em] !rounded-lg mt-7 !ml-0 hover:!scale-105 lg:!text-sm lg:w-[153px] lg:!h-[45px] lg:mt-5 !border-none btn-grad shadow-lg"
        type="primary"
        id="Chato_top_create_click"
        @click="onEnter()"
      >
        {{ $t('20S快速创建机器人') }}
      </el-button>
      <el-button
        id="Chato_top_video_click"
        class="w-[228px] !h-[60px] !text-lg font-medium tracking-[0.08em] !rounded-lg mt-7 !ml-0 hover:!scale-105 lg:!text-sm lg:w-[153px] lg:!h-[45px] lg:mt-5 !border-none !bg-[white] !text-[#303133] shadow-lg"
        @click="onEnter('Chato_top_video_click')"
      >
        <template #icon>
          <el-icon :size="18" class="mr-1"><VideoPlay /></el-icon>
        </template>
        {{ $t('观看视频') }}
      </el-button>
    </div>
    <IndustryCase />
  </div>
  <div class="line-grad-bg pt-20 pb-24 mb-32 home-center-padding lg:!px-2 lg:pt-9 lg:pb-9">
    <h3 class="mb-12 text-white text-center text-5xl font-medium lg:mb-8 lg:text-2xl">
      {{ $t('如何训练 AI 数字员工') }}
    </h3>
    <div :class="dynamicClasses.flexClass">
      <div class="lg:w-full lg:pl-3">
        <p class="text-[#303133] text-2xl font-medium leading-10 text-left lg:text-base">
          {{ $t('AI 驱动的') }}<br class="lg:hidden" />{{ $t('基于企业私有数据的')
          }}<br class="lg:hidden" />{{ $t('AI 数字员工') }}
        </p>
        <div class="mt-6 mb-8 flex flex-col gap-5 lg:text-center lg:gap-3 lg:my-5">
          <p class="text-[#596780] font-medium text-sm leading-5 flex gap-2 items-center">
            <svg-icon name="selected-circle" svg-class="text-[#7c5cfc] w-4 h-4" />
            <span>{{ $t('使用企业数据打造专属大模型') }}</span>
          </p>
          <p class="text-[#596780] font-medium text-sm leading-5 flex gap-2 items-center">
            <svg-icon name="selected-circle" svg-class="text-[#7c5cfc] w-4 h-4" />
            <span>{{ $t('技术成品降低，提高效率') }}</span>
          </p>
          <p class="text-[#596780] font-medium text-sm leading-5 flex gap-2 items-center">
            <svg-icon name="selected-circle" svg-class="text-[#7c5cfc] w-4 h-4" />
            <span>{{ $t('嵌入到各个地方') }}</span>
          </p>
        </div>
        <el-button
          type="primary"
          id="Chato_tranning_more_click"
          class="!border-none font-bold !h-12 w-40 lg:!h-10 lg:w-28"
          @click="onEnter()"
        >
          {{ $t('了解更多') }}
        </el-button>
      </div>
      <el-image :src="homeStepImg" class="!w-[65%] h-auto lg:!w-full lg:mb-8" fit="cover" lazy />
    </div>
  </div>
  <div class="home-center-padding">
    <h3
      class="text-5xl leading-[72px] font-medium text-[#303133] text-center lg:text-[26px] lg:leading-[38px]"
    >
      {{ $t('Chato 如何实现') }}
      <strong class="tracking-[0.08em] bg-clip-text text-transparent line-grad-bg">
        {{ $t('定制化') }}</strong
      >
    </h3>
    <div class="text-base leading-9 mt-6 text-center text-[#696984]">
      {{ $t('Chato 可以设定角色和学习自己的知识库，') }}
      <br class="hidden lg:block" />
      {{ $t('定制独特个性和超强能力的专属机器人。') }}
    </div>

    <el-row class="learn-row lg:!mx-0 lg:!mt-10" :gutter="10">
      <el-col
        :span="8"
        :xs="24"
        class="wow fadeInDown learn-card"
        style="display: flex; justify-content: center"
      >
        <el-space direction="vertical">
          <svg-icon svg-class="w-[38px] h-[38px]" color="#596780" name="home_user" />
          <span class="learn-title"> {{ $t(' 角色设定 ') }}</span>
          <span class="learn-msg">
            {{ $t('给机器人设定一个基础角色，可以是') }}<br />
            {{ $t('客服、销售、培训师、营销人员、行业专家') }}<br />
            {{ $t('等，让机器人更符合您的业务形象。') }}
          </span>
        </el-space>
      </el-col>

      <el-col
        :span="8"
        :xs="24"
        class="wow fadeInDown learn-card"
        style="display: flex; justify-content: center"
      >
        <el-space direction="vertical">
          <svg-icon color="#596780" svg-class="w-[38px] h-[38px]" name="home_book" />
          <span class="learn-title"> {{ $t(' 上传文档并建立知识库 ') }}</span>
          <span class="learn-msg">
            {{ $t('通过录入文档或问答来创建知识库，') }}<br />{{
              $t('让机器人学习，根据机器人训练情况，')
            }}<br />{{ $t('可随时删除或替换文档。') }}
          </span>
        </el-space>
      </el-col>
      <el-col
        :span="8"
        :xs="24"
        class="wow fadeInDown learn-card"
        style="display: flex; justify-content: center"
      >
        <el-space direction="vertical">
          <svg-icon color="#596780" svg-class="w-[38px] h-[38px]" name="home_doc" />
          <span class="learn-title">{{ $t(' 为答案提供来源 ') }}</span>
          <span class="learn-msg">
            {{ $t('发布前支持演示验收，') }}<br />{{ $t('机器人的答案可附带文档来源，') }}<br />{{
              $t('回答有理有据，训练效果满意后再发布。')
            }}
          </span>
        </el-space>
      </el-col>
    </el-row>

    <el-row class="learn-row lg:!mx-0 lg:!mt-0" :gutter="10">
      <el-col
        :span="8"
        :xs="24"
        class="wow fadeInDown learn-card"
        style="display: flex; justify-content: center"
      >
        <el-space direction="vertical">
          <svg-icon color="#596780" svg-class="w-[38px] h-[38px]" name="home_release" />
          <span class="learn-title">{{ $t(' 多终端发布渠道 ') }}</span>
          <span class="learn-msg">
            {{ $t('满足多种业务场景，为您服务各渠道客户。') }}<br />{{
              $t('包括网页、微信群、JS 嵌入网页、接入API， ')
            }}
            <br />{{ $t('更多发布形式持续升级中。') }}
          </span>
        </el-space>
      </el-col>

      <el-col
        :span="8"
        :xs="24"
        class="wow fadeInDown learn-card"
        style="display: flex; justify-content: center"
      >
        <el-space direction="vertical">
          <svg-icon color="#596780" svg-class="w-[38px] h-[38px]" name="home_heart" />
          <span class="learn-title">{{ $t(' 帮您服务客户 ') }}</span>
          <span class="learn-msg">
            {{ $t('支持自定义互动界面，') }}<br />{{ $t('作为您公司业务的专业形象，') }}<br />{{
              $t('为您 7*24 小时服务客户。')
            }}
          </span>
        </el-space>
      </el-col>
      <el-col
        :span="8"
        :xs="24"
        class="wow fadeInDown learn-card"
        style="display: flex; justify-content: center"
      >
        <el-space direction="vertical">
          <svg-icon color="#596780" svg-class="w-[38px] h-[38px]" name="home_data" />
          <span class="learn-title">{{ $t(' 查看数据 ') }}</span>
          <span class="learn-msg">
            {{ $t('可查看使用数据，') }}<br />{{ $t('掌握机器人知识服务效果。') }}<br />{{
              $t('根据数据报表，可进一步优化机器人，')
            }}
            <br />{{ $t('让它更准确的回答业务知识。') }}
          </span>
        </el-space>
      </el-col>
    </el-row>

    <div class="mt-6 text-center mb-[100px] lg:mt-0 lg:mb-12">
      <el-button
        id="Chato_customize_click"
        type="primary"
        class="!h-[60px] w-[273px] !text-lg font-medium tracking-[0.08em] !border-none lg:!h-10 lg:w-32 lg:!text-sm"
        @click="onEnter()"
      >
        {{ $t('立即体验') }}
      </el-button>
    </div>
  </div>

  <div
    class="line-grad-bg home-center-padding py-20 text-white text-center mb-28 lg:mb-12 lg:py-10"
  >
    <h3 class="text-5xl leading-[72px] font-medium mb-6 lg:text-[26px] lg:leading-[38px]">
      {{ $t('Chato 优势') }}
    </h3>
    <p class="text-xl leading-9 mb-12 lg:mb-6 lg:text-base">
      {{ $t('Chato 不需要具备代码知识，预设海量模版，轻松上手使用。') }}
    </p>
    <div class="flex justify-between gap-5 lg:flex-col">
      <div
        v-for="(item, index) in serviceCardList"
        :key="item.icon"
        class="wow fadeInDown flex-1 flex flex-col justify-between rounded-2xl bg-white py-6 px-7 h-64 lg:h-auto lg:gap-3 lg:p-4"
      >
        <div class="service-card">
          <span
            class="w-14 h-14 flex items-center justify-center rounded-full overflow-hidden bg-[#7c5cfc1a] lg:w-12 lg:h-12"
          >
            <svg-icon :name="item.icon" svg-class="w-9 h-9 text-[#7c5cfc] lg:w-7 lg:h-7" />
          </span>
          <p class="text-xl font-medium tracking-[0.04em] text-[#3D3D3D] lg:text-base">
            {{ item.title }}
          </p>
          <div class="leading-6 text-left text-sm">
            <template v-if="index === 0">
              {{ $t('基于企业或超级个体的知识库训练自建模型，打造专属 AI 机器人，比如')
              }}<span style="color: #7c5cfc">{{ $t('知识库、内容、LOGO、URL') }}</span
              >{{ $t('等等。') }}
            </template>
            <template v-else-if="index === 1">
              {{ $t('API、JS、H5 等') }}<span style="color: #7c5cfc">{{ $t('多种发布形式') }}</span
              >{{ $t('，可将机器人运用于微信群、公众号、客户官网、APP、小程序、飞书等。') }}
            </template>
            <template v-else-if="index === 2">
              {{ $t('无需技术，') }}<span style="color: #7c5cfc">60＋</span
              >{{ $t('预设角色随时调用，') }}<span style="color: #7c5cfc">{{ $t('20 秒') }}</span
              >{{ $t('创建专属AI机器人') }}<span style="color: #7c5cfc">{{ $t('无限量') }}</span
              >{{ $t('多格式文档上传，精准学习。') }}
            </template>
            <template v-else-if="index === 3">
              {{ $t('专属训练师团队，') }}<span style="color: #7c5cfc">{{ $t('三对一服务') }}</span
              >{{ $t('针对客户业务定制专属 Prompts 和知识库，支持多人训练。') }}
            </template>
          </div>
        </div>
        <el-button
          link
          type="primary"
          :id="`Chato_know_more_click_${index + 1}`"
          @click="onEnter()"
        >
          {{ $t('进一步了解') }}
        </el-button>
      </div>
    </div>
  </div>

  <div class="home-center-padding">
    <h3
      class="text-5xl leading-[72px] font-medium text-[#303133] text-center lg:text-[26px] lg:leading-[38px]"
    >
      Chato
      <strong class="tracking-[0.08em] bg-clip-text text-transparent line-grad-bg">{{
        $t('企业服务')
      }}</strong>
    </h3>
    <p class="text-[#767676] text-xl leading-9 text-center mt-4">
      {{ $t('Chato 致力于为客户提供最贴心的服务和支持') }}
    </p>
    <el-row :gutter="40" class="mt-20 lg:mt-10 flex w-full justify-around !mx-0">
      <el-col
        :span="12"
        :xs="24"
        class="mb-0 lg:mb-10"
        style="display: flex; justify-content: center"
      >
        <svg-icon
          svg-class="my-10 w-[440px] h-[311px] lg:my-5 lg:w-[260px] lg:h-[180px]"
          name="home_personal_files"
        />
      </el-col>
      <el-col :span="12" :xs="24" style="align-self: center" class="wow fadeInRight advantage-card">
        <el-space direction="vertical" style="justify-content: flex-start; align-items: flex-start">
          <span class="advantage-title"> {{ $t('AI 训练师服务') }}</span>
          <div class="flex flex-row items-start mt-2">
            <svg-icon svg-class="advantage-icon" name="home_1" />
            <span class="advantage-msg">
              {{
                $t(
                  '专属训练师团队，三对一服务，确保每位客户都能得到充分的关注和支持。针对客户业务定制专属Prompts 和知识库，支持多人训练。'
                )
              }}
            </span>
          </div>
          <div class="flex flex-row items-start">
            <svg-icon svg-class="advantage-icon" name="home_2" />
            <span class="advantage-msg">
              {{ $t('无需自己训练，帮助客户将更多的注意力集中在核心业务上。') }}
            </span>
          </div>
        </el-space>
        <div class="w-full lg:text-center">
          <el-button
            type="primary"
            class="advantage-btn"
            data-inner-type="1"
            id="Chato_service_more_click_1"
            @click="onEnter()"
          >
            {{ $t('进一步了解') }}
          </el-button>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="40" class="mt-20 lg:mt-0 flex w-full justify-around lg:flex-col-reverse !mx-0">
      <el-col
        class="wow fadeInLeft advantage-card"
        :span="12"
        :xs="24"
        style="align-self: center; width: 100%"
      >
        <el-space direction="vertical" style="justify-content: flex-start; align-items: flex-start">
          <span class="advantage-title">{{ $t('大客户定制') }}</span>
          <div class="flex flex-row items-start mt-2">
            <svg-icon svg-class="advantage-icon" name="home_3" />
            <span class="advantage-msg">{{
              $t(
                '深入了解客户的业务模式、目标和挑战。我们的技术团队将与您紧密合作，进行需求分析和讨论，以确保我们能够为您提供最适合的解决方案。'
              )
            }}</span>
          </div>
          <div class="flex flex-row items-start">
            <svg-icon svg-class="advantage-icon" name="home_4" />
            <span class="advantage-msg">
              {{
                $t(
                  '与各行业的客户紧密合作，倾听和理解客户的业务需求，以确保我们的产品能够满足他们的期望。不断改进和优化产品功能，以解决客户在业务中遇到的问题。'
                )
              }}
            </span>
          </div>
        </el-space>
        <div class="w-full lg:text-center">
          <el-button
            type="primary"
            class="advantage-btn"
            id="Chato_service_more_click_2"
            @click="onEnter()"
          >
            {{ $t('进一步了解') }}
          </el-button>
        </div>
      </el-col>
      <el-col
        :span="12"
        :xs="24"
        class="mb-0 lg:mb-10"
        style="display: flex; justify-content: center"
      >
        <svg-icon
          svg-class="w-[440px] h-[311px] my-10 lg:w-[300px] lg:h-[220px] lg:my-5"
          name="home_powerful"
        />
      </el-col>
    </el-row>

    <el-row
      :gutter="40"
      class="mt-20 mb-[120px] lg:mb-[60px] lg:mt-0 flex w-full justify-around !mx-0"
    >
      <el-col
        :span="12"
        :xs="24"
        class="mb-0 lg:mb-10"
        style="display: flex; justify-content: center"
      >
        <svg-icon
          svg-class="w-[440px] h-[311px] my-10 lg:w-[300px] lg:h-[220px] lg:my-5"
          name="home_business_deal"
        />
      </el-col>
      <el-col :span="12" :xs="24" style="align-self: center" class="wow fadeInRight advantage-card">
        <el-space direction="vertical" style="justify-content: flex-start; align-items: flex-start">
          <span class="advantage-title">{{ $t('私有化部署') }}</span>
          <div class="flex flex-row items-start mt-2">
            <svg-icon svg-class="advantage-icon" name="home_6" />
            <span class="advantage-msg">
              {{
                $t(
                  '可提供完整的 API 接口，方便企业将定制化的 AI员工轻松部署到私有化系统中。如企业自己的 OA 系统、ERP系统等，保护用户信息及数据的安全性。'
                )
              }}
            </span>
          </div>
          <div class="flex flex-row items-start">
            <svg-icon svg-class="advantage-icon" name="home_7" />
            <span class="advantage-msg">
              {{
                $t(
                  '我们的产品不仅可以为用户提供高效的服务，还可以让用户放心地使用我们的产品，享受更加安全和可靠的体验。'
                )
              }}
            </span>
          </div>
        </el-space>
        <div class="w-full lg:text-center">
          <el-button
            type="primary"
            class="advantage-btn"
            id="Chato_service_more_click_3"
            @click="onEnter()"
          >
            {{ $t('进一步了解') }}
          </el-button>
        </div>
      </el-col>
    </el-row>

    <h3
      class="text-5xl leading-[72px] font-medium text-[#303133] text-center lg:text-[26px] lg:leading-[38px] tracking-[4px]"
    >
      {{ $t('常见')
      }}<strong class="tracking-[0.08em] bg-clip-text text-transparent line-grad-bg"
        >{{ $t('问题') }}
      </strong>
    </h3>
    <dl class="mt-10 w-full">
      <el-card shadow="hover" class="wow fadeInUp qa-card">
        <dt :class="dynamicClasses.textClass">
          {{ $t('Chato的接口是否开放？可以与企业其他系统集成？') }}
        </dt>
        <dd class="text-base leading-[30px] mt-4 text-[#696984] lg:text-sm lg:mt-[14px]">
          {{
            $t(
              '是的，Chato 提供开放的 API，企业可以轻松将 Chato集成到已有系统当中，实现与企业业务流程的深度集成。'
            )
          }}
        </dd>
      </el-card>
      <el-card shadow="hover" class="wow fadeInUp qa-card">
        <dt :class="dynamicClasses.textClass">
          {{ $t('我不上传任何文档，它会回答吗？') }}
        </dt>
        <dd class="text-base leading-[30px] mt-4 text-[#696984] lg:text-sm lg:mt-[14px]">
          {{ $t('您的机器人仍可以回答常规问题，成为一个助理机器人，但是它不了解您的业务哦。') }}
        </dd>
      </el-card>
      <el-card shadow="hover" class="wow fadeInUp qa-card">
        <dt :class="dynamicClasses.textClass">
          {{ $t('我的语料很少，如何训练？') }}
        </dt>
        <dd class="text-base leading-[30px] mt-4 text-[#696984] lg:text-sm lg:mt-[14px]">
          {{
            $t(
              '可以对机器人进行基础的配置后，小范围上线试运营，一边在后台收集真实的常见问题，一边修正答案，快速形成业务知识库。'
            )
          }}
        </dd>
      </el-card>
    </dl>
  </div>

  <div
    class="quick-start-bg home-center-padding mt-[100px] mb-[50px] py-[74px] items-center lg:py-7 lg:mt-10 lg:mb-5 overflow-hidden flex justify-between gap-28 lg:flex-col lg:gap-0 lg:items-start"
  >
    <div
      class="flex flex-col items-start text-white flex-1 overflow-hidden lg:w-full lg:items-center"
    >
      <p class="text-[44px] font-medium tracking-[0.04em] mb-4 lg:text-3xl lg:leading-9">
        {{ $t('快速定制您的机器人') }}
      </p>
      <p class="text-lg leading-7 mb-6 lg:text-base lg:text-center">
        {{ $t('Chato 为你提供定制化的产品解决方案，我们致力于用 AI 来提升业务的效率') }}
      </p>

      <div class="flex gap-7 items-center justify-center mb-16 lg:gap-3 lg:mb-6">
        <el-button
          class="w-[150px] !h-10 !border-none !bg-white !text-[#7C5CFC] rounded-lg !text-sm font-medium tracking-[0.08em] lg:w-24 lg:!h-9 lg:!text-xs hover:!scale-105"
          type="primary"
          id="Chato_bottom_create_click"
          @click="onEnter()"
        >
          {{ $t('体验 Chato') }}
        </el-button>
        <el-button
          class="w-[150px] !h-10 !text-white !bg-transparent !border-[#ffffff33] rounded-lg !text-sm font-medium tracking-[0.08em] lg:w-24 lg:!h-9 lg:!text-xs hover:!scale-105"
          type="primary"
          plain
          :icon="ChatDotRound"
          @click="onEnter('Chato_bottom_conact_click')"
        >
          {{ $t('微信联系') }}
        </el-button>
      </div>

      <div
        class="flex justify-between items-center w-full max-w-[90%] lg:mb-6 lg:gap-4 lg:max-w-none"
      >
        <template v-for="(item, index) in introCountList" :key="`intro_count_${index}`">
          <div class="text-sm">
            <p class="text-3xl font-medium mb-4 flex items-center gap-1 lg:text-xl">
              {{ item.count }}
              <span class="text-base lg:text-sm">+</span>
            </p>
            <p class="lg:text-xs">{{ $t(item.name) }}</p>
          </div>
          <div v-if="index !== introCountList.length - 1" class="divider"></div>
        </template>
      </div>
    </div>

    <ScheduleCallback class="shrink-0" />
  </div>
</template>

<script setup lang="ts">
import useImagePath from '@/composables/useImagePath'
import { ELangKey } from '@/enum/locales'
import { useLocales } from '@/stores/locales'
import { ChatDotRound, VideoPlay } from '@element-plus/icons-vue'
import { storeToRefs } from 'pinia'
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import IndustryCase from './components/IndustryCase.vue'

const { ImagePath: homeStepImg } = useImagePath('step', 'home')
const { locale } = storeToRefs(useLocales())
const { t } = useI18n()

const dynamicClasses = computed(() => {
  if (locale.value === ELangKey.en) {
    return {
      textClass: 'text-[#303133] tracking-[2px] text-xl leading-[30px] font-medium lg:text-lg',
      flexClass:
        'rounded-3xl bg-[#F3F5FB] flex justify-space items-center py-14 lg:flex-col-reverse lg:px-4 lg:pt-5 lg:pb-6 lg:rounded-xl'
    }
  }

  return {
    textClass: 'text-[#303133] tracking-[4px] text-xl leading-[30px] font-medium lg:text-lg',
    flexClass:
      'rounded-3xl bg-[#F3F5FB] flex justify-around items-center py-14 lg:flex-col-reverse lg:px-4 lg:pt-5 lg:pb-6 lg:rounded-xl'
  }
})

const emit = defineEmits(['enter'])

const ScheduleCallback = defineAsyncComponent(
  () => import('./components/Schedule/ScheduleCallback.vue')
)

const list = [
  t('助理机器人'),
  t('翻译助理机器人'),
  t('信息调研机器人'),
  t('客服助理机器人'),
  t('销售助理机器人'),
  t('营销助理机器人'),
  t('短视频编导机器人'),
  t('活动策划机器人'),
  t('设计助理机器人'),
  t('育儿专家机器人')
]

const serviceCardList = [
  {
    title: t('企业专属定制'),
    icon: 'home-customize'
  },
  {
    title: t('应用场景广泛'),
    icon: 'home-application'
  },
  {
    title: t('使用方便快捷'),
    icon: 'home-light'
  },
  {
    title: t('提供训练服务'),
    icon: 'home-training'
  }
]

const introCountList = [
  { name: '模型调用量', count: '2,000,000' },
  { name: '机器人数', count: '100,000' },
  { name: '服务行业', count: '100' }
]

const title = ref('')
const index = ref(0)
const direction = ref(false)
const timer = ref(null)
const delay = ref(false)

function startTimer() {
  timer.value = setInterval(() => {
    clock()
  }, 150)
}

function clearTimer() {
  clearInterval(timer.value)
}

function clock() {
  if (title.value.length == list[index.value].length || direction.value) {
    if (!direction.value) {
      direction.value = true
      clearTimer()
      setTimeout(() => {
        startTimer()
      }, 500)
    } else {
      title.value = title.value.substring(0, title.value.length - 1)
    }
  } else {
    if (delay.value) {
      delay.value = false
    } else {
      delay.value = true
      title.value = list[index.value].substring(0, title.value.length + 1)
    }
  }

  if (title.value.length == 0) {
    direction.value = false
    index.value = (index.value + 1) % list.length
  }
}

const onEnter = (type?: string) => {
  emit('enter', type)
}

onMounted(() => {
  startTimer()
})

onBeforeUnmount(() => {
  clearTimer()
})
</script>

<style lang="scss" scoped>
.line-grad-bg {
  background-image: linear-gradient(117deg, #0547ff -84%, #d683ff 125%);
}
.justify-space {
  justify-content: space-evenly;
}
.btn-grad {
  background: linear-gradient(99deg, #4e4f50 0%, #5a5c60 0%, #303133 99%);
}

.quick-start-bg {
  background: linear-gradient(138deg, #0547ff -126%, #d683ff 141%);
}

.divider {
  width: 1px;
  height: 66px;
  background-color: rgba(255, 255, 255, 0.2);
}

.advantage-btn {
  @apply h-11 w-[140px] mt-[30px] text-base border-none lg:h-10 lg:w-32 lg:text-sm;
}

.learn-row {
  @apply mt-20 flex w-full justify-around;
}

.learn-card {
  @apply mb-0 flex justify-center lg:mb-10;
}

.learn-title {
  @apply text-[20px] font-medium text-[#303133] leading-[30px] text-center tracking-[4px] my-6 lg:text-[18px] lg:leading-[18px] lg:my-4;
}

.learn-msg {
  @apply text-base text-[#696984] leading-[30px] text-center lg:text-sm lg:leading-[26px];
}

.advantage-card {
  @apply mb-0 flex flex-col justify-center lg:mb-10;
}

.advantage-title {
  @apply text-3xl leading-[44px] text-[#303133] tracking-[4px] text-center mb-[30px] lg:text-lg lg:leading-[26px];
}

.advantage-msg {
  @apply text-base leading-7 lg:text-sm lg:leading-6 text-[#696984];
}

.advantage-icon {
  @apply w-4 h-4 mr-5 mt-2 inline-block shrink-0;
}

.qa-card {
  @apply box-border w-full rounded-2xl border border-solid border-[#DADAE1] mb-8 p-3 lg:mb-[22px] lg:p-2;
}

.service-card {
  @apply text-[#696984] text-base leading-7 tracking-[0.3px] flex items-center flex-col gap-4;
}
</style>
