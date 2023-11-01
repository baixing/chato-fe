<template>
  <div class="h-12">
    <el-upload
      ref="uploadRef"
      action="#"
      :list-type="listType"
      :accept="accept"
      v-model:file-list="fileList"
      :before-upload="beforeUpload"
      :auto-upload="!Boolean(listType)"
      :show-file-list="Boolean(listType)"
      :limit="9"
    >
      <template #trigger>
        <div class="group/img h-12" v-if="!listType">
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
        <div v-else class="w-7 h-7">
          <el-icon><Plus /></el-icon>
        </div>
      </template>
      <template #file="{ file }">
        <div class="group/file">
          <div
            class="content-between text-base leading-4 p-3 items-between flex-wrap absolute justify-between text-white inset-x-0 inset-y-0 hidden group-hover/file:flex group-hover/file:bg-black/[.56]"
          >
            <div class="w-4 h-4 cursor-pointer" @click="handlePictureCardPreview(file)">
              <el-icon><zoom-in /></el-icon>
            </div>
            <div class="w-4 h-4 cursor-pointer" @click="handleRemove(file)">
              <el-icon>
                <Delete />
              </el-icon>
            </div>
            <div class="w-4 h-4 cursor-pointer" @click="scissorImg(file)">
              <el-icon>
                <Scissor />
              </el-icon>
            </div>
            <a
              class="w-4 h-4 cursor-pointer text-white"
              download="image.jpg"
              :href="file.url"
              target="_block"
            >
              <el-icon><Download /></el-icon>
            </a>
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
  <Modal v-model:visible="zoomInDialogVisible" title="图片预览">
    <img class="m-auto w-full" w-full :src="dialogImageUrl" alt="Preview Image" />
  </Modal>
</template>

<script setup lang="ts">
import 'vue-cropper/dist/index.css'
import { VueCropper } from 'vue-cropper'
import Modal from '@/components/Modal/index.vue'
import { ref } from 'vue'
import { cosServe } from '@/utils/cos'
import type { IUploadOptions } from '@/interface/uploadOptions'
import type { UploadFile, UploadFiles, UploadRawFile, UploadUserFile } from 'element-plus'
import { computed } from 'vue'
import { isArray } from 'lodash'
import { watch } from 'vue'

const cropper = ref()
const zoomInDialogVisible = ref(false)
const cropImgUrl = ref<string>()
const dialogImageUrl = ref<string>()
const fileList = ref<UploadUserFile[]>([])
const imgUrl = computed(() => props.imgUrl)
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
const listType = computed(() => {
  if (isArray(imgUrl.value)) {
    return props.listType
  }
  return ''
})

watch(fileList, async (value: UploadFiles, oldValue: UploadFiles) => {
  if (value.length > oldValue.length) {
    const res = await cosServe(value.at(-1).raw)
    fileList.value.at(-1).url = res
    props.setInitUrl(fileList.value.map((item) => item.url))
  }
})

const scissorImg = (file: UploadFile) => {
  imgUploadDialogVisible.value = true
  cropImgUrl.value = file.url
}

const beforeUpload = async (rawFile: UploadRawFile) => {
  const reader = new FileReader()
  reader.onload = function (e) {
    cropImgUrl.value = e.target.result as string
  }
  reader.readAsDataURL(rawFile)
  imgUploadDialogVisible.value = true
  return false
}
const handlePictureCardPreview = (file: UploadFile) => {
  dialogImageUrl.value = file.url!
  zoomInDialogVisible.value = true
}
const handleRemove = (file: UploadFile) => {
  fileList.value = fileList.value.filter((item) => item.uid != file.uid)
  props.setInitUrl(fileList.value.map((item) => item.url))
}
const cropImg = () => {
  if (isArray(imgUrl.value)) return
  imgUploadDialogVisible.value = true
  cropImgUrl.value = imgUrl.value
}

const imgUploadDialogVisible = ref(false)

const setTimbre = () => {
  cropper.value.getCropBlob(async (data: Blob) => {
    const res = await cosServe(data)
    imgUploadDialogVisible.value = false
    if (props.listType) {
      const index = fileList.value.findIndex((item) => item.url == cropImgUrl.value)
      fileList.value[index].url = res
      props.setInitUrl(fileList.value.map((item) => item.url))
      return
    }
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
