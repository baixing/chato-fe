<template>
  <Avatar
    :avatar="imgUrl ?? DefaultAvatar"
    @click="onSetAvatar"
    :size="48"
    :name="name"
    class="w-12 h-12 cursor-pointer"
  />
  <Modal v-model:visible="visible" title="选择头像" @submit="onSubmit">
    <div class="flex flex-col items-center pb-5">
      <Avatar
        :avatar="imgByModal ?? DefaultAvatar"
        class="w-14 h-14 cursor-pointer"
        :size="56"
        :name="name"
      />
      <div class="pt-1 text-[#9DA3AF]">预览头像</div>
    </div>
    <div class="font-medium leading-6 text-[#303133] pb-5">自定义头像颜色</div>
    <div class="flex justify-between items-center">
      <div class="w-16 h-16 flex rounded-full items-center justify-center">
        <el-upload
          action="#"
          :before-upload="beforeUpload"
          class="flex rounded-full items-center justify-center"
        >
          <div
            class="bg-[#F2F3F5] w-14 h-14 flex rounded-full items-center justify-center cursor-pointer"
          >
            <el-icon><Plus /></el-icon>
          </div>
        </el-upload>
      </div>
      <div
        v-for="item in avatarList"
        :key="item"
        class="w-16 h-16 cursor-pointer p-[3px] border-solid border border-[#fff] rounded-full"
        :class="{ '!border-[#7C5CFC]': imgByModal === item }"
      >
        <Avatar :avatar="item" :size="56" @click="imgByModal = item" :name="name" />
      </div>
      <div
        class="bg-[#F2F3F5] w-14 h-14 flex rounded-full items-center justify-center cursor-pointer relative"
      >
        <div class="absolute inset-x-0 inset-y-0 opacity-0 flex items-center justify-center">
          <el-color-picker @change="onColorPicker" size="large" />
        </div>
        <svg-icon name="color-picker" />
      </div>
    </div>
  </Modal>
  <Modal
    v-model:visible="imgUploadDialogVisible"
    title="裁剪图片（移动方框可裁剪图片最佳位置）"
    @submit="setTimbre"
    :appendToBody="true"
  >
    <div class="w-full h-96">
      <VueCropper ref="cropper" v-bind="(vueCropperOptions as any)" :img="cropImgUrl" />
    </div>
  </Modal>
</template>

<script setup lang="ts">
import DefaultAvatar from '@/assets/img/avatar.png'
import Avatar from '@/components/Avatar/index.vue'
import { cosServe } from '@/utils/cos'
import type { UploadRawFile } from 'element-plus'
import { computed, ref } from 'vue'
import { VueCropper } from 'vue-cropper'

const props = defineProps<{
  imgUrl: string
  name: string
}>()
const name = computed(() => props.name.slice(0, 2))
const emit = defineEmits(['update:imgUrl', 'submit'])
const avatarList = [
  'avatar://?color=#409EFF',
  'avatar://?color=#7C5CFC',
  'avatar://?color=#FDCF63',
  'avatar://?color=#56DB79'
]
const imgUrl = computed({
  get: () => props.imgUrl,
  set: (v) => emit('update:imgUrl', v)
})
const imgByModal = ref<string>()
const visible = ref(false)
const imgUploadDialogVisible = ref(false)
const cropper = ref()
const cropImgUrl = ref<string>()
const vueCropperOptions = {
  autoCrop: true,
  fixed: true,
  fixedNumber: [1, 1]
}

const onSubmit = () => {
  imgUrl.value = imgByModal.value
  emit('submit')
}

const onSetAvatar = () => {
  visible.value = true
  imgByModal.value = imgUrl.value
}

const onColorPicker = (value) => {
  if (!value) return
  imgByModal.value = 'avatar://?color=' + value
}

const setTimbre = () => {
  cropper.value.getCropBlob(async (data: Blob) => {
    const res = await cosServe(data)
    imgUploadDialogVisible.value = false
    imgByModal.value = res
  })
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
</script>
