<template>
  <div class="overflow-y-auto h-full">
    <Topbar v-if="requiredTopbar" title="" class="h-0 md:!h-16" />
    <SquareHeader :requiredTopbar="requiredTopbar" v-if="requiredTopbar" />
    <ContentLayout
      class="!overflow-hidden !h-auto"
      v-loading="initing"
      element-loading-background="transparent"
    >
      <div
        v-for="(item, index) in resourceList"
        :key="item.type"
        :class="[index === resourceList.length - 1 ? 'mb-0' : 'mb-8 lg:mb-4']"
      >
        <p
          class="text-lg font-medium tracking-[0.13px] text-[#3D3D3D] mb-6 flex items-center gap-[10px] lg:mb-4"
        >
          <span>{{ item.type }}</span>
          <img
            v-if="item.icon"
            :src="item.icon"
            alt="logo"
            class="w-[18px] h-[18px] object-cover"
          />
        </p>
        <div class="grid grid-cols-4 items-center flex-wrap gap-4 sm:grid-cols-2">
          <div
            class="bg-white rounded-lg line-clamp-2 cursor-pointer hover:shadow-lg hover:-translate-y-2 lg:space-y-3 lg:hover:-translate-y-0 transition-all"
            v-for="c in item.data"
            :key="c.id"
            @click="onAddSessionChat(c)"
          >
            <div class="p-5 pb-0">
              <div class="flex items-center mb-5">
                <Avatar
                  :avatar="c.avatar || DefaultAvatar"
                  :size="44"
                  :name="c.name.slice(0, 2)"
                  class="w-[44px] h-[44px] object-cover overflow-hidden shrink-0 rounded-full"
                />
                <div class="text-[#3D3D3D] text-sm font-medium truncate pl-3">
                  {{ c.name }}
                </div>
              </div>
              <div
                class="text-[#9DA3AF] text-xs line-clamp-2 h-8 mb-6"
                style="word-break: break-all"
              >
                {{ c.desc }}
              </div>
            </div>
            <div
              class="border-t border-0 border-solid !text-sm text-[#596780] border-[#E4E7ED] flex justify-between h-11 items-center"
            >
              <div
                class="basis-1/2 text-center border-0 h-full leading-[44px] border-r border-solid border-[#E4E7ED] flex items-center justify-center hover:!text-[#7C5CFC]"
                @click.stop="onGoCreate(c.slug)"
              >
                <el-icon class="text-[#9DA3AF] mr-1 !text-base"><Plus /></el-icon>
                <div>{{ t('创建同款') }}</div>
              </div>
              <div
                class="basis-1/2 text-center flex items-center justify-center hover:!text-[#7C5CFC]"
              >
                <el-icon class="text-[#9DA3AF] mr-1 !text-base"><ChatDotRound /></el-icon>
                <div>{{ t('对话') }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ContentLayout>
  </div>
</template>
<script lang="ts" setup>
import { addChatSessionB, addChatSessionC } from '@/api/chatList'
import { getResourceB, getResourceC } from '@/api/resource'
import DefaultAvatar from '@/assets/img/avatar.png'
import ContentLayout from '@/layout/ContentLayout.vue'
import { RoutesMap } from '@/router'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'
import { useStorage } from '@vueuse/core'
import { ElLoading } from 'element-plus'
import { storeToRefs } from 'pinia'
import { computed, defineEmits, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import SquareHeader from './components/SquareHeader.vue'

const props = withDefaults(
  defineProps<{
    prefix: string
    existMenuMore: boolean
    requiredTopbar: boolean
  }>(),
  {
    prefix: '/c',
    existMenuMore: true,
    requiredTopbar: true
  }
)

const { t } = useI18n()
const router = useRouter()
const $uid = useStorage('uid', '')
const resourceList = ref([])
const authStoreI = useAuthStore()
const chatStoreI = useChatStore()
const { authToken } = storeToRefs(authStoreI)
const { chatList } = storeToRefs(chatStoreI)
const isLoggedIn = computed(() => !!authToken.value)
const emit = defineEmits(['hidden_square'])

async function onAddSessionChat(item) {
  emit('hidden_square', 'hide')
  if (chatList.value.filter((i) => i.slug === item.slug).length)
    return router.replace(`${props.prefix}/bot/${item.slug}`)
  const loading = ElLoading.service({
    lock: true,
    text: t('正在进入...'),
    background: 'rgba(0, 0, 0, 0.7)'
  })
  try {
    if (!isLoggedIn.value) {
      await addChatSessionC($uid.value, [item.id])
    } else {
      await addChatSessionB([item.id])
    }
    await chatStoreI.initChatList()
    chatStoreI.switchChatingInfo(item.slug)

    return router.replace(`${props.prefix}/bot/${item.slug}`)
  } catch (error) {
  } finally {
    loading.close()
  }
}

const initing = ref(false)

const onGoCreate = (slug: string) => {
  router.push({ name: RoutesMap.manager.create, params: { botSlug: slug } })
}

const init = async () => {
  try {
    initing.value = true
    let getResourceFunc = isLoggedIn.value ? getResourceB : getResourceC
    const res = await getResourceFunc()
    resourceList.value = res.data.data
  } catch (err) {
  } finally {
    initing.value = false
  }
}

init()
</script>
<style lang="scss" scoped>
.resource-card {
  width: calc(25% - 12px);
  .enter-icon {
    position: absolute;
    right: 16px;
    top: 16px;
    visibility: hidden;
    transform: rotate(90deg) rotateY(180deg);
  }

  &:hover {
    .enter-icon {
      visibility: visible;
    }
  }
}

@media screen and (max-width: 1024px) {
  .resource-card {
    width: calc(50% - 8px);
  }
}
</style>
