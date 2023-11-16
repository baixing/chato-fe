<template>
  <Modal
    width="45%"
    mobile-width="100%"
    v-model:visible="visible"
    :title="$t(`配置小程序`)"
    :footer="false"
  >
    <el-tabs v-model="activeName">
      <el-tab-pane :label="$t(`直接发布`)" name="directTab">
        <ExperienceApplet :value="activeName === 'directTab' && props.value" :slug="slug" />
      </el-tab-pane>
      <el-tab-pane :label="$t(`授权发布`)" name="empowerTab">
        <CreateApplet
          :visible="visible"
          :domainId="props.domainId"
          :defaultAppletcStatus="props.defaultAppletcStatus"
          @handleView="emit('handleView')"
        />
      </el-tab-pane>
      <el-tab-pane :label="$t(`校验发布`)" name="verificationTab">
        <VerificationTxt :chatAPI="chatAPI" />
      </el-tab-pane>
    </el-tabs>
  </Modal>
</template>

<script setup lang="ts">
import type { EAppletcStatus } from '@/enum/release'
import { computed, ref } from 'vue'
import CreateApplet from './CreateApplet.vue'
import ExperienceApplet from './ExperienceApplet.vue'
import VerificationTxt from './VerificationTxt.vue'

const props = defineProps<{
  value: boolean
  domainId: number
  defaultAppletcStatus: EAppletcStatus
  slug: string
  chatAPI: string
}>()
const emit = defineEmits(['update:value', 'handleView'])
const activeName = ref('directTab')

const visible = computed({
  get: () => props.value,
  set: (val) => emit('update:value', val)
})
</script>
