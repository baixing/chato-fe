<template>
  <div class="w-full flex flex-col items-center justify-center">
    <span class="text-[#7C5CFC]"
      ><el-icon class="text-[#7C5CFC]" size="24"><SuccessFilled /></el-icon
    ></span>
    <p class="text-[#7C5CFC] text-[14px] my-[16px]">{{ $t('已转移成功') }}</p>
    <p>
      {{ $t('可前往') }}
      <span class="text-[#7C5CFC] text-[12px] cursor-pointer" @click="emit('handlePush')">
        「{{ $t('机器人名称') }}」
      </span>
      {{ $t('查看') }}
    </p>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['handlePush'])
</script>
