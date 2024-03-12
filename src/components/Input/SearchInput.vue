<template>
  <el-button
    v-show="!inputVisible"
    :icon="Search"
    @click="onShowInput"
    :size="size"
    class="w-[46px]"
  />
  <el-input
    ref="inputRef"
    v-show="inputVisible"
    v-model="internalValue"
    clearable
    :size="size"
    :class="['search-input', inputFocus && 'search-input-focus']"
    @focus="onInputFocus"
    @blur="onInputBlur"
  >
    <template #prepend>
      <el-button :icon="Search" class="text-[#3D3D3D]" />
    </template>
  </el-input>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import type { ElInput, InputProps } from 'element-plus'
import { computed, nextTick, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    value: InputProps['modelValue']
    size?: 'large' | 'default' | 'small'
  }>(),
  {
    size: 'default'
  }
)

const emit = defineEmits(['update:value'])

const inputRef = ref<InstanceType<typeof ElInput>>()
const inputVisible = ref(false)
const inputFocus = ref(false)

const internalValue = computed({
  get: () => props.value,
  set: (v) => emit('update:value', v)
})

const onShowInput = () => {
  inputVisible.value = true
  nextTick(() => {
    inputRef.value?.input?.focus()
  })
}

const onInputBlur = () => {
  if (!internalValue.value) {
    inputVisible.value = false
  }
  inputFocus.value = false
}

const onInputFocus = () => {
  inputFocus.value = true
}
</script>

<style lang="scss" scoped>
.search-input {
  max-width: 200px;
  :deep(.el-input-group__prepend) {
    background-color: white;
  }
}

.search-input-focus {
  :deep(.el-input-group__prepend) {
    /* prettier-ignore */
    box-shadow: 1px 0 0 0 var(--el-input-focus-border-color) inset, 0 1px 0 0 var(--el-input-focus-border-color) inset, 0 -1px 0 0 var(--el-input-focus-border-color) inset;
  }

  :deep(.el-input__wrapper) {
    box-shadow: 0 0 0 1px var(--el-input-focus-border-color) inset;
  }
}
</style>
