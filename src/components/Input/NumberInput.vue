<template>
  <div class="flex justify-center items-center text-[#303133]">
    {{ $t(prefix) }}
    <el-input-number
      :min="min"
      :max="max"
      v-model="inputValue"
      :controls-position="position"
      :class="[inputClass, 'mx-2']"
    />
    {{ $t(suffix) }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const emit = defineEmits(['update:value'])
const props = withDefaults(
  defineProps<{
    value: number
    prefix?: string
    suffix?: string
    inputClass?: string
    min?: number
    max?: number
    position?: '' | 'right'
  }>(),
  {
    position: 'right',
    min: 0
  }
)

const inputValue = computed({
  get: () => props.value,
  set: (val) => emit('update:value', val)
})
</script>

<style scoped></style>
