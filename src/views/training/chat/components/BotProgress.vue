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
  <Modal v-model:visible="visible" title="完善智能号" :footer="false" width="390px">
    <div>
      <div>完善信息可以帮助你获得更好的回答质量</div>
      <div class="flex flex-col gap-y-6 mt-6">
        <div v-for="item in taskList" :key="item.icon" class="flex justify-between items-center">
          <div class="flex">
            <div
              class="flex justify-center text-2xl items-center text-[#7C5CFC] bg-[#7C5CFC]/[.08] w-12 h-12 rounded-lg"
            >
              <svg-icon :name="item.icon" />
            </div>
            <div class="flex flex-col justify-between py-[2px] pl-3">
              <div class="text-[#3D3D3D] text-sm font-medium">{{ item.name }}</div>
              <div class="text-[#9DA3AF] text-xs">
                电力值 <span class="text-[#7C5CFC]">+{{ item.power }}</span>
              </div>
            </div>
          </div>
          <div>
            <el-button class="!rounded-full" type="primary"> 去完成</el-button>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(false)
const taskList = [
  { name: '配置形象信息', power: 100, icon: 'task-user' },
  { name: '对话配置与调试', power: 100, icon: 'task-chat' },
  { name: '上传知识', power: 100, icon: 'task-post-add' },
  { name: '发布分享', power: 100, icon: 'task-send' }
] as const
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
