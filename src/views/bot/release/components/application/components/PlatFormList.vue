<template>
  <div class="plat-list-conatiner">
    <div class="plat-item md:mb-3" v-for="item in platformList" :key="item">
      <svg-icon :name="item"></svg-icon>
    </div>
    <span class="text-[14px] ml-4 md:text-xs">{{
      $t('Chato 支持多平台、多渠道、多形式地对外发布机器人')
    }}</span>
  </div>
</template>
<script lang="ts" setup>
defineProps<{
  platformList: string[]
}>()
</script>
<style lang="scss" scoped>
.plat-list-conatiner {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
  .plat-item {
    @apply flex items-center justify-center;
    width: 32px;
    height: 32px;
    margin-right: 16px;
    border-radius: 100%;
    background: #ffffff;
    font-size: 14px;
    color: #596780;
    &:last-of-type {
      margin-right: 0;
    }
  }
}
</style>
