<template>
  <div class="about-content">
    <div class="about-to-title">{{ $t('以下发布平台即将开放，敬请期待') }}</div>
    <div class="platform-list">
      <div class="platform" v-for="item in platformList" :key="item.icon">
        <div class="icon-block">
          <svg-icon :name="item.icon" />
        </div>
        <span class="title">{{ item.title }}</span>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import type { PlatFormListProps } from '@/interface/release'

defineProps<{
  platformList: PlatFormListProps[]
}>()
</script>
<style lang="scss" scoped>
.about-content {
  max-width: 90%;
  margin: auto;
  margin-top: 36px;
  text-align: center;
  .about-to-title {
    font-size: 14px;
    font-weight: 500;
    line-height: 14px;
    letter-spacing: 0.13px;
    color: #2f3447;
    margin-bottom: 22px;
  }

  .platform-list {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;

    .platform {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 10px;

      .icon-block {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        background: #f2f3f5;
        text-align: center;
        line-height: 44px;
        font-size: 18px;
      }

      .title {
        text-align: center;
        font-size: 12px;
        color: #9da3af;
      }
    }
  }
}
</style>
