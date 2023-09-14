<template>
  <div class="w-full cursor-pointer text-[14px] text-[#596780] overflow-hidden">
    <el-skeleton v-if="!list.length" :rows="5" />
    <template v-else-if="index === 2">
      <div
        :class="[
          currentSelect === item ? 'industy-item-selected' : '',
          'md:text-[12px]',
          'md:!mb-1',
          'industy-item'
        ]"
        v-for="item in list"
        :key="item"
        @click="() => emit('handleSelect', item, index)"
      >
        {{ item }}
      </div>
    </template>
    <template v-else>
      <div
        v-for="item in list"
        :key="item"
        @click="() => emit('handleSelect', item, index)"
        :class="[
          'flex',
          'justify-center',
          'items-center',
          'text-[13px]',
          'md:mr-[11px]',
          'mr-[22px]',
          'md:mb-[10px]',
          'mb-[20px]',
          'float-left'
        ]"
      >
        <div
          :class="[currentSelect.includes(item) ? 'question-item-selected' : '', 'question-item']"
        ></div>
        {{ item }}
      </div>
    </template>

    <div class="float-left input-industy md:w-full" v-if="showUserInput">
      <HansInputLimit
        v-model:value="industyName"
        placeholder="请填写您的行业"
        limit="30"
        type="text"
        size="default"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import HansInputLimit from '@/components/Input/HansInputLimit.vue'
import { computed } from 'vue'

const emit = defineEmits(['handleSelect', 'update:value'])
const props = defineProps<{
  index: number
  currentSelect: string | string[]
  list: string[]
  value: string
  showUserInput: boolean
}>()

const industyName = computed({
  get: () => props.value,
  set: (val) => emit('update:value', val)
})
</script>

<style scoped lang="scss">
.industy-item {
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 999px;
  padding: 2px 30px;
  margin: 0 14px 12px 0;
  float: left;
}
.industy-item-selected {
  border: 1px solid #7c5cfc;
  color: #7c5cfc;
}
.input-industy {
  :deep(.el-input__wrapper) {
    border-radius: 999px !important;
  }
}
.question-item-selected {
  @apply flex items-center justify-center;
  background: #7c5cfc;
  &::after {
    display: inline-block;
    content: '';
    width: 7px;
    height: 3px;
    margin-bottom: 3px;
    border-left: 1px solid #fff;
    border-bottom: 1px solid #fff;
    transform: rotate(-45deg);
  }
}
.question-item {
  width: 14px;
  height: 14px;
  margin-right: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 2px;
}
</style>
