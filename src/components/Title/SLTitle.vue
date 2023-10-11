<template>
  <div class="flex items-center text-sm text-[#303133] tracking-[0.13px] font-medium">
    <slot></slot>
    <el-tooltip v-if="tips || slotTips" placement="right">
      <template #content>
        <p class="lg:max-w-[214px]">{{ tips }}</p>
        <slot name="tips"></slot>
      </template>
      <svg-icon
        v-if="tips || slotTips"
        name="question-circle"
        svg-class="text-[#596780] w-4 h-4 cursor-pointer ml-[6px]"
      />
    </el-tooltip>
    <slot name="extra"></slot>
  </div>
</template>

<script setup lang="ts">
import { useSlots } from 'vue'

defineProps<{
  tips?: string
}>()

const slotTips = !!useSlots().tips
</script>
