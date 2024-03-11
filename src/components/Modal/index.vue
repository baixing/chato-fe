<template>
  <el-dialog
    v-model="internalVisible"
    :show-close="showClose"
    :width="internalWidth"
    :title="title ? t(title) : ''"
    :fullscreen="fullscreen"
    :align-center="alignCenter"
    :append-to-body="appendToBody"
    :close-on-click-modal="closeOnClickMask"
    :close-on-press-escape="closeOnPressEscape"
    :class="['chato-modal', !title && !slotHeader && 'chato-modal-header-none']"
    style="--el-color-info: #303133"
  >
    <template v-if="slotHeader" #header="headerAttr">
      <slot name="header" v-bind="headerAttr"></slot>
    </template>
    <slot></slot>
    <template v-if="footer" #footer>
      <slot v-if="slotFooter" name="footer"></slot>
      <span v-else>
        <el-button plain @click="onCancel">{{ t('取消') }}</el-button>
        <el-button
          type="primary"
          :disabled="internalSubmitDisabled"
          :loading="internalSubmitting"
          :id="footerAttrs?.submitId"
          @click="onSubmit"
        >
          {{ t(footerAttrs?.submitText || '确定') }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { useBasicLayout } from '@/composables/useBasicLayout'
import type { ElDialog } from 'element-plus'
import { computed, useSlots } from 'vue'
import { useI18n } from 'vue-i18n'

const props = withDefaults(
  defineProps<{
    visible: boolean
    width?: string | number
    mobileWidth?: string | number
    title?: string
    footer?: boolean
    fullscreen?: boolean
    alignCenter?: boolean
    appendToBody?: boolean
    showClose?: boolean
    closeOnClickMask?: boolean
    closeOnPressEscape?: boolean
    footerAttrs?: {
      submitId?: string
      submitText?: string
      submitDisabled?: boolean
      submitting?: boolean
    }
  }>(),
  {
    width: '40%',
    mobileWidth: '90%',
    showClose: true,
    footer: true,
    closeOnClickMask: false,
    closeOnPressEscape: false,
    footerAttrs: null
  }
)

const emit = defineEmits(['update:visible', 'cancel', 'submit'])

const { t } = useI18n()
const { isMobile } = useBasicLayout()

const internalVisible = computed({
  get: () => props.visible,
  set: (v) => emit('update:visible', v)
})
const internalWidth = computed(() => (isMobile.value ? props.mobileWidth : props.width))
const internalSubmitDisabled = computed(() => props.footerAttrs?.submitDisabled || false)
const internalSubmitting = computed(() => props.footerAttrs?.submitting || false)

const slotHeader = !!useSlots().header
const slotFooter = !!useSlots().footer

const onCancel = () => {
  internalVisible.value = false
  emit('cancel')
}

const onSubmit = () => {
  emit('submit')
  internalVisible.value = false
}
</script>

<style lang="scss">
.chato-modal {
  border-radius: 8px !important;

  .el-dialog__header {
    font-size: 20px;
    font-weight: 500;
    color: #303133;
    padding-bottom: 0;
  }

  .el-dialog__body {
    padding: 24px;
  }

  .el-dialog__footer {
    padding: 0 24px 24px;
  }
}

.chato-modal-header-none {
  .el-dialog__header {
    display: none;
  }
}
</style>
