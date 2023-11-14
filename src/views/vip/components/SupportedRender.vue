<template>
  <svg-icon
    :name="supported ? 'correct' : 'mistake'"
    :svg-class="['w-4 h-4', supported ? 'text-[#5ED07C]' : 'text-[#F56C6C]']"
  />
</template>

<script setup lang="ts">
defineProps<{
  supported: number
}>()
</script>
