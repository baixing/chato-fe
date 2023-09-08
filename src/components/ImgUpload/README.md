### 暴露参数

```js
  '@components/ImgUpload/data.d.ts'
  interface ImgUplaodProps
```

### 上传模式

- 直接上传，不裁剪

```js
uploadType = 1
notSelectCrop = true
```

- 直接上传 + 裁剪

```js
uploadType = 1
notSelectCrop = true
```

- 图库上传

```js
uploadType = 2
```

### 使用方式

```vue
<template>
  <ImgUpload v-bind="uploadConfig" :value="initFile" @onChange="handleChange" />
</template>
<script setup lang="ts">
// value 最近更新的一条或多条
// newFileList： 最新的图片列表
// oldFileList： 更新前的图片列表
const uploadConfig = {
  uploadType: 2,
  maxSize: 5,
  cropProps: {
    aspectRatio: [1, 1],
    autoAspectRatio: true
  },
  showUploadList: {
    showCropIcon: true,
    showPreviewIcon: true,
    showRemoveIcon: true,
    showDownloadIcon: true
  },
  maxLength: 1,
  itemWidth: 74,
  itemHeight: 74,
  apiUploadPath: apiUpload,
  uploadBtnText: '上传机器人头像'
}
const initFile = ref<MediaType | MediaType[]>()
const handleChange = (
  value: MediaType | MediaType[],
  newFileList: ImgVideoUploadFile,
  oldFileList: ImgVideoUploadFile
) => {}
</script>
```
