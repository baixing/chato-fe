<template>
  <div class="relative shrink-0" :style="{ height: `${size}px` }">
    <el-avatar :size="size" :style="{ '--el-avatar-bg-color': avatar ? 'transparent' : undefined }">
      <img v-if="avatar.isUrl" :src="avatar.url" class="w-full h-full object-cover" />
      <span
        v-if="avatar.isUrl === false"
        :class="[
          'text-sm w-full h-full overflow-hidden truncate',
          showAllName ? 'text-xs scale-90' : ``
        ]"
        :style="{ lineHeight: `${size}px`, background: `${avatar.background}` }"
      >
        {{ name ?? '头像' }}
      </span>
    </el-avatar>
    <SpaceRightsIcon
      v-if="withRights"
      :type="commercialType"
      class="absolute bottom-[2px] translate-x-1/2"
    />
  </div>
</template>

<script setup lang="ts">
import SpaceRightsIcon from '@/components/Space/SpaceRightsIcon.vue'
import type { ESpaceCommercialType } from '@/enum/space'
import type { IUserInfo } from '@/interface/user'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    size?: number
    avatar?: IUserInfo['avatar']
    name?: string
    commercialType?: ESpaceCommercialType
    withRights?: boolean
    showAllName?: boolean
  }>(),
  {
    limit: 20,
    size: 40,
    showAllName: false
  }
)

const avatar = computed<{ isUrl: true; url: string } | { isUrl: false; background: string }>(() =>
  props.avatar?.split('://')[0] === 'avatar'
    ? { isUrl: false, background: props.avatar.split('color=')[1] }
    : { isUrl: true, url: props.avatar }
)
</script>
