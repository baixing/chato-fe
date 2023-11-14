<template>
  <div :class="['mt-14 mb-14 md:mb-7 text-center text-[#3D3D3D]', requiredTopbar ? 'md:mt-0' : '']">
    <p class="text-3xl md:text-xl font-medium">
      {{ $t('Chato，好用的AI工具，让你快人一步！') }}
    </p>
    <p class="text-xs md:text-xs mt-6 mb-8 md:mt-3 md:mb-5">
      {{ $t('也可以上传素材资料，创建与众不同的专属助理机器人') }}
    </p>
    <el-button type="primary" size="large" class="mr-4" @click="handleGoChat">
      {{ $t('立即对话') }}
    </el-button>
    <el-button type="primary" class="relative" size="large" @click="handeGoCreate">
      <span
        class="text-xs inline-block absolute top-[-15px] right-[-15px] scale-90 px-2 py-1 rounded-full text-white bg-[#E6A23C]"
      >
        {{ $t('免费体验') }}
      </span>
      {{ $t('创建机器人') }}
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { RoutesMap } from '@/router'
import { useChatStore } from '@/stores/chat'
import { storeToRefs } from 'pinia'
import { useRouter, useRoute } from 'vue-router'

defineProps<{
  requiredTopbar: boolean
}>()

const router = useRouter()
const route = useRoute()
const chatStoreI = useChatStore()
const { chatList } = storeToRefs(chatStoreI)

const handleGoChat = () => {
  const name = route.name === RoutesMap.home.homeChat ? RoutesMap.home.homeChat : RoutesMap.chat.c

  router.push({
    name,
    params: {
      ...route.params,
      botSlug: chatList.value.length > 0 ? chatList.value[0].slug : ''
    }
  })
}

const handeGoCreate = () => {
  router.push({ name: RoutesMap.manager.create })
}
</script>
