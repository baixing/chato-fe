<template>
  <div class="w-[400px] box-border rounded-2xl px-7 py-6 bg-white lg:w-full">
    <p class="text-[#303133] text-lg font-medium mb-4 flex items-center">
      <svg-icon name="phone" svg-class="w-[22px] h-[22px] mr-1" />{{ $t('联系我们') }}
    </p>
    <p class="text-[#596780] text-sm leading-5 mb-6">
      {{ $t('将有专人为您提供产品解决方案，专业答疑等') }}
    </p>

    <ScheduleForm :submit-btn-text="$t(`预约回电`)" submit-btn-class="!bg-[#303133]" />
  </div>
</template>
<script lang="ts" setup>
import ScheduleForm from './ScheduleForm.vue'
</script>
