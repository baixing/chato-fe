<template>
  <div class="flex flex-col">
    <h3 class="mt-6 ml-5 mb-3 text-sm font-medium leading-[22px]">{{ $t('对话列表') }}</h3>
    <ul class="w-[180px] px-3 py-2 flex-1 overflow-y-auto">
      <li
        v-for="item in chatList"
        :key="item.id"
        :class="[
          'h-12 px-3 flex items-center gap-[6px] rounded-lg cursor-pointer mb-2 text-sm leading-[22px] hover:bg-[#f2f3f5] transition-colors',
          route.params.botSlug === item.slug && 'bg-[#f2f3f5]'
        ]"
        @click="onLinkToChat(item.slug)"
      >
        <img :src="item.avatar" alt="" class="w-7 h-7 rounded-full object-cover" />
        <span class="inline-block truncate">{{ item.name }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useChatStore } from '@/stores/chat'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const chatStoreI = useChatStore()
const { chatList } = storeToRefs(chatStoreI)

const onLinkToChat = (slug: string) => {
  router.replace(`/c/bot/${slug}`)
  chatStoreI.switchChatingInfo(slug)
}
</script>
