<template>
  <div
    class="flex items-center py-2 px-3 rounded border border-solid text-sm border-[#E4E7ED]"
    :class="style"
  >
    <div>
      {{ label }}
    </div>
    <svg-icon
      @click.stop="setValue(value)"
      :name="iconName ?? 'stop'"
      :svg-class="`w-4 h-4 text-base ml-2 cursor-pointer ${iconStyle}`"
    />
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  label: String
  value: String
  style?: String
  iconStyle?: String
  iconName?: String
  setValue?: (value: String) => void
}>()
</script>

<style lang="scss"></style>
