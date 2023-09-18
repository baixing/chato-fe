<template>
  <div class="release-box-container w-[49%] md:w-[100%]">
    <div class="r-b-left">
      <svg-icon :name="svgName"></svg-icon>
    </div>
    <div class="r-b-right">
      <div class="r-title">{{ title }}</div>
      <div class="r-desc">{{ desc }}</div>
      <div class="r-set-container">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  svgName: string
  title: string
  desc: string
}>()
</script>

<style scoped lang="scss">
.release-box-container {
  overflow: hidden;
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  float: left;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  .r-b-left {
    margin-right: 8px;
    font-size: 40px;
  }
  .r-b-right {
    .r-title {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
    }
    .r-desc {
      word-break: break-all;
      margin: 10px 0 24px;
      font-size: 12px;
      color: #9da3af;
      letter-spacing: 0.13px;
      line-height: 16px;
    }
    .r-set-container {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      margin-top: 24px;
    }
  }
}
</style>
