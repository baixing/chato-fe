<template>
  <div class="overflow-hidden w-full h-[calc(100%-74px)] mt-[74px] flex bg-white">
    <ChatSidebar v-show="!isMobile" prefix="" style="border-right: 1px solid rgb(228, 231, 237)" />
    <div class="relative w-full" v-loading="loading">
      <span
        v-show="isMobile"
        @click="drawerVisible = true"
        class="inline-block w-fit cursor-pointer rounded-full absolute z-[999]"
      >
        <svg-icon name="menu-more" svg-class="w-10 h-10 text-[#303133] mt-1" />
      </span>
      <homeChatItem />
      <span
        @click="copyText(link)"
        class="flex w-fit cursor-pointer rounded-full absolute z-[999] top-0 right-0 h-14 items-center text-base pr-5"
      >
        <svg-icon name="share" svg-class="text-[#303133] mt-1 w-6 h-6" />
      </span>
    </div>
    <el-drawer
      v-model="drawerVisible"
      direction="ltr"
      :with-header="false"
      :show-close="false"
      :append-to-body="true"
      size="200"
      @handleClose="drawerVisible = false"
    >
      <ChatSidebar prefix="" />
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { useBasicLayout } from '@/composables/useBasicLayout'
import useGlobalProperties from '@/composables/useGlobalProperties'
import ChatSidebar from '@/layout/components/Sidebar/ChatSidebar.vue'
import dayjs from 'dayjs'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import homeChatItem from './components/homeChatItem.vue'

const { isMobile } = useBasicLayout()
const loading = ref(false)
const drawerVisible = ref<boolean>(false)
const link = window.location.href
const { $sensors, $copyText } = useGlobalProperties()
const { t } = useI18n()

const copyText = (str: string) => {
  scanCodeSuccessRBI()
  $copyText(str)
}

const scanCodeSuccessRBI = () => {
  $sensors?.track('chat_share', {
    name: t('分享成功'),
    type: 'chat_share',
    data: {
      time: dayjs().format('YYYY-MM-DD HH:mm:ss')
    }
  })
}
</script>
