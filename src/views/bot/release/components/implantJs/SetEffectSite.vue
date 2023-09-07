<template>
  <Modal
    mobile-width="100%"
    v-model:visible="internalVisible"
    :title="$t(`创建站点`)"
    :footer="false"
    class="set-site-container"
  >
    <SitePublic v-slot="slotProps" name="">
      <el-row class="w-full mt-2 mr-0" justify="end" :gutter="8">
        <el-col :lg="4" :xl="4" :xs="12" :sm="12" :md="12">
          <el-button size="large" @click="emit('update:value', false)">{{ $t('取消') }}</el-button>
        </el-col>
        <el-col :lg="4" :xl="4" :xs="12" :sm="12" :md="12">
          <el-button
            type="primary"
            size="large"
            @click="submitCreateSite(slotProps.ruleFormCreateSiteRef, slotProps.submit)"
            >{{ $t('确认') }}</el-button
          >
        </el-col>
      </el-row>
    </SitePublic>
  </Modal>
</template>
<script lang="ts" setup>
import { createDeleteEditSites } from '@/api/iframe'
import Modal from '@/components/Modal/index.vue'
import { ElLoading, ElNotification as Notification } from 'element-plus'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import SitePublic from './SitePublic.vue'
const { t } = useI18n()
const loading = ref()

interface SiteData {
  name: string
}

const props = defineProps<{
  value: boolean
  slug: string
}>()

const emit = defineEmits(['update:value', 'handleUpSitesList', 'showDrawerSite'])

const internalVisible = computed({
  get: () => props.value,
  set: (v) => emit('update:value', v)
})

async function submitCreateSite(formEl, data: SiteData) {
  if (!formEl) return
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      try {
        loading.value = ElLoading.service({
          lock: true,
          text: t('创建中...'),
          background: 'rgba(0, 0, 0, 0.7)'
        })
        const postData = {
          id: 0,
          source: data.name,
          status: 'create'
        }
        const res = await createDeleteEditSites(props.slug, postData)
        loading.value.close()
        Notification({
          type: res.data.code === 200 ? 'success' : 'error',
          message: res.data.message
        })
        if (res.data.code === 200) {
          emit('update:value', false)
          emit('handleUpSitesList')
          emit('showDrawerSite')
        }
      } catch (e) {
        loading.value.close()
      }
    } else {
      console.log('error submit!', fields)
    }
  })
}
</script>
<style lang="scss">
.set-site-container {
  .el-dialog__header {
    margin-right: 0;
  }
  .el-dialog__body {
    padding-top: 0;
    padding-bottom: 24px;
  }
}
</style>
