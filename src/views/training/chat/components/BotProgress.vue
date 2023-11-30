<template>
  <div class="px-4 my-7">
    <div class="flex justify-between items-center mb-3 h-5">
      <div class="flex gap-x-2 items-center">
        <div class="text-xs text-[#3D3D3D]">{{ $t('任务进度') }}</div>
        <div class="text-color text-base">{{ schedule }} %</div>
        <div class="text-xs text-[#9DA3AF]">{{ $t('3项 建议优化') }}</div>
      </div>
      <div class="text-xs text-[#7C5CFC] cursor-pointer flex items-center" @click="visible = true">
        {{ $t('立即优化') }}<el-icon class="ml-1"><TopRight /></el-icon>
      </div>
    </div>
    <el-progress :percentage="schedule" />
  </div>
  <Modal v-model:visible="visible" title="完善机器人" :footer="false" width="390px">
    <div>
      <div>{{ $t('完善信息可以帮助你获得更好的回答质量') }}</div>
      <div class="flex flex-col gap-y-6 mt-6">
        <div
          v-for="(item, index) in taskList"
          :key="item.icon"
          class="flex justify-between items-center"
        >
          <div class="flex">
            <div
              class="flex justify-center text-2xl items-center text-[#7C5CFC] bg-[#7C5CFC]/[.08] w-12 h-12 rounded-lg"
            >
              <svg-icon :name="item.icon" />
            </div>
            <div class="flex flex-col justify-center py-[2px] pl-3">
              <div class="text-[#3D3D3D] text-sm font-medium">{{ item.name }}</div>
              <!-- <div class="text-[#9DA3AF] text-xs">
                电力值 <span class="text-[#7C5CFC]">+{{ item.power }}</span>
              </div> -->
            </div>
          </div>
          <div>
            <el-button
              class="!rounded-full"
              type="primary"
              :disabled="domainInfo.task_progress[index] !== 0"
              @click="onMenuSelect(item.routeName)"
            >
              {{ $t(domainInfo.task_progress[index] === 0 ? '去完成' : '已完成') }}
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { taskList } from '@/constant/domain'
import { useDomainStore } from '@/stores/domain'
import { storeToRefs } from 'pinia'
import { ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const visible = ref(false)
const route = useRoute()
const router = useRouter()
const schedule = ref<number>(20)
const domainStoreI = useDomainStore()
const { domainInfo } = storeToRefs(domainStoreI)

watchEffect(
  () => (schedule.value = domainInfo.value.task_progress.reduce((pre, cur) => pre + cur, 20))
)
const onMenuSelect = (routeName: string) => {
  router.push({
    name: routeName,
    // botId 复写意义防止部分菜单未含有 botId 跳转至需要 botId 的页面
    params: { ...route.params, botId: domainInfo.value.id, type: undefined }
  })
}
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
