<template>
  <header
    :class="[
      'flex shrink-0',
      title ? 'mt-10 mb-8 lg:my-4' : 'h-16',
      center && 'justify-center',
      slotExtra && 'justify-between'
    ]"
  >
    <div :class="[center && 'page-center-container', 'flex gap-2 items-center']">
      <span
        v-show="isMobile && existMenuMore"
        @click="drawerVisible = true"
        class="inline-block w-fit cursor-pointer rounded-full"
      >
        <svg-icon name="menu-more" svg-class="w-10 h-10 text-[#303133] mt-1" />
      </span>
      <h3 v-if="title" class="text-[#303133] font-medium text-xl">{{ title }}</h3>
      <slot></slot>
    </div>
    <slot v-if="!extraInMobile || (extraInMobile && isMobile)" name="extra"></slot>
    <slot name="secondBar"></slot>
  </header>
</template>
<script setup lang="ts">
import { useBasicLayout } from '@/composables/useBasicLayout'
import useSidebar from '@/composables/useSidebar'
import { useSlots } from 'vue'

withDefaults(
  defineProps<{
    center?: boolean
    title?: string
    extraInMobile?: boolean
    existMenuMore?: boolean
  }>(),
  {
    center: true,
    existMenuMore: true
  }
)

const { isMobile } = useBasicLayout()
const { drawerVisible } = useSidebar()

const slotExtra = !!useSlots().extra
</script>
