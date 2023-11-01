<template>
  <el-popover
    v-model:visible="popoverVisible"
    placement="right"
    trigger="click"
    :show-arrow="false"
  >
    <template #reference>
      <li
        class="px-4 cursor-pointer h-9 flex items-center gap-2 rounded-lg bg-[#242A40] transition-colors hover:text-white"
      >
        <svg-icon name="question-circle" svg-class="w-4 h-4" />
        {{ $t('联系与帮助') }}
      </li>
    </template>
    <div class="bg-white rounded-lg flex flex-col text-[#3d3d3d] text-sm space-y-4 py-2 pl-2">
      <p
        v-for="item in helpList"
        :key="item.icon"
        @click.stop="onHelpClick(item.link)"
        class="hover:text-[#909399] cursor-pointer flex items-center gap-2 whitespace-nowrap"
      >
        <svg-icon :name="item.icon" svg-class="w-4 h-4" />
        {{ item.title }}
      </p>
    </div>
  </el-popover>
</template>

<script setup lang="ts">
import useSpaceRights from '@/composables/useSpaceRights'
import { ESpaceRightsType } from '@/enum/space'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSpaceStore } from '@/stores/space'
import { storeToRefs } from 'pinia'

const { t } = useI18n()
const spaceStore = useSpaceStore()
const { followPublicVisible } = storeToRefs(spaceStore)
const popoverVisible = ref(false)

const helpList = [
  { title: t('联系客服'), icon: 'wechat', link: 'contactUs' },
  { title: t('Chato社区'), icon: 'community', link: 'https://support.qq.com/products/600388/' },
  {
    title: t('用户手册'),
    icon: 'book-guide',
    link: 'https://baixingwang.feishu.cn/wiki/EZAPw0vwJiHBazkOCfLcMGYpnig'
  },
  { title: t('关注公众号'), icon: 'follow', link: 'followPublic' }
]

const { checkRightsTypeNeedUpgrade } = useSpaceRights()

const onHelpClick = (link: string) => {
  popoverVisible.value = false

  switch (link) {
    case 'contactUs':
      checkRightsTypeNeedUpgrade(ESpaceRightsType.default)
      break
    case 'followPublic':
      followPublicVisible.value = true
      break
    default:
      window.open(link)
      break
  }
}
</script>
