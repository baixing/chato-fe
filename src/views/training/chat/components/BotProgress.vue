<template>
  <div class="px-4 my-7">
    <div class="flex justify-between items-center mb-3 h-5">
      <div class="flex gap-x-2 items-center">
        <div class="text-xs text-[#3D3D3D]">{{ $t('任务进度') }}</div>
        <div class="text-color text-base">12%</div>
        <div class="text-xs text-[#9DA3AF]">{{ $t('8项 建议优化') }}</div>
      </div>
      <div class="text-xs text-[#7C5CFC] cursor-pointer flex items-center" @click="visible = true">
        {{ $t('立即优化') }}<el-icon class="ml-1"><TopRight /></el-icon>
      </div>
    </div>
    <el-progress :percentage="50" :text-inside="true" />
  </div>
  <Modal v-model:visible="visible" title="完善智能号" :footer="false">
    <div>
      <div>完善信息可以帮助你获得更好的回答质量</div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(false)
</script>

<style lang="scss">
.text-color {
  font-feature-settings: 'kern' on;
  background: linear-gradient(313deg, #0547ff -6%, #d683ff 98%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
}
</style>
