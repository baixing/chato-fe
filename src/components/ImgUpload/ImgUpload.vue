<template>
  <div :class="styleClass && 'w-12 h-12'">
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
      :disabled="disabled"
    >
      <template #trigger>
        <div class="group/img h-12" v-if="!listType" :class="styleClass">
          <div
            class="w-12 h-12 rounded-full border-dashed bg-cover cursor-default box-border hover:border-[#634aca]"
            :style="{
              'background-image': `url(${imgUrl || (isInitialImg ? initialImgUrl : '')})`
            }"
            :class="[
              imgUrl ? 'border-none' : 'border border-[--el-border-color-darker]',
              styleClass
            ]"
          >
            <div
              class="hidden w-full h-full rounded-full group-hover/img:flex flex-col justify-around"
              :class="[imgUrl ? 'bg-black/[.56]' : 'cursor-pointer']"
            >
              <div
                class="flex justify-center items-center cursor-pointer text-white"
                title="删除图片"
                v-if="imgUrl"
                @click.stop="() => emit('update:imgUrl', '')"
              >
                <el-icon>
                  <Delete />
                </el-icon>
              </div>
              <div
                class="flex justify-center items-center cursor-pointer text-white"
                title="裁剪图片"
                v-if="imgUrl"
                @click.stop="onCropImg"
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
        <div v-else class="w-7 h-7 text-center leading-7">
          <el-icon>
            <Plus />
          </el-icon>
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
            <div class="w-4 h-4 cursor-pointer" @click="onScissorImg(file)">
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
              <el-icon>
                <Download />
              </el-icon>
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
      <VueCropper ref="cropper" v-bind="(props as any)" :img="cropImgUrl" />
    </div>
  </Modal>
  <Modal v-model:visible="zoomInDialogVisible" title="图片预览">
    <img class="m-auto w-full" w-full :src="dialogImageUrl" alt="Preview Image" />
  </Modal>
</template>

<script setup lang="ts">
import { getFileUrl } from '@/api/file'
import DefaultAvatar from '@/assets/img/avatar.png'
import Modal from '@/components/Modal/index.vue'
import type { IUploadOptions } from '@/interface/uploadOptions'
import type { UploadFile, UploadFiles, UploadRawFile, UploadUserFile } from 'element-plus'
import { isArray } from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import { computed, ref, watch } from 'vue'
import { VueCropper } from 'vue-cropper'
import 'vue-cropper/dist/index.css'

const cropper = ref()
const zoomInDialogVisible = ref(false)
const cropImgUrl = ref<string>()
const dialogImageUrl = ref<string>()
const fileList = ref<UploadUserFile[]>([])
const imgUrl = computed({
  get: () => props.imgUrl,
  set: (v) => emit('update:imgUrl', v)
})
const emit = defineEmits(['update:imgUrl'])

const props = withDefaults(
  defineProps<
    {
      accept: string
      initialImgUrl: string
      imgUrl: string[] | string
      listType?: 'picture' | 'text' | 'picture-card'
      isInitialImg: boolean
      disabled: boolean
      styleClass?: string
    } & Partial<IUploadOptions>
  >(),
  {
    initialImgUrl: DefaultAvatar,
    size: 1,
    disabled: false,
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
    fillCover: '',
    isInitialImg: false
  }
)
const listType = computed(() => {
  if (isArray(imgUrl.value)) {
    return props.listType
  }
  return ''
})
const getFileList = () =>
  isArray(imgUrl.value) ? imgUrl.value.map((item) => ({ name: 'item', url: item })) : []

fileList.value = getFileList()

watch(imgUrl, () => (fileList.value = getFileList()))

watch(fileList, async (value: UploadFiles, oldValue: UploadFiles) => {
  if (props.disabled) return
  if (value.length > oldValue.length && value.at(-1).raw) {
    let url
    try {
      const formData = new FormData()
      formData.append('file', value.at(-1).raw)
      const res = await getFileUrl(formData)
      url = res.data.data.url
    } finally {
      fileList.value.at(-1).url = url || DefaultAvatar
      emit(
        'update:imgUrl',
        fileList.value.map((item) => item.url)
      )
    }
  }
})

const onScissorImg = (file: UploadFile) => {
  if (props.disabled) return
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
  dialogImageUrl.value = file.url
  zoomInDialogVisible.value = true
}
const handleRemove = (file: UploadFile) => {
  if (props.disabled) return
  fileList.value = fileList.value.filter((item) => item.uid !== file.uid)
  emit(
    'update:imgUrl',
    fileList.value.map((item) => item.url)
  )
}
const onCropImg = () => {
  if (isArray(imgUrl.value)) return
  imgUploadDialogVisible.value = true
  cropImgUrl.value = imgUrl.value
}

const imgUploadDialogVisible = ref(false)

const setTimbre = () => {
  cropper.value.getCropBlob(async (data: Blob) => {
    try {
      const url = await new Promise<string | undefined>(async (resolve) => {
        const formData = new FormData()
        formData.append('file', new File([data], uuidv4() + '.png'))
        const res = await getFileUrl(formData)
        resolve(res.data.data.url)
      })
      if (props.listType) {
        const index = fileList.value.findIndex((item) => item.url === cropImgUrl.value)
        fileList.value[index].url = url || DefaultAvatar
        emit(
          'update:imgUrl',
          fileList.value.map((item) => item.url)
        )
        return
      }
      emit('update:imgUrl', url)
    } catch (error) {
      console.error('Error:', error)
    }
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
