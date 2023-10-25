<template>
  <div
    class="flex items-center py-2 px-3 rounded border-2 border-solid border-[#E4E7ED]"
    :class="style"
  >
    <div>
      {{ label }}
    </div>
    <svg-icon
      @click.stop="setValue(value)"
      name="stop"
      svg-class="w-4 h-4 text-[#303133] text-base ml-2 cursor-pointer"
    />
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  label: String
  value: String
  style?: String
  setValue?: (value: String) => void
}>()
</script>

<style lang="scss"></style>
