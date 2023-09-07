<template>
  <div
    class="bg-white rounded-lg p-5 flex gap-3 transition-shadow cursor-pointer hover:shadow-md lg:p-4"
    @click="() => onLinkTo(RoutesMap.tranning.botPersona)"
  >
    <img
      :src="internalBot.avatar || DefaultAvatar"
      class="w-12 h-12 rounded-full overflow-hidden object-cover shrink-0 lg:w-10 lg:h-10"
    />
    <div class="w-full pt-[2px] overflow-hidden">
      <div class="flex gap-4 justify-between items-center overflow-hidden lg:items-start">
        <div class="flex gap-4 items-center lg:flex-col lg:gap-[2px] lg:items-start">
          <span class="inline-block truncate font-medium text-[#3D3D3D] text-sm">
            {{ internalBot.name }}
          </span>
          <span class="text-xs text-[#DCDFE6] truncate">ID: {{ internalBot.slug }}</span>
        </div>
      </div>
      <p
        class="text-[13px] text-[#9DA3AF] leading-[22px] line-clamp-2 mt-3 mb-[10px] h-11 break-all whitespace-pre-wrap lg:mt-2 lg:mb-2 lg:h-auto"
      >
        {{ internalBot.desc }}
      </p>
      <div class="flex gap-x-4 gap-y-3 flex-wrap">
        <IconBtn :icon="Edit" @click="() => onLinkTo(RoutesMap.tranning.botUser)">
          {{ $t('编辑') }}
        </IconBtn>
        <IconBtn :icon="ChatDotRound" @click="() => onLinkTo(RoutesMap.tranning.botChat)">
          {{ $t('调试') }}
        </IconBtn>
        <IconBtn :icon="Share" @click="() => onLinkTo(RoutesMap.tranning.botRelease)">
          {{ $t('分享') }}
        </IconBtn>
        <IconBtn :icon="DataLine" @click="() => onLinkTo(RoutesMap.tranning.report)">
          {{ $t('报表') }}
        </IconBtn>
        <IconBtn
          name="clone-robot"
          @click="() => emit('cloneRobot', internalBot.slug, internalBot.name)"
          >{{ $t('克隆') }}</IconBtn
        >
        <template v-if="isPrivilege">
          <IconBtn
            :icon="internalBot.visible ? Hide : View"
            @click="() => emit('sync', internalBot, 'visible')"
          >
            {{ internalBot.visible ? $t('设置为不可见') : $t('设置为可见') }}
          </IconBtn>
          <IconBtn
            :icon="internalBot.template ? Notification : Compass"
            @click="() => emit('sync', internalBot, 'template')"
          >
            {{ internalBot.template ? $t('设为资源广场机器人') : $t('设为模板机器人') }}
          </IconBtn>
        </template>
        <IconBtn
          v-if="isAllowedDelete"
          :icon="Delete"
          @click="() => emit('delete', internalBot)"
          class="hover:!text-[#f56c6c]"
          >{{ $t('删除') }}</IconBtn
        >
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import DefaultAvatar from '@/assets/img/avatar.png'
import IconBtn from '@/components/IconBtn/index.vue'
import type { IDomainInfo } from '@/interface/domain'
import { RoutesMap } from '@/router'
import { useBase } from '@/stores/base'
import { useDomainStore } from '@/stores/domain'
import {
  ChatDotRound,
  Compass,
  DataLine,
  Delete,
  Edit,
  Hide,
  Notification,
  Share,
  View
} from '@element-plus/icons-vue'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
  bot?: Partial<IDomainInfo>
}>()

const emit = defineEmits(['delete', 'sync', 'cloneRobot'])

// 特殊权益用户开放同步/隐藏资源广场机器人按钮
const PrivilegeUser = '18116404787'

const router = useRouter()
const domainStoreI = useDomainStore()
const baseStoreI = useBase()
const { userInfo } = storeToRefs(baseStoreI)

const internalBot = computed(() => props.bot || {})
const isPrivilege = computed(() => userInfo.value.mobile === PrivilegeUser)
const isAllowedDelete = computed(
  () =>
    userInfo.value.id === userInfo.value.org.owner_id ||
    userInfo.value.id === internalBot.value.creator
)

const onLinkTo = (routeName: string) => {
  domainStoreI.$patch({
    domainInfo: internalBot.value
  })
  router.push({ name: routeName, params: { botId: internalBot.value.id } })
}
</script>
