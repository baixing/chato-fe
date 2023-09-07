<template>
  <div class="text-xs">
    <p class="mb-[16px]">
      <el-button
        type="primary"
        class="text-sm"
        link
        size="large"
        @click="emit('handleEventSet', 'preview', addMenuTabImg)"
        >{{ $t('查看填写示意图') }}</el-button
      >
    </p>
    <div class="w-full flex">
      <div class="h-[220px] steps-container">
        <el-steps direction="vertical">
          <el-step style="flex-basis: 49%" />
          <el-step style="flex-basis: 60%" />
          <el-step class="opacity-0" />
        </el-steps>
      </div>
      <div class="steps-right">
        <div class="mb-[20px]">
          <p class="text-sm">
            <span class="text-[#303133]">{{ $t('进入微信') }}</span>
            <a href="https://mp.weixin.qq.com/" target="_blank" class="text-[#2AC74A]">{{
              $t('「公众号后台」')
            }}</a>
          </p>
          <p class="text-[#9DA3AF] mt-[8px]">
            {{ $t('请确保您的公众号已过微信认证') }}
          </p>
          <p class="text-[#9DA3AF] mt-[8px]">
            {{ $t('路径：内容与互动 > 自定义菜单 > 添加菜单') }}
          </p>
        </div>
        <div class="mb-[20px]">
          <p class="text-sm text-[#303133]">{{ $t('创建菜单') }}</p>
          <p class="mt-[8px] text-[#9DA3AF]">
            {{ $t('填写菜单名称，将以下链接或二维码，配置到菜单里') }}
          </p>
          <p class="my-[12px] text-[#303133]">{{ link }}</p>
          <p>
            <el-button
              type="primary"
              class="mr-[10px] text-xs"
              link
              size="large"
              @click="emit('handleEventSet', 'copy', link)"
              >{{ $t('复制链接') }}</el-button
            >
            <a :href="qrcode" :download="$t(`二维码`)"
              ><el-button type="primary" class="text-xs" link size="large">{{
                $t('保存二维码')
              }}</el-button></a
            >
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import useImagePath from '@/composables/useImagePath'
const { ImagePath: addMenuTabImg } = useImagePath('addMenuTabImg')
defineProps<{
  qrcode: string
  link: string
}>()

const emit = defineEmits(['handleEventSet'])
</script>
