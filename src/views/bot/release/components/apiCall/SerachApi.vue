<template>
  <Modal
    width="40%"
    mobile-width="90%"
    v-model:visible="internalVisible"
    :title="$t(`查看秘钥`)"
    :footer="false"
    class="copy-api-container"
  >
    <div class="api-detail">
      <dl>
        <dt>token：</dt>
        <dd class="copiable-item">
          {{ chatAPI }}
          <el-button
            type="primary"
            link
            size="large"
            @click.prevent="emit('handleCopyApiUrl', chatAPI)"
            >{{ $t('复制') }}</el-button
          >
        </dd>
      </dl>
      <dl>
        <dt>{{ $t('机器人标识：') }}</dt>
        <dd class="copiable-item">
          {{ slug }}
          <el-button
            type="primary"
            link
            size="large"
            @click.prevent="emit('handleCopyApiUrl', slug)"
            >{{ $t('复制') }}</el-button
          >
        </dd>
      </dl>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import Modal from '@/components/Modal/index.vue'
import { computed } from 'vue'

const props = defineProps<{
  value: boolean
  chatAPI: string
  slug: string
}>()

const emit = defineEmits(['update:value', 'handleCopyApiUrl'])

const internalVisible = computed({
  get: () => props.value,
  set: (v) => emit('update:value', v)
})
</script>
<style lang="scss" scoped>
.api-detail dl {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  line-height: 24px;
  font-size: $fs-s;

  dt {
    clear: both;
    float: left;
    flex: 0 0 auto;
  }

  dd {
    float: left;
    flex: 1 1 auto;
    color: #596780;
  }

  pre {
    font-size: $fs-s;
    line-height: 1.2;
    color: #596780;
  }

  code {
    padding: 5px 10px;
    font-size: $fs-xs;
    font-family: Menlo, Consolas, monospace;
    white-space: pre-wrap;
    word-wrap: break-word;
    word-break: break-all;
    border-radius: 4px;
    background-color: $bg-color-code;
  }
  .copiable-item {
    display: flex;
    align-items: center;

    pre {
      padding: 5px 10px 5px 0;
      font-size: $fs-s;
      font-family: Menlo, Consolas, monospace;
      white-space: pre-wrap;
      word-wrap: break-word;
      word-break: break-all;
      // border: 1px solid $color-hr;
      border-radius: 5px;
      color: #2f3447;
    }

    .el-button {
      margin-left: 10px;
    }
  }
}
</style>
<style lang="scss">
.copy-api-container {
  .el-dialog__header {
    margin-right: 0;
  }
  .el-dialog__body {
    padding-top: 0;
    padding-bottom: 24px;
  }
}
</style>
