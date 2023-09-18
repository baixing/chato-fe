<template>
  <div class="h-full min-h-[300px]">
    <el-collapse v-model="activeNames" accordion v-if="singleGroupList.length > 0">
      <el-collapse-item v-for="(item, index) in singleGroupList" :key="item.name" :name="index">
        <template #title>
          <p class="leading-5 break-all">{{ $t('自定义账号') }}：{{ item.name }}</p>
        </template>
        <div class="w-full text-[#303133] leading-5 group-detail text-sm">
          <p>
            {{ $t('账号') }}： <span class="content">{{ $t('自定义账号') }}</span>
          </p>
          <p>
            {{ $t('名称') }}： <span class="content">{{ item.name }}</span>
          </p>
          <p>
            {{ $t('组织') }}： <span class="content">{{ item.corp_name }}</span>
          </p>
          <p>
            {{ $t('服务人数') }}：
            <span class="content">{{ item.people_cnt || 0 }} {{ $t('人') }} </span>
          </p>
          <p>
            {{ $t('状态') }}： <span class="content">{{ item.status }}</span>
          </p>
          <p class="flex justify-start items-center">
            {{ $t('机器人二维码') }}：
            <img class="w-[120px] h-[120px] ml-[12px]" :src="item.qrcode_data" alt="" />
          </p>
          <p class="flex justify-start items-center">
            {{ $t('Token') }}： <span class="content">{{ item.token }}</span>
            <el-button class="ml-[12px]" type="primary" link @click="$copyText(item.token)">
              {{ $t('复制') }}
            </el-button>
          </p>
          <p class="text-[#303133] font-medium mb-[16px]">{{ $t('使用说明') }}</p>
          <p
            class="text-xs text-[#596780] leading-4"
            v-for="item in RUseTipCreateSingleTip"
            :key="item"
          >
            {{ $t(item) }}
          </p>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ISingelGroupList } from '@/interface/release'
import { RUseTipCreateSingleTip } from '@/constant/release'

defineProps<{
  domainId: number
  singleGroupList: ISingelGroupList[]
  baseURL: string
}>()

const activeNames = ref<number>()
</script>
