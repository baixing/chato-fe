<template>
  <Modal
    mobile-width="95%"
    v-model:visible="internalVisible"
    :title="$t(`创建站点`)"
    :footer="false"
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
          >
            {{ $t('确认并查看') }}
          </el-button>
        </el-col>
      </el-row>
    </SitePublic>
  </Modal>
</template>

<script lang="ts" setup>
import { postCommonGraph } from '@/api/graph'
import Modal from '@/components/Modal/index.vue'
import type { ISetSiteFormType } from '@/interface/release'
import { ElLoading, ElNotification as Notification } from 'element-plus'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import SitePublic from './SitePublic.vue'

const props = defineProps<{
  value: boolean
  slug: string
}>()
const emit = defineEmits(['update:value', 'showDrawerSite'])

const { t } = useI18n()
const loading = ref()
const internalVisible = computed({
  get: () => props.value,
  set: (v) => emit('update:value', v)
})

async function submitCreateSite(formEl, data: ISetSiteFormType) {
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
          id: null,
          domain_slug: props.slug,
          ...data
        }

        const res = await postCommonGraph('share_channel/save', {
          ...postData
        })
        //  createDeleteEditSites(props.slug, postData)
        loading.value.close()
        Notification({
          type: res.data.code === 200 ? 'success' : 'error',
          message: res.data.message
        })
        if (res.data.code === 200) {
          emit('update:value', false)
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
