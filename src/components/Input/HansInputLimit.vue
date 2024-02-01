<template>
  <div class="flex flex-col items-end relative">
    <el-input
      ref="inputRef"
      v-model="internalValue"
      :type="type"
      :size="size"
      :rows="rows"
      resize="none"
      :autosize="autosize"
      :placeholder="placeholder"
      :disabled="internalDisabled"
      @change="emit('change')"
      @blur="emit('blurInput')"
      @keyup.enter="emit('keyupEnter')"
      :style="{
        '--inputPaddingRight': `${limitTagWidth}px`
      }"
      :class="[type === 'text' && 'inner-input-text']"
    />
    <div
      v-if="limit"
      :class="[
        'text-[#767676] text-xs h-fit absolute right-2',
        type === 'text' && 'top-1/2 -translate-y-[50%]',
        type === 'textarea' && 'bottom-1 bg-white z-[1]',
        isExceed && 'error'
      ]"
      ref="innerLimitEl"
    >
      {{ inputStrLen }} / {{ limit }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { getStringWidth } from '@/utils/string'
import { throttledWatch } from '@vueuse/core'
import type { InputAutoSize, InputProps } from 'element-plus'
import { computed, onMounted, ref, toRefs, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    value: string
    placeholder?: string
    limit?: number | string
    type: InputProps['type']
    size?: InputProps['size']
    rows?: number | string
    autosize?: InputAutoSize
    specifyInputStrLen?: number
    defaultFocus?: boolean
    disabled?: boolean
  }>(),
  {
    size: 'default'
  }
)

const { limit, type, size, rows, autosize, placeholder } = toRefs(props)

const emit = defineEmits(['update:value', 'blurInput', 'keyupEnter', 'change'])

const innerLimitEl = ref<HTMLDivElement>()

const internalValue = computed({
  get: () => props.value,
  set: (val) => {
    emit('update:value', val)
    emit('change')
  }
})

const internalDisabled = computed(() => props.disabled)

const inputStrLen = computed(() => {
  return props.specifyInputStrLen || getStringWidth(internalValue.value)
})
const isExceed = computed(() => inputStrLen.value > limit.value)

const limitTagWidth = ref(50)

const inputRef = ref()

const onInputFocus = () => {
  inputRef.value?.input?.focus()
}

watch(
  inputStrLen,
  () => {
    if (!innerLimitEl.value) {
      return
    }

    limitTagWidth.value = innerLimitEl.value.clientWidth + 16
  },
  { immediate: true }
)

throttledWatch(
  internalValue,
  () => {
    if (
      type.value !== 'textarea' ||
      !inputRef.value?.textarea ||
      inputRef.value.textarea.scrollTop === inputRef.value.textarea.scrollHeight
    ) {
      return
    }

    internalDisabled.value &&
      (inputRef.value.textarea.scrollTop = inputRef.value.textarea.scrollHeight)
  },
  { throttle: 300 }
)

onMounted(() => {
  props.defaultFocus && onInputFocus()
})

defineExpose({
  focus: onInputFocus
})
</script>

<style lang="scss">
.inner-input-text {
  .el-input__wrapper {
    padding-right: var(--inputPaddingRight);
  }
}
</style>
