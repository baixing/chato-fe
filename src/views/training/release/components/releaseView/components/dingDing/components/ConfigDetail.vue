<template>
  <div>
    <p class="mb-[16px]">
      <el-switch
        v-model="showPublic"
        size="large"
        :active-text="$t('开启')"
        :inactive-text="$t('关闭')"
      />
    </p>
    <p class="text-[#9DA3AF] mb-[16px]">{{ $t('复制下方信息，在「钉钉开放平台」粘贴') }}</p>
    <div class="flex justify-between items-center mb-[16px] pr-4">
      <div class="!text-[14px] work-break my-1 flex flex-col">
        <label :for="$t('生成地址')">{{ $t('生成地址') }}：</label>
        <span class="my-1">{{ url }}</span>
      </div>
      <el-button type="primary" link @click="$copyText(url)">{{ $t('复制') }}</el-button>
    </div>
    <p class="mt-[12px] text-[#596780]">
      <el-button size="large" type="primary" link @click="emit('handleResetConfig')">
        {{ $t('重新配置') }}
      </el-button>
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{
  url: string
  turn: boolean
}>()
const emit = defineEmits(['handleResetConfig', 'update:turn'])
const showPublic = computed({
  get: () => props.turn,
  set: (val) => emit('update:turn', val)
})
</script>

<style scoped></style>
