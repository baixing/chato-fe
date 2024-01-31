<template>
  <div class="overflow-y-auto h-full">
    <Topbar
      v-if="requiredTopbar"
      title=""
      class="h-0 md:!h-16"
      :existMenuMore="route.path.indexOf('c') === -1"
    />
    <SquareHeader />
    <ContentLayout
      class="!overflow-hidden !h-auto"
      v-loading="initing"
      element-loading-background="transparent"
    >
      <div
        v-for="(item, index) in resourceList"
        :key="item.type"
        :class="['w-full', index === resourceList.length - 1 ? 'mb-0' : 'mb-8 lg:mb-4']"
      >
        <p
          class="text-base font-medium tracking-[0.13px] text-[#3D3D3D] mb-6 flex items-center gap-[10px] lg:mb-4"
        >
          <span>{{ item.type }}</span>
        </p>
        <div class="grid grid-cols-4 items-center flex-wrap gap-4 sm:grid-cols-2">
          <div
            class="bg-white rounded-lg line-clamp-2 cursor-pointer hover:shadow-lg hover:-translate-y-2 lg:space-y-3 lg:hover:-translate-y-0 transition-all"
            v-for="c in item.data"
            :key="c.id"
            @click="onAddSessionChat(c)"
          >
            <div class="p-5 pb-0">
              <div class="flex items-center justify-between mb-5 lg:flex-col lg:!mb-2">
                <div class="flex items-center lg:flex-col">
                  <Avatar
                    :avatar="c.avatar || DefaultAvatar"
                    :size="44"
                    :name="c.name.slice(0, 2)"
                    class="w-[44px] h-[44px] object-cover overflow-hidden shrink-0 rounded-full"
                  />
                  <div
                    class="text-[#3D3D3D] text-sm font-medium truncate pl-3 lg:text-center lg:pl-0 lg:mt-2"
                  >
                    {{ c.name }}
                  </div>
                </div>
                <svg-icon
                  @click="(e) => onPreviewQRCode(e, c, item.type)"
                  name="qr-code"
                  svg-class="w-[30px] h-[30px] lg:mt-2"
                />
              </div>
              <div
                class="text-[#9DA3AF] text-xs line-clamp-2 h-8 mb-5 lg:!mb-2"
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
                <el-icon class="mr-1 !text-base lg:!hidden">
                  <Plus class="text-[#9DA3AF]" />
                </el-icon>
                <div class="text-xs">{{ t('创建同款') }}</div>
              </div>
              <div
                class="basis-1/2 text-center flex items-center justify-center hover:!text-[#7C5CFC]"
              >
                <el-icon class="mr-1 !text-base lg:!hidden">
                  <ChatDotRound class="text-[#9DA3AF]" />
                </el-icon>
                <div class="text-xs" @click="onAddSessionChat(c)">{{ t('对话') }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ContentLayout>
    <QrCodeRobot v-model:value="visibleQRCode" :is-internal="isInternal" :slug="currentSlug" />
  </div>
</template>
<script lang="ts" setup>
import { addChatSessionB, addChatSessionC } from '@/api/chatList'
import { getDomainDetailPublic, updateDomain } from '@/api/domain'
import { postCommonGraph } from '@/api/graph'
import { getResourceB, getResourceC } from '@/api/resource'
import DefaultAvatar from '@/assets/img/avatar.png'
import useSpaceRights from '@/composables/useSpaceRights'
import { EDomainStatus } from '@/enum/domain'
import { ESpaceRightsType } from '@/enum/space'
import type { IDomainInfo } from '@/interface/domain'
import ContentLayout from '@/layout/ContentLayout.vue'
import { RoutesMap } from '@/router'
import { useAuthStore } from '@/stores/auth'
import { useBase } from '@/stores/base'
import { useChatStore } from '@/stores/chat'
import { useDomainStore } from '@/stores/domain'
import { useStorage } from '@vueuse/core'
import { ElLoading } from 'element-plus'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import QrCodeRobot from './components/QrCodeRobot.vue'
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
const route = useRoute()
const $uid = useStorage('uid', '')
const resourceList = ref([])
const base = useBase()
const authStoreI = useAuthStore()
const chatStoreI = useChatStore()
const domainStoreI = useDomainStore()
const { userInfo } = storeToRefs(base)
const { authToken } = storeToRefs(authStoreI)
const { chatList } = storeToRefs(chatStoreI)
const { checkRightsTypeNeedUpgrade } = useSpaceRights()
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
const isInternal = ref(false)

const onGoCreate = async (botSlug: string) => {
  const needUpgrade = await checkRightsTypeNeedUpgrade(ESpaceRightsType.bot)
  if (needUpgrade) {
    return
  }
  const {
    data: { data: dataInfo }
  } = await postCommonGraph<IDomainInfo>('chato_domains/save', {
    creator_id: userInfo.value.id,
    updater_id: userInfo.value.id,
    org: userInfo.value.org.id,
    desc_show: 0,
    name: '',
    status: 2,
    avatar: 'https://afu-1255830993.cos.ap-shanghai.myqcloud.com/447479457016221696.png'
  })
  // createDraftDomain()
  const {
    data: { data }
  } = await getDomainDetailPublic(botSlug)
  const { id, slug } = dataInfo
  const { name, system_prompt, avatar, welcome, desc } = data
  const newDomain = {
    id,
    slug,
    name,
    system_prompt,
    avatar,
    welcome,
    desc,
    status: EDomainStatus.able
  }
  await updateDomain(id, newDomain)
  domainStoreI.$patch({ domainInfo: newDomain })
  router.push({ name: RoutesMap.tranning.botChat, params: { botId: id } })
}

const visibleQRCode = ref(false)
const currentSlug = ref('')

const onPreviewQRCode = (e: Event, item, type: string) => {
  e.stopPropagation()
  e.preventDefault()
  isInternal.value = type === '内部工具'
  currentSlug.value = item.slug
  visibleQRCode.value = true
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
