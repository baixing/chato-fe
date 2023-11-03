<template>
  <div class="text-[#9DA3AF] flex items-center gap-1 w-fit">
    <span
      class="bg-white rounded-full flex items-center justify-center"
      :style="{ width: `${avatarSize}px`, height: `${avatarSize}px` }"
    >
      <img
        src="@/assets/img/logo.png"
        class="object-contain"
        :style="{ width: `${avatarSize * 0.625}px`, height: `${avatarSize * 0.625}px` }"
      />
    </span>
    <span :style="{ fontSize: `${fontSize}px` }">{{ $t('Chato 智能小助手') }}</span>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    avatarSize?: number
    fontSize?: number
  }>(),
  {
    avatarSize: 28,
    fontSize: 14
  }
)
</script>
