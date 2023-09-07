<template>
  <div class="home-center-padding">
    <div
      class="pt-[210px] pb-[88px] px-[118px] relative text-[28px] leading-[50px] text-center lg:text-xl lg:px-4 lg:pt-32 lg:pb-16"
    >
      <h2 class="font-normal lg:px-2 lg:mb-4">
        {{ $t('各个行业、各种规模的公司都适合使用 Chato') }}
      </h2>
      <h2 class="font-normal lg:px-2">
        {{ $t('用 Chato，连接企业智慧，超越传统运营，实现 AI 赋能') }}
      </h2>
      <div class="flex gap-8 flex-wrap justify-center mt-16 lg:gap-3 lg:mt-10">
        <div
          v-for="(item, index) in caseTypeList"
          :key="item.icon"
          :style="{ background: item.bg }"
          :id="`Chato_case_industry_${index + 1}`"
          data-sensors-click
          class="case-type-card lg:!w-16 lg:!h-16 lg:!text-sm lg:!gap-1 lg:!rounded-xl"
        >
          <svg-icon :name="item.icon" svg-class="w-8 h-8 lg:w-5 lg:h-5"></svg-icon>
          <span>{{ item.title }} </span>
        </div>
        <div
          data-sensors-click
          id="Chato_case_industry_7"
          class="case-type-card !text-sm !gap-1 lg:!w-16 lg:!h-16 lg:!text-xs lg:!rounded-xl"
          style="background: linear-gradient(144deg, #356bff -29%, #35a4ff -29%, #e96dff 131%)"
        >
          <span>{{ $t('100+个方案') }}</span>
          <span>{{ $t('行业方案') }}</span>
        </div>
      </div>
      <div
        class="absolute top-[147px] left-[248px] w-64 h-64 rounded-full gray-lg-bg lg:left-[40px] lg:top-[100px]"
      ></div>
      <div
        class="absolute top-[170px] left-[277px] w-5 h-5 rounded-full green-lg-bg lg:left-[70px] lg:top-[130px]"
      ></div>
      <div
        class="absolute top-[232px] right-[200px] w-3 h-3 rounded-full blue-lg-bg lg:right-[40px] lg:top-[190px]"
      ></div>
    </div>

    <template v-for="(item, index) in caseList" :key="`case_item_${index}`">
      <div class="text-4xl font-medium text-center mb-10 lg:text-2xl">
        {{ $t('行业案例：{msg}', { msg: item.title }) }}
      </div>
      <div
        class="w-full grid grid-cols-[1fr_2fr] rounded-[28px] overflow-hidden border border-solid border-[#E4E7ED] mb-24 lg:grid-cols-1 lg:mb-12"
      >
        <div
          class="bg-[#F4F8FF] px-6 py-9 text-[#596780] text-base leading-6 border-r border-[#E4E7ED]"
        >
          <div class="flex gap-3 items-center mb-6">
            <img :src="item.logo" class="w-16 h-16 rounded-full object-cover" />
            <div class="flex-1">
              <p class="text-[#3D3D3D] text-base font-medium leading-6">{{ item.company }}</p>
              <div class="flex gap-2 flex-wrap mt-3">
                <span
                  v-for="(tagItem, tagIndex) in item.tags"
                  :key="`case_${index}_tag_${tagIndex}`"
                  class="px-2 py-1 text-[#596780] text-xs bg-white rounded"
                >
                  {{ tagItem }}
                </span>
              </div>
            </div>
          </div>
          <p v-if="item.companyDescTitle" class="text-xl text-[#303133] font-medium mb-5">
            {{ item.companyDescTitle }}
          </p>
          <div class="space-y-4">
            <p
              v-for="(descItem, descIndex) in item.companyDesc"
              :key="`case_${index}_desc_${descIndex}`"
            >
              {{ descItem }}
            </p>
          </div>
          <p class="text-xl text-[#303133] font-medium mt-10 mb-5 lg:mt-5 lg:mb-2 lg:text-base">
            {{ $t('客户概况') }}
          </p>
          <div class="space-y-4 lg:space-y-2">
            <p
              v-for="(introItem, introIndex) in item.companyCustomerIntro"
              :key="`case_${index}_intro_${introIndex}`"
            >
              {{ introItem }}
            </p>
          </div>
        </div>
        <div class="bg-white px-16 py-10 text-[#3D3D3D] text-sm leading-5 shrink-0 lg:px-6">
          <p class="text-lg font-medium leading-5 mb-6">{{ $t('需求和痛点') }}</p>
          <ul class="list-disc space-y-4 pl-4 marker:text-[#B5BED0] mb-10">
            <li
              v-for="(needsItem, needsIndex) in item.needs"
              :key="`case_${index}_needs_${needsIndex}`"
            >
              {{ needsItem }}
            </li>
          </ul>
          <p class="text-lg font-medium leading-5 mb-6 text-[#7C5CFC]">{{ $t('解决方案') }}</p>
          <ul class="list-disc space-y-4 pl-4 marker:text-[#B5BED0]">
            <li v-for="(solItem, solIndex) in item.solution" :key="`case_${index}_sol_${solIndex}`">
              {{ solItem }}
            </li>
          </ul>
          <el-button
            link
            type="primary"
            size="large"
            id="Chato_case_create_bot_click"
            :data-sensors-case-bot-name="item.company"
            class="mt-12 !font-normal lg:mt-6"
            @click="onEnter"
          >
            {{ $t('立即体验 Chato') }}
          </el-button>
        </div>
      </div>
    </template>
  </div>
  <div class="line-grad-bg home-center-padding text-white py-16 text-center lg:py-12">
    <p class="mb-5 text-2xl font-medium lg:px-8">{{ $t('Chato 期待与各行各业的伙伴共同成长') }}</p>
    <p class="mb-10 leading-6">
      {{ $t('我们致力于为您提供定制化的产品解决方案，用 AI 来提升业务的效率') }}
    </p>
    <div class="flex gap-7 items-center justify-center lg:gap-3">
      <el-button
        class="w-[150px] !h-10 !border-none !bg-[#303133] !text-white rounded-lg !text-sm font-medium tracking-[0.08em] lg:w-24 lg:!h-9 lg:!text-xs hover:!scale-105"
        type="primary"
        id="Chato_case_bottom_experience_click"
        @click="onEnter()"
      >
        {{ $t('体验 Chato') }}
      </el-button>
      <el-button
        class="w-[150px] !h-10 !text-[#303133] !bg-white !border-none rounded-lg !text-sm font-medium tracking-[0.08em] lg:w-24 lg:!h-9 lg:!text-xs hover:!scale-105"
        type="primary"
        plain
        :icon="ChatDotRound"
        @click="onEnter('Chato_case_bottom_wechat_click')"
      >
        {{ $t('微信联系') }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import CompanyAIImg from '@/assets/img/home-case/company-ai.png'
import CompanyBXImg from '@/assets/img/home-case/company-bx.png'
import CompanyDDImg from '@/assets/img/home-case/company-dd.png'
import CompanyJMImg from '@/assets/img/home-case/company-jm.png'
import CompanySTYImg from '@/assets/img/home-case/company-sty.png'
import CompanyWMImg from '@/assets/img/home-case/company-wm.png'
import { ChatDotRound } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const emit = defineEmits(['enter'])

const onEnter = () => {
  emit('enter')
}

const caseTypeList = [
  { icon: 'teaching', title: t('教培'), bg: 'linear-gradient(148deg, #05FF8E -19%, #52C8FF 134%)' },
  { icon: 'heart', title: t('咨询'), bg: 'linear-gradient(153deg, #4278F6 -38%, #51C8FF 111%)' },
  { icon: 'media', title: t('新媒体'), bg: 'linear-gradient(148deg, #356BFF -185%, #FD83FF 134%)' },
  { icon: 'drinking', title: t('门店'), bg: 'linear-gradient(144deg, #FF4C72 -31%, #FFE873 136%)' },
  { icon: 'medical', title: t('医疗'), bg: 'linear-gradient(146deg, #4278F6 -51%, #51F3FF 104%)' },
  { icon: 'deed', title: t('房产'), bg: 'linear-gradient(146deg, #0DEEA7 -38%, #5AD0FF 128%)' }
]

const caseList = [
  {
    title: t('教育培训'),
    logo: CompanySTYImg,
    company: t('心聊康业'),
    tags: [t('教育培训'), t('营销获客'), t('私域运营')],
    companyDescTitle: '',
    companyCustomerIntro: [t('业务体量：10w+付费用户'), t('业务范围：家庭咨询、家庭教育')],
    companyDesc: [
      t('心聊康业是一家专注于家庭教育和家庭咨询课程的机构，多年来积累了近百个付费客户社群')
    ],
    needs: [
      t('社群缺乏标准化运营流程，活跃度低'),
      t('传统的门店获客方式效率低、成本高且效果不理想'),
      t('线下未成交客户容易流失')
    ],
    solution: [
      t('机器人进群持续促活，群内活跃度极高，平均一小时有 30+ 互动问答，深度挖掘客户需求线索'),
      t('用 AI 为卖点人拉人的私域裂变，3 天自然拉新 1200+ 精准客户'),
      t('转化路径清晰，后台可直接设置营销广告链接，提高转化率')
    ]
  },
  {
    title: t('餐饮零售'),
    logo: CompanyJMImg,
    company: t('吉玛咖啡'),
    tags: [t('餐饮'), t('新零售')],
    companyDescTitle: '',
    companyCustomerIntro: [t('业务范围：饮品制作、咖啡培训、熟豆零售')],
    companyDesc: [
      t(
        '吉玛咖啡深耕咖啡行业 21 年，从咖啡烘焙工厂到咖啡培训，再到自营的门店，在深圳当地颇有名气，口碑相传'
      )
    ],
    needs: [
      t('传统线下门店想搭建数字化体系，有限的人员难以同时兼顾一边服务客户一边处理软件'),
      t('以做口碑的拓客方式过于传统，想做私域群，但社群需要 24 小时处理群里的问题，费时费力'),
      t('设计门店营销活动没有思路，活动文案和推销话术产出效率低')
    ],
    solution: [
      t('创建并训练咖啡师推荐师机器人，帮助客户进行产品推荐和解答疑问，提升购买体验和销售效果'),
      t('通过引入群聊机器人维护社群，24 小时处理群内问题，提高社群运营效率'),
      t('利用机器人提供营销方案，设计门店营销活动并提供活动文案和推销话术，提高活动产出效率')
    ]
  },
  {
    title: t('医疗美容'),
    logo: CompanyWMImg,
    company: t('米娜美业'),
    tags: [t('医美')],
    companyDescTitle: '',
    companyCustomerIntro: [t('门店数量：全国 30 家门店'), t('业务范围：皮肤管理')],
    companyDesc: [
      t(
        'wake me 拥有 32 年的韩国美业教育背景，引进国际标准化容颜管理体系，以做您可信赖的皮肤顾问为服务宗旨，通过科学的管理，唤醒美、守护美！'
      )
    ],
    needs: [
      t('门店员工频繁回答重复问题，浪费时间和资源'),
      t('需要在各大社交平台推荐产品、护肤知识，有大量的文案撰写需求'),
      t('需要定期输出创意营销方案来支持推广和获客')
    ],
    solution: [
      t('创建护肤知识库机器人，提供专业信息查询和答疑，快速匹配适合客户的项目并提供详细说明'),
      t('创建品牌文案机器人，根据不同平台调整内容，提供个性化推荐'),
      t('创建营销专员机器人，撰写医美行业的销售和获客方案')
    ]
  },
  {
    title: t('婚恋服务'),
    logo: CompanyAIImg,
    company: t('恋 AI 脑'),
    tags: [t('婚恋')],
    companyDescTitle: '',
    companyCustomerIntro: [t('业务范围：红娘服务、情感咨询')],
    companyDesc: [
      t(
        '「恋 AI 脑」项目针对传统婚恋服务的痛点，并基于对 AI 时代的洞察，由创始人元彬先生与初创团队共同开启。通过引入「 AI 红娘」的方式，真正解决了婚恋行业的成本和效率问题，帮助红娘提升业绩。'
      )
    ],
    needs: [
      t('传统婚介形式落伍、用户需求沟通成本高'),
      t('获客难且成本高，这是目前婚恋行业的现状'),
      t('以“红娘”为代表的服务人员业务水平参差不齐，并且人员成本高昂')
    ],
    solution: [
      t('利用 AI 绘图的能力，既满足了年轻人的好奇心，又有效地调研客户信息'),
      t(
        '以 AI 为卖点吸引客户，降低获客成本；同时，利用 AI 在线承接客户并进行精准引导，提高了获客的精准度'
      ),
      t(
        '7x24 小时在线增加了服务时长；从 1 对 1 转变为 1 对多，增加了客户服务数量；通过 AI 接待客户替代传统红娘，加速了沟通并提升了服务质量。每位红娘的服务能力可达到原业绩的 5-10 倍。'
      )
    ]
  },
  {
    title: t('分类信息'),
    logo: CompanyBXImg,
    company: t('百姓网'),
    tags: [t('分类信息'), t('门户网站'), t('互联网')],
    companyDescTitle: '',
    companyCustomerIntro: [
      t('业务体量：国内领先的分类信息生态服务商'),
      t(
        '业务范围：为用户提供涵盖生活服务、招聘求职、房屋租售、二手交易、教育培训、同城交友等一站式本地生活服务信息平台，同时为中小微商户建立全方位的精准营销解决方案。'
      )
    ],
    companyDesc: [t('百姓网致力于创造以分类信息业务为平台、多条垂直业务线布局的生态圈。')],
    needs: [
      t('平台型互联网公司长期需要线上客服服务于 B 端和 C 端，提供售前和售后咨询事宜'),
      t('以往的线上机器人客服人工依赖高，需要长期 Q&A 语料库搭建，经历较长期的运营'),
      t('机器人客服回答不够灵活，整体回复率仅有 60%，约 40% 售前问题仍然依赖人工客服解决')
    ],
    solution: [
      t('引入 7x24 小时随时服务的机器人客服，提升在线服务时长，提高用户体验'),
      t('利用百姓网积累多年的 Q&A 语料库训练机器人客服，保证其根据业务自动处理用户问题'),
      t(
        '与传统机器人客服相比，回答灵活性大大提升，整体回复率提高到了 90%，售前问题的人工依赖率降低到了 10%。大幅缩减了人工客服的用人成本'
      )
    ]
  },
  {
    title: t('会展沙龙'),
    logo: CompanyDDImg,
    company: t('逐浪 AI 系列沙龙'),
    tags: [t('会议展览'), t('路演沙龙')],
    companyDescTitle: t('主办方'),
    companyCustomerIntro: [t('会议规模：每期 80-120 人')],
    companyDesc: [
      t(
        '得到高研院：面向创业者和高管的终身学习俱乐部，实现能力、视野、人脉的突破；目前上海校区有各行业的 4000+ 实干家校友。'
      ),
      t(
        '客齐集小聚： 2005 年在上海第一次进行客齐集聚会开始。间断持续 18 年，一直围绕最新技术讨论，是沪上著名的新技术探索者们的聚会。'
      )
    ],
    needs: [
      t(
        '人力成本高，路演现场需要根据活动规模，配备相应数量的工作人员来提供信息咨询和解答参会者的问题'
      ),
      t('传统的会议沙龙，工作人员需要逐一回答重复问题，服务效率较低'),
      t('信息传递不及时，参会者可能需要等待较长时间才能获得所需的信息')
    ],
    solution: [
      t('AI 会议助手承担信息咨询的任务，为现场减少了至少 5 名工作人员的配置，节约了会议成本'),
      t('AI 会议助手可以同时处理多个参会者的问题，提供快速、准确的回答，提高服务效率'),
      t('AI 会议助手提供实时信息，参会者可以随时获取所需的会议信息，提升了会议体验')
    ]
  }
]
</script>

<style lang="scss" scoped>
.gray-lg-bg {
  background: linear-gradient(246deg, #eff2f9 17%, rgba(239, 242, 249, 0) 83%);
  transform: rotate(180deg);
  z-index: -2;
}

.green-lg-bg {
  background: linear-gradient(180deg, #4afda7 0%, #9effd0 100%);
  z-index: -1;
}

.blue-lg-bg {
  background: linear-gradient(180deg, #4aa7fd 0%, #9ee0ff 100%);
  z-index: -1;
}

.case-type-card {
  @apply w-24 h-24 flex flex-col gap-4 items-center justify-center rounded-[20px] text-base text-white font-medium leading-4;
}

.line-grad-bg {
  background-image: linear-gradient(134deg, #0547ff -105%, #d683ff 137%);
}
</style>
