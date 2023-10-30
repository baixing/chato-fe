<template>
  <div
    class="flex items-center py-2 px-3 rounded border border-solid text-sm border-[#E4E7ED]"
    :class="className"
  >
    <div>
      {{ label }}
    </div>
    <svg-icon
      @click.stop="setValue(value)"
      :name="iconName || 'audio-play'"
      :svg-class="`w-4 h-4 text-base ml-2 cursor-pointer ${iconStyle}`"
    />
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  label: string
  value: string
  className?: string
  iconStyle?: string
  iconName?: string
  setValue?: (value: string) => void
}>()
</script>

<style lang="scss"></style>
