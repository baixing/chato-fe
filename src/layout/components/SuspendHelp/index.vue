<template>
  <div
    v-if="!isMobile"
    class="bg-[#272F48] rounded-full w-11 h-11 flex items-center justify-center cursor-pointer fixed bottom-7 right-6 z-50"
    @click.stop="onShow"
  >
    <svg-icon name="question" svg-class="w-4 h-4 text-white" />
    <div
      v-show="visible"
      class="shadow-lg bg-white rounded-lg px-5 absolute -top-[138px] -right-3 flex flex-col"
    >
      <p
        v-for="item in helpList"
        :key="item.icon"
        @click.stop="onHelpClick(item.link)"
        class="text-[#303133] text-xs hover:text-[#7C5CFC] flex items-center py-3 whitespace-nowrap"
      >
        <svg-icon :name="item.icon" svg-class="w-4 h-4 mr-2" />
        {{ item.title }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBasicLayout } from '@/composables/useBasicLayout'
import useSpaceRights from '@/composables/useSpaceRights'
import { ESpaceRightsType } from '@/enum/space'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const visible = ref(false)

const helpList = [
  { title: t('联系客服'), icon: 'wechat', link: '' },
  { title: t('Chato社区'), icon: 'community', link: 'https://support.qq.com/products/600388/' },
  {
    title: t('用户手册'),
    icon: 'book-guide',
    link: 'https://baixingwang.feishu.cn/wiki/EZAPw0vwJiHBazkOCfLcMGYpnig'
  }
]

const { isMobile } = useBasicLayout()
const { checkRightsTypeNeedUpgrade } = useSpaceRights()

const onShow = () => {
  visible.value = true
}

const onHidden = () => {
  visible.value = false
}

const onHelpClick = (link: string) => {
  onHidden()

  if (link) {
    window.open(link)
  } else {
    checkRightsTypeNeedUpgrade(ESpaceRightsType.default)
  }
}

onMounted(() => {
  !isMobile.value && document.addEventListener('click', onHidden)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onHidden)
})
</script>
