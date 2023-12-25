<template>
  <div class="flex flex-col">
    <h3 class="mt-6 ml-5 mb-3 text-xs font-medium leading-[22px]">{{ $t('对话列表') }}</h3>
    <ul class="w-[220px] px-3 py-2 flex-1 overflow-y-auto">
      <li
        :class="[
          'h-12 px-3 flex items-center gap-[6px] rounded-lg cursor-pointer mb-2 text-xs leading-[22px] hover:bg-[#f2f3f5] transition-colors',
          route.params.botSlug === '-1' && 'bg-[#f2f3f5]'
        ]"
        @click="onLinkToChat()"
      >
        <Avatar
          avatar="https://afu-1255830993.cos.ap-shanghai.myqcloud.com/chato_image/avater/9e86008d23470bb068dfa4334f6730a4.jpg"
          :size="28"
          class="w-7 h-7 shrink-0 overflow-hidden"
        />
        <span class="inline-block truncate">阿旺 Home</span>
      </li>
      <li
        v-for="item in chatList"
        :key="item.id"
        :class="[
          'h-12 px-3 flex items-center gap-[6px] rounded-lg cursor-pointer mb-2 text-xs leading-[22px] hover:bg-[#f2f3f5] transition-colors',
          route.params.botSlug === item.slug && 'bg-[#f2f3f5]'
        ]"
        @click="onLinkToChat(item.slug)"
      >
        <Avatar
          :avatar="item.avatar || DefaultAvatar"
          :size="28"
          :name="item.name.slice(0, 2)"
          class="w-7 h-7 shrink-0 overflow-hidden"
        />
        <span class="inline-block truncate">{{ item.name }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import DefaultAvatar from '@/assets/img/avatar.png'
import useSpaceRights from '@/composables/useSpaceRights'
import { ESpaceRightsType } from '@/enum/space'
import { RoutesMap } from '@/router'
import { useChatStore } from '@/stores/chat'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'

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
const { checkRightsTypeNeedUpgrade } = useSpaceRights()
const emit = defineEmits(['to_square', 'hide_square'])
const onLinkToChat = (slug?: string) => {
  emit('hide_square', 'hide')
  if (!slug) {
    router.replace(`${props.prefix}/bot/-1`)
    chatStoreI.switchChatingInfo('ge9p359y4v27d2oq')
    return
  }
  router.replace(`${props.prefix}/bot/${slug}`)
  chatStoreI.switchChatingInfo(slug)
}

async function jumpToSquare() {
  emit('to_square', 'show')
  router.replace(`${props.prefix}/bot/square`)
  console.log(route.path)
}

const handeGoCreate = async () => {
  const needUpgrade = await checkRightsTypeNeedUpgrade(ESpaceRightsType.bot)
  if (needUpgrade) {
    return
  }
  router.push({ name: RoutesMap.guide.first })
}

const onLinkToNavigator = () => {
  router.replace(`${props.prefix}/bot/chato_navigator`)
}
</script>
