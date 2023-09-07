<template>
  <div
    :class="[
      'box-border flex items-center gap-[10px] px-3 rounded-lg bg-white text-[#9DA3AF] text-xs transition border border-solid border-white cursor-pointer h-[94px] hover:shadow-md',
      active && '!border-[#7C5CFC]',
      disabled && 'cursor-not-allowed bg-[#8989891a] opacity-70'
    ]"
    @click="onClick"
  >
    <img :src="domain.avatar || DefaultAvatar" alt="" class="w-12 h-12 rounded-full shrink-0" />
    <div class="text-left">
      <p class="text-sm text-[#596780] font-medium line-clamp-1">{{ domain.name }}</p>
      <p class="line-clamp-2 mt-2">{{ domain.desc }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import DefaultAvatar from '@/assets/img/avatar.png'
import type { IDomainInfo } from '@/interface/domain'
import { toRefs } from '@vueuse/core'

const props = defineProps<{
  domain: IDomainInfo
  active?: boolean
  border?: boolean
  disabled?: boolean
}>()

const emit = defineEmits(['select'])

const { domain, border, disabled } = toRefs(props)

const onClick = () => {
  if (disabled.value) {
    return
  }

  emit('select', domain.value)
}
</script>
