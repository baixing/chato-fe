<template>
  <div class="flex flex-col">
    <h3 class="mt-6 ml-5 mb-3 text-sm font-medium leading-[22px]">{{ $t('对话列表') }}</h3>
    <ul class="w-[180px] px-3 py-2 flex-1 overflow-y-auto">
      <li
        key="chato 导航助手"
        :class="[
          'h-12 px-3 flex items-center gap-[6px] rounded-lg cursor-pointer mb-2 text-sm leading-[22px] hover:bg-[#f2f3f5] transition-colors'
          // route.params.botSlug === firstChatItem?.slug && 'bg-[#f2f3f5]'
        ]"
        @click="onLinkToNavigator()"
      >
        <img
          :src="`https://afu-1255830993.cos.ap-shanghai.myqcloud.com/chato_image/Chato.png`"
          alt=""
          class="w-7 h-7 rounded-full object-cover"
        />
        <span class="inline-block truncate">{{ `Chato浏览器` }}</span>
      </li>
      <li
        v-for="item in chatList"
        :key="item.id"
        :class="[
          'h-12 px-3 flex items-center gap-[6px] rounded-lg cursor-pointer mb-2 text-sm leading-[22px] hover:bg-[#f2f3f5] transition-colors',
          route.params.botSlug === item.slug && 'bg-[#f2f3f5]'
        ]"
        @click="onLinkToChat(item.slug)"
      >
        <Avatar
          :avatar="item.avatar || DefaultAvatar"
          :size="28"
          :name="item.name.slice(0, 2)"
          class="w-7 h-7 rounded-full shrink-0 overflow-hidden"
        />
        <span class="inline-block truncate">{{ item.name }}</span>
      </li>
    </ul>
    <div
      class="w-[180px] px-3 py-2 overflow-y-auto"
      style="border-top: 1px solid rgb(228, 231, 237)"
    >
      <div
        @click="handeGoCreate"
        class="h-12 px-3 flex items-center gap-[6px] rounded-lg cursor-pointer mb-2 text-sm leading-[22px] hover:bg-[#f2f3f5] transition-colors"
      >
        <svg-icon name="block-plus" svg-class="w-5 h-5 mr-2" style="font-size: 22px" />
        {{ $t('创建机器人') }}
      </div>

      <div
        @click="jumpToSquare()"
        class="h-12 px-3 flex items-center gap-[6px] rounded-lg cursor-pointer mb-2 text-sm leading-[22px] hover:bg-[#f2f3f5] transition-colors"
      >
        <svg-icon name="square_1" svg-class="w-5 h-5 mr-2" style="font-size: 22px" />
        {{ $t('探索机器人') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import DefaultAvatar from '@/assets/img/avatar.png'
import { useChatStore } from '@/stores/chat'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { RoutesMap } from '@/router'
import { ref, watch } from 'vue'

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
  router.replace(`${props.prefix}/bot/square`)
  console.log(route.path)
}

const handeGoCreate = () => {
  router.push({ name: RoutesMap.manager.create })
}
</script>
