<template>
  <div class="w-3/4 max-w-[788px] text-center mt-16 mx-auto lg:w-full">
    <img
      src="@/assets/img/create-bot-success.png"
      class="w-[160px] h-[120px] object-cover mb-6 mx-auto"
    />
    <p class="text-lg font-medium text-[#303133] mb-3">{{ $t('创建成功') }}</p>
    <p class="text-xs text-[#9DA3AF] mb-8">
      {{ $t('前往以下环节，去优化您的机器人') }}
    </p>
    <el-row justify="start" :gutter="16" class="gap-y-4">
      <el-col v-for="item in GuideList" :key="item.route" :sm="24" :md="12" :lg="12">
        <div
          class="py-5 px-4 rounded-lg flex gap-3 items-center cursor-pointer bg-white hover:shadow-lg lg:py-4"
          @click="() => onLink(item.route)"
        >
          <svg-icon :name="item.icon" svg-class="w-12 h-12" />
          <div class="flex-1 text-left">
            <p class="text-[#303133] text-sm font-medium mb-1">
              {{ item.title }}
            </p>
            <p class="text-xs text-[#9DA3AF]">{{ item.desc }}</p>
          </div>
          <el-icon :size="16"><ArrowRight /></el-icon>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script lang="ts" setup>
import { RoutesMap } from '@/router'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const props = defineProps<{
  domainId: string
}>()

const router = useRouter()

const internalDomainId = computed(() => props.domainId)

const GuideList = [
  {
    icon: 'guide-user',
    title: t('形象'),
    desc: t('个性化配置界面上展示的各种元素'),
    route: RoutesMap.tranning.botUser
  },
  {
    icon: 'guide-personal',
    title: t('规则'),
    desc: t('设定机器人类型和背景信息'),
    route: RoutesMap.tranning.botPersona
  },
  {
    icon: 'guide-knowledge',
    title: t('知识'),
    desc: t('灌入学习素材并智能学习'),
    route: RoutesMap.tranning.botContentQA
  },
  {
    icon: 'guide-chat',
    title: t('对话'),
    desc: t('在对话中可不断验证和修正'),
    route: RoutesMap.tranning.botChat
  }
]

const onLink = (routeName: string) => {
  router.push({ name: routeName, params: { botId: internalDomainId.value } })
}
</script>
