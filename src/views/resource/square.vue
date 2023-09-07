<template>
  <Topbar :title="$t(`全部应用`)" />
  <ContentLayout v-loading="initing" element-loading-background="transparent">
    <div
      v-for="(item, index) in resourceList"
      :key="item.type"
      :class="[index === resourceList.length - 1 ? 'mb-0' : 'mb-8 lg:mb-4']"
    >
      <p
        class="text-lg font-medium tracking-[0.13px] text-[#3D3D3D] mb-6 flex items-center gap-[10px] lg:mb-4"
      >
        <span>{{ item.type }}</span>
        <img v-if="item.icon" :src="item.icon" alt="logo" class="w-[18px] h-[18px] object-cover" />
      </p>
      <div class="flex items-center flex-wrap gap-4">
        <div
          class="box-border rounded-lg bg-white p-4 flex gap-[10px] items-center cursor-pointer hover:shadow-lg relative lg:flex-col resource-card"
          v-for="c in item.data"
          :key="c.id"
          @click="addSessionChat(c)"
        >
          <img
            :src="c.avatar"
            alt="logo"
            class="w-12 h-12 object-cover overflow-hidden shrink-0 rounded-full"
          />
          <div class="tracking-[0.13px] overflow-hidden lg:text-center">
            <div class="text-[#596780] text-sm font-medium mb-2 truncate pr-6 lg:pr-0">
              {{ c.name }}
            </div>
            <p class="text-[#9DA3AF] text-xs line-clamp-2 h-8">{{ c.desc }}</p>
          </div>
          <el-icon class="enter-icon text-[#596780]"><SortUp /></el-icon>
        </div>
      </div>
    </div>
  </ContentLayout>
</template>
<script lang="ts" setup>
import { addSession } from '@/api/chatList'
import { getResource } from '@/api/resource'
import Topbar from '@/components/Topbar/index.vue'
import { EAllRole } from '@/enum/user'
import ContentLayout from '@/layout/ContentLayout.vue'
import { useBase } from '@/stores/base'
import { useChatStore } from '@/stores/chat'
import { ElLoading, ElNotification } from 'element-plus'
import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()
const baseStoreI = useBase()
const resourceList = ref([])
const chatStoreI = useChatStore()
const { userInfo, orgInfo } = storeToRefs(baseStoreI)
const { chatList } = storeToRefs(chatStoreI)

async function addSessionChat(item) {
  if (chatList.value.filter((i) => i.slug === item.slug).length)
    return router.replace(`/c/bot/${item.slug}`)
  const loading = ElLoading.service({
    lock: true,
    text: t('正在进入...'),
    background: 'rgba(0, 0, 0, 0.7)'
  })
  const res = await addSession([item.id])
  if (res.data.code === 200) {
    await chatStoreI.initChatList()
    chatStoreI.switchChatingInfo(item.slug)
    loading.close()
    return router.replace(`/c/bot/${item.slug}`)
  }
  return ElNotification.error(res.data.data)
}

const initing = ref(false)

watch([userInfo, initing], () => {
  // 创建机器人提示逻辑：当前用户是空间所有者或管理员，且空间下无机器人
  if (
    initing.value ||
    !userInfo.value ||
    EAllRole.member === userInfo.value.role ||
    userInfo.value.org.id !== orgInfo.value.id
  ) {
    return
  }
})

const init = async () => {
  try {
    initing.value = true
    const res = await getResource()
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
