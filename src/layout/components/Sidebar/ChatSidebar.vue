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
        <img :src="item.avatar || DefaultAvatar" alt="" class="w-7 h-7 rounded-full object-cover" />
        <span class="inline-block truncate">{{ item.name }}</span>
      </li>
    </ul>
    <el-button
      round
      type="primary"
      class="relative w-32 mt-3 mb-2 self-center"
      size="large"
      @click="handeGoCreate"
    >
      <svg-icon name="block-plus" svg-class="w-5 h-5" />
      {{ $t('创建机器人') }}
    </el-button>
    <el-button
      type="primary"
      class="relative w-32 mt-3 mb-2 self-center"
      size="large"
      @click="jumpToSquare()"
    >
      <svg-icon name="cube-filled" svg-class="w-6 h-6" />
      {{ $t('资源广场') }}
    </el-button>
    <!--     
    <button
      class="mt-3 w-32 px-4 py-2 text-sm leading-[22px] rounded-lg bg-[#7c5cfc] hover:opacity-75 text-white transition-colors self-center border-none mb-2"
      @click="jumpToSquare()">
      {{ $t('资源广场') }}
    </button> -->
  </div>
</template>

<script setup lang="ts">
import DefaultAvatar from '@/assets/img/avatar.png'
import { useChatStore } from '@/stores/chat'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { RoutesMap } from '@/router'

const props = withDefaults(
  defineProps<{
    prefix: string
  }>(),
  {
    prefix: '/c'
  }
)

const route = useRoute()
const router = useRouter()
const chatStoreI = useChatStore()
const { chatList } = storeToRefs(chatStoreI)

const emit = defineEmits(['to_square', 'hide_square'])
const onLinkToChat = (slug: string) => {
  emit('hide_square', 'hide')
  router.replace(`${props.prefix}/bot/${slug}`)
  chatStoreI.switchChatingInfo(slug)
}

async function jumpToSquare() {
  emit('to_square', 'show')
}

const handeGoCreate = () => {
  router.push({ name: RoutesMap.manager.create })
}
</script>
