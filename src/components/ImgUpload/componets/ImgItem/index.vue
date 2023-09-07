<template>
  <StatusBox :file="file">
    <div
      :class="['img-item', disabled ? 'disabled' : '']"
      :style="{
        width: itemWidth + 'px',
        height: itemHeight + 'px',
        borderRadius: uploadFillet ? '100%' : 0
      }"
    >
      <div class="img" :style="{ backgroundImage: `url(${file.url})` }">
        <div class="mask">
          <div
            v-if="showUploadList.showPreviewIcon"
            class="action-btn"
            :title="$t(`预览图片`)"
            @click="() => emit('onPreview', file, fileIndex)"
          >
            <el-icon><zoom-in /></el-icon>
          </div>
          <div
            v-if="showUploadList.showRemoveIcon && !disabled"
            class="action-btn"
            :title="$t(`删除图片`)"
            @click="() => emit('onRemove', file, fileIndex)"
          >
            <el-icon><Delete /></el-icon>
          </div>
          <div
            v-if="showUploadList.showCropIcon && !disabled"
            class="action-btn"
            title="裁剪图片"
            @click="() => emit('onCrop', file, fileIndex)"
          >
            <el-icon><Scissor /></el-icon>
          </div>
          <a
            v-if="showUploadList.showDownloadIcon && !disabled"
            class="action-btn"
            :title="$t(`下载图片`)"
            download="image.jpg"
            :href="file.url"
            target="_block"
          >
            <el-icon><Download /></el-icon>
          </a>
          <div
            v-if="
              showUploadList.showSortIcon &&
              file.status === 'success' &&
              !disabled &&
              fileIndex !== 0
            "
            class="action-btn"
            :title="$t(`前移`)"
            @click="() => emit('onMove', file, -1)"
          >
            <el-icon><ArrowLeft /></el-icon>
          </div>
          <div
            v-if="
              showUploadList.showSortIcon &&
              file.status === 'success' &&
              !disabled &&
              fileIndex !== fileList.length - 1
            "
            class="action-btn"
            :title="$t(`后移`)"
            @click="() => emit('onMove', file, 1)"
          >
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
      </div>
    </div>
  </StatusBox>
</template>

<script setup lang="ts">
// import type { UploadFile } from 'element-plus'
import type { ExpandShowUploadListInterface, ImgVideoUploadFile } from '../../data'
import StatusBox from './StatusBox.vue'
interface Props {
  file: ImgVideoUploadFile
  showUploadList: ExpandShowUploadListInterface | any
  fileIndex: number
  fileList: ImgVideoUploadFile[]
  itemWidth?: number
  itemHeight?: number
  disabled?: boolean
  uploadFillet?: boolean
}

interface EmitProps {
  (e: 'onPreview', file: ImgVideoUploadFile, fileIndex: number): void
  (e: 'onCrop', file: ImgVideoUploadFile, fileIndex: number): void
  (e: 'onRemove', file: ImgVideoUploadFile, fileIndex: number): void
  (e: 'onMove', file: ImgVideoUploadFile, index: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<EmitProps>()
</script>

<style scoped lang="scss">
.img-item {
  overflow: hidden;
  display: inline-block;
  width: 74px;
  height: 74px;
  margin-right: 5px;
  // padding: 8px;
  vertical-align: top;
  background-color: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  &.disabled {
    background-color: #f5f5f5;
  }
  .img {
    width: 100%;
    height: 100%;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center center;

    &:hover {
      .mask {
        background-color: rgba(0, 0, 0, 0.6);
      }
    }

    .mask {
      display: flex;
      justify-content: center;
      align-items: center;
      align-content: center;
      flex-wrap: wrap;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0);
      content: ' ';
      transition: background-color 0.3s;

      &:hover {
        .action-btn {
          opacity: 1;
        }
      }

      .action-btn {
        height: 22px;
        padding: 0 5px;
        color: #fff;
        cursor: pointer;
        opacity: 0;
        transition: all 0.3s;
      }
    }
  }
}
</style>
