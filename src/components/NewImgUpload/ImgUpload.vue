<template>
  <div>
    <el-upload
      ref="uploadRef"
      action="#"
      :list-type="listType"
      :accept="accept"
      :auto-upload="false"
      :before-upload="beforeUpload"
      :show-file-list="Boolean(listType)"
    >
      <template #trigger v-if="!listType">
        <div class="group/img">
          <div
            class="w-12 h-12 rounded-full border-dashed bg-cover cursor-default box-border hover:border-[#634aca]"
            :style="{
              'background-image': `url(${imgUrl || initImgUrl})`
            }"
            :class="[imgUrl ? 'border-none' : 'border border-[--el-border-color-darker]']"
          >
            <div
              class="hidden w-full h-full rounded-full group-hover/img:flex flex-col justify-around"
              :class="[imgUrl ? 'bg-black/[.56]' : 'cursor-pointer']"
            >
              <div
                class="flex justify-center items-center cursor-pointer text-white"
                title="删除图片"
                v-if="imgUrl"
                @click.stop="() => setInitUrl('')"
              >
                <el-icon>
                  <Delete />
                </el-icon>
              </div>
              <div
                class="flex justify-center items-center cursor-pointer text-white"
                title="裁剪图片"
                v-if="imgUrl"
                @click.stop="cropImg"
              >
                <el-icon>
                  <Scissor />
                </el-icon>
              </div>
              <div
                class="flex justify-center items-center cursor-pointer text-[#634aca]"
                title="上传图片"
                v-if="!imgUrl"
              >
                <el-icon>
                  <Plus />
                </el-icon>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #file="{ file }">
        <div class="group/file">
          <div
            class="gap-4 absolute justify-center text-white inset-x-0 inset-y-0 hidden group-hover/file:grid group-hover/file:bg-black/[.56]"
          >
            <div>
              <el-icon><zoom-in /></el-icon>
            </div>
            <div>
              <el-icon>
                <Download />
              </el-icon>
            </div>
            <div>
              <el-icon>
                <Delete />
              </el-icon>
            </div>
          </div>
          <img class="el-upload-list__item-thumbnail" :src="file.url" alt="" />
        </div>
      </template>
    </el-upload>
  </div>
  <Modal
    v-model:visible="imgUploadDialogVisible"
    title="裁剪图片（移动方框可裁剪图片最佳位置）"
    @submit="setTimbre"
    :appendToBody="true"
  >
    <div class="w-full h-96">
      <vueCropper ref="cropper" v-bind="props" :img="cropImgUrl" />
    </div>
  </Modal>
</template>

<script setup lang="ts">
import 'vue-cropper/dist/index.css'
import { VueCropper } from 'vue-cropper'
import Modal from '@/components/Modal/index.vue'
import { ref } from 'vue'
import { cosServe } from '@/utils/cos'
import type { IUploadOptions } from '@/interface/uploadOptions'
import type { UploadRawFile } from 'element-plus'
import { computed } from 'vue'
import { isArray } from 'lodash'

const cropper = ref()
const cropImgUrl = ref<string>()
const props = withDefaults(
  defineProps<
    {
      setInitUrl: (value: string | string[]) => void
      accept: string
      initImgUrl: string
      imgUrl: string[] | string
      listType?: 'picture' | 'text' | 'picture-card'
    } & Partial<IUploadOptions>
  >(),
  {
    initImgUrl: 'https://afu-1255830993.cos.ap-shanghai.myqcloud.com/447479457016221696.png',
    size: 1,
    full: false,
    outputType: 'png',
    canMove: true,
    fixedBox: false,
    original: false,
    canMoveBox: true,
    autoCrop: true,
    autoCropWidth: 150,
    autoCropHeight: 150,
    centerBox: false,
    high: false,
    enlarge: 1,
    accept: 'png',
    mode: 'contain',
    maxImgSize: 3000,
    fixed: false,
    fillCover: ''
  }
)

const beforeUpload = async (rawFile: UploadRawFile) => {
  const reader = new FileReader()
  reader.onload = function (e) {
    cropImgUrl.value = e.target.result as string
  }
  reader.readAsDataURL(rawFile)
  imgUploadDialogVisible.value = true
  return false
}
const listType = computed(() => {
  if (isArray(props.imgUrl)) {
    return props.listType
  }
  return ''
})

const cropImg = () => {
  if (isArray(props.imgUrl)) return
  imgUploadDialogVisible.value = true
  cropImgUrl.value = props.imgUrl
}

const imgUploadDialogVisible = ref(false)

const setTimbre = () => {
  cropper.value.getCropBlob(async (data: Blob) => {
    const res = await cosServe(data)
    imgUploadDialogVisible.value = false
    if (isArray(props.imgUrl)) return props.setInitUrl([...props.imgUrl, res])
    props.setInitUrl(res)
  })
}
</script>
<style lang="scss" scoped>
:deep(.el-upload--picture-card) {
  --el-upload-picture-card-size: 64px;
}
:deep(.el-upload-list--picture-card) {
  --el-upload-list-picture-card-size: 64px;
}
</style>
