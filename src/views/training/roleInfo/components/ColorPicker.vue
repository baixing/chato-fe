<template>
  <div class="color-select-container">
    <div class="current-color" @click="colorDialogVisible = !colorDialogVisible">
      <div class="c-bg" :style="{ backgroundColor: internalColor }"></div>
      <div class="c-select">
        <el-icon :size="15">
          <ArrowDown />
        </el-icon>
      </div>
    </div>
    <div class="color-dialog" v-show="colorDialogVisible">
      <div class="c-d-list">
        <div
          v-for="item in ChatBubbleColorList"
          :key="item.bg"
          :class="['c-l-item', internalColor === item.bg && 'c-item-active']"
          :style="{ backgroundColor: item.bg }"
          @click="() => onSubmit(item.bg)"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChatBubbleColorList } from '@/constant/chat'
import { computed, ref } from 'vue'

const props = defineProps<{
  color: string
}>()

const emit = defineEmits(['update:color', 'select'])

const internalColor = computed(() => props.color)
const colorDialogVisible = ref(false)

const onSubmit = (color: string) => {
  emit('update:color', color)
  colorDialogVisible.value = false
}
</script>

<style lang="scss" scoped>
.color-select-container {
  position: relative;

  .current-color {
    display: flex;
    box-sizing: border-box;
    width: 112px;
    height: 40px;
    border: 1px solid #d8d8d8;
    padding: 8px 0 8px 12px;
    cursor: pointer;

    .c-bg {
      width: 100%;
      height: 100%;
      background: #4c83f3;
    }

    .c-select {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      padding: 0 10px;
    }
  }

  .color-dialog {
    box-sizing: border-box;
    position: absolute;
    right: -20px;
    top: 0;
    transform: translateX(100%);
    width: 362px;
    padding: 24px;
    box-shadow: 0px 8px 20px 0px rgba(0, 0, 0, 0.08), 0px 12px 32px 4px rgba(0, 0, 0, 0.04);
    border: 1px solid #d8d8d8;
    border-radius: 8px;
    z-index: 9999;
    background-color: #fff;

    .c-d-list {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      row-gap: 16px;
      column-gap: 12px;

      .c-l-item {
        width: 24px;
        height: 24px;
        border-radius: 4px;
        cursor: pointer;
      }

      .c-item-active {
        display: flex;
        justify-content: center;
        align-items: center;

        &::after {
          display: inline-block;
          content: '';
          width: 12px;
          height: 6px;
          border-left: 2px solid #fff;
          border-bottom: 2px solid #fff;
          transform: rotate(-45deg) translate(1px, -1px);
        }
      }
    }
  }
}
</style>
