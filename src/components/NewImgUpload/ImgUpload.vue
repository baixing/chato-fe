<template>
  <div class="w-96 h-96">
    <vueCropper ref="cropper" v-bind="option" />
  </div>
</template>

<script setup lang="ts">
import 'vue-cropper/dist/index.css'
import { VueCropper } from 'vue-cropper'
import { provide, ref } from 'vue'
import { imgBlob } from '@/constant/uploadImg'

const cropper = ref()

provide(
  imgBlob,
  cropper.value.getCropBlob((data: Blob) => data)
)

const option = {
  img: 'https://navix-1255830993.cos.na-siliconvalley.myqcloud.com/avatar/bot/202306/53b8330d-ac13-4d78-b15f-bbeb9b442c83.png?imageMogr2/crop/252x252/gravity/center',
  size: 1,
  full: false,
  outputType: 'png',
  canMove: true,
  fixedBox: false,
  original: false,
  canMoveBox: true,
  autoCrop: true,
  // 只有自动截图开启 宽度高度才生效
  autoCropWidth: 200,
  autoCropHeight: 150,
  centerBox: false,
  high: false,
  cropData: {},
  enlarge: 1,
  mode: 'contain',
  maxImgSize: 3000,
  limitMinSize: [50, 50],
  fixed: false,
  fixedNumber: [2, 1],
  fillCover: ''
}
</script>
