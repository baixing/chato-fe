<template>
  <div class="overflow-y-auto h-full">
    <Topbar v-if="requiredTopbar" title="" class="h-0 md:!h-16" />
    <SquareHeader :requiredTopbar="requiredTopbar" />
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
        <div class="flex items-center flex-wrap gap-4">
          <div
            class="box-border rounded-lg bg-white p-4 flex gap-[10px] items-center cursor-pointer hover:shadow-lg relative lg:flex-col resource-card"
            v-for="c in item.data"
            :key="c.id"
            @click="onAddSessionChat(c)"
          >
            <img
              :src="c.avatar || DefaultAvatar"
              alt="logo"
              class="w-12 h-12 object-cover overflow-hidden shrink-0 rounded-full"
            />
            <div class="tracking-[0.13px] overflow-hidden lg:text-center">
              <div class="text-[#596780] text-sm font-medium mb-2 truncate pr-6 lg:pr-0">
                {{ c.name }}
              </div>
              <p class="text-[#9DA3AF] text-xs line-clamp-2 h-8" style="word-break: break-all">
                {{ c.desc }}
              </p>
            </div>
            <el-icon class="enter-icon text-[#596780]"><SortUp /></el-icon>
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
import { useChatStore } from '@/stores/chat'
import { ElLoading } from 'element-plus'
import { storeToRefs } from 'pinia'
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useStorage } from '@vueuse/core'
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

async function onAddSessionChat(item) {
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
