<template>
  <div
    v-loading="initing"
    class="flex items-center justify-between p-5 bg-[#E5ECF7] rounded text-xs gap-3 mb-5 lg:flex-col lg:items-start"
  >
    <p class="leading-5">
      <span class="text-[#0256FF] text-lg mr-3">
        {{
          t(
            SpaceCommercialTypeMapper?.[spaceRightsSummary?.type] ||
              SpaceCommercialTypeMapper[ESpaceCommercialType.free]
          )
        }}
      </span>
      <span class="inline-block flex-1 text-[#9DA3AF]">{{ expireTime }}</span>
    </p>
    <el-button
      link
      size="small"
      class="!text-[#596780] !p-0 shrink-0 hover:!opacity-80"
      @click="onUpgrade"
      >{{ $t('升级/续费版本，享更多专属权益及服务 >') }}</el-button
    >
  </div>

  <div class="flex flex-wrap gap-5">
    <div v-for="item in spaceRightsCardList" :key="item.icon" class="rights-card lg:!w-full">
      <div
        class="rounded-lg w-8 h-8 flex items-center justify-center shrink-0"
        :style="`background-color: ${item.bg};`"
      >
        <svg-icon :name="item.icon" svg-class="text-white w-4 h-4" />
      </div>
      <div class="text-[#3D3D3D]">
        <p class="text-base font-medium">{{ item.title }}</p>
        <p class="text-[#9DA3AF] text-sm mb-3 mt-5">{{ item.desc }}</p>
        <p class="text-lg font-medium">{{ `${item.consume}/${item.total}` }}</p>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { getSpaceRightsSummary } from '@/api/space'
import useSpaceRights from '@/composables/useSpaceRights'
import { SpaceCommercialTypeMapper } from '@/constant/space'
import { ESpaceCommercialType, ESpaceRightsType } from '@/enum/space'
import type { ISpaceRightsSummary } from '@/interface/space'
import dayjs from 'dayjs'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const defaultCardList = {
  domain: {
    bg: '#4381FF',
    icon: 'magic-cube',
    title: t('训练机器人'),
    desc: t('已训练/总数'),
    consume: 0,
    total: 0
  },
  quota: {
    bg: '#1CC29D',
    icon: 'battery',
    title: t('电力值'),
    desc: t('已使用量/总量'),
    consume: 0,
    total: 0
  },
  group: {
    bg: '#F3C137',
    icon: 'chat-bubble',
    title: t('群聊数'),
    desc: t('已创建数/总数'),
    consume: 0,
    total: 0
  },
  member: {
    bg: '#7C5CFC',
    icon: 'user-group',
    title: t('空间用户数'),
    desc: t('已添加用户数/总数'),
    consume: 0,
    total: 0
  },
  painting: {
    bg: '#08C3D8',
    icon: 'picture',
    title: t('图像值'),
    desc: t('已生成/总数'),
    consume: 0,
    total: 0
  }
}

const initing = ref(false)
const spaceRightsSummary = ref<ISpaceRightsSummary>()
const spaceRightsCardList = ref([])
const { checkRightsTypeNeedUpgrade } = useSpaceRights()

const onUpgrade = () => {
  checkRightsTypeNeedUpgrade(ESpaceRightsType.default)
}

const expireTime = computed(() => {
  if (!spaceRightsSummary.value?.expire_time) {
    return ''
  }
  return dayjs(spaceRightsSummary.value.expire_time).format('YYYY/MM/DD') + t(' 到期')
})

const init = async () => {
  try {
    initing.value = true
    const {
      data: { data }
    } = await getSpaceRightsSummary()
    const { domain_num, quota, wx_group_num, account_num, image_quota } = data
    spaceRightsSummary.value = data
    const resCardList = {
      domain: {
        ...defaultCardList.domain,
        consume: domain_num.consume,
        total: domain_num.total
      },
      quota: {
        ...defaultCardList.quota,
        consume: quota.consume,
        total: quota.total
      },
      group: {
        ...defaultCardList.group,
        consume: wx_group_num.consume,
        total: wx_group_num.total
      },
      member: {
        ...defaultCardList.member,
        consume: account_num.consume,
        total: account_num.total
      },
      painting: {
        ...defaultCardList.painting,
        consume: image_quota.consume,
        total: image_quota.total
      }
    }
    spaceRightsCardList.value = Object.values(resCardList)
  } catch (err) {
  } finally {
    initing.value = false
  }
}

init()
</script>
<style lang="scss" scoped>
.rights-card {
  background-color: white;
  border: 1px solid #e4e7ed;
  box-sizing: border-box;
  border-radius: 8px;
  padding: 24px;
  display: flex;
  gap: 16px;
  width: calc(33% - 10px);
}
</style>
