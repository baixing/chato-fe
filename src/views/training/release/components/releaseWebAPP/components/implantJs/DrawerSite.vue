<template>
  <el-drawer
    v-model="visible"
    :title="$t(`我的站点`)"
    :before-close="() => (visible = false)"
    :size="isMobile ? '100%' : '40%'"
  >
    <el-collapse v-model="activeNames" accordion>
      <el-collapse-item v-for="(item, index) in sitesList" :key="item.id" :name="item.source">
        <template #title>
          <p class="leading-5 break-all">{{ $t('站点') }}{{ index + 1 }}：{{ item.source }}</p>
        </template>
        <div>
          <SitePublic
            v-slot="slotProps"
            :source="item.source"
            :popupFrequency="item.popup_frequency"
            :popup="item.popup"
            :showLocation="item.show_location"
            :showBubble="item.show_bubble"
            :suspend_style="item.suspend_style"
            :suspend_style_color="item.suspend_style_color"
            :visible="visible"
          >
            <div class="text-xs">
              <p class="text-[#303133] text-sm mb-[12px]">{{ $t('嵌入到网站中') }}</p>
              <template v-if="slotProps.submit.show_location === ESiteShowLocationType.full">
                <p class="mb-4 text-[#606266]">
                  {{ $t('请以下iframe 嵌入到您的网站中目标位置') }}
                </p>
                <div
                  class="markdown-body"
                  v-html="renderMarkdown('```html' + item.codeIframeHtml)"
                />
              </template>
              <template v-else>
                <p class="mb-4 text-[#606266]">
                  {{ $t('添加聊天气泡，请将以下代码嵌入到你的网站中') }}
                </p>
                <div class="markdown-body" v-html="renderMarkdown('```js' + item.codeContent)" />
              </template>
            </div>

            <el-row class="w-full mt-2 mr-0" justify="end" :gutter="8">
              <el-col :lg="4" :xl="4" :xs="12" :sm="12" :md="12">
                <el-button size="large" @click="removeSite(item.id, item.source)">
                  {{ $t('删除') }}
                </el-button>
              </el-col>
              <el-col
                :lg="4"
                :xl="4"
                :xs="12"
                :sm="12"
                :md="12"
                v-if="slotProps.submit.show_location === ESiteShowLocationType.lower_right"
              >
                <el-button
                  type="primary"
                  size="large"
                  @click="
                    submitEditSite(slotProps.ruleFormCreateSiteRef, slotProps.submit, item.id)
                  "
                >
                  {{ $t('更新') }}
                </el-button>
              </el-col>
            </el-row>
          </SitePublic>
        </div>
      </el-collapse-item>
    </el-collapse>
  </el-drawer>
</template>
<script lang="ts" setup>
import { getCommonGraph, postCommonGraph } from '@/api/graph'
import { useBasicLayout } from '@/composables/useBasicLayout'
import { CHATO_SOURCE_JS } from '@/constant/common'
import { ESiteShowLocationType, ESiteStatus } from '@/enum/release'
import type {
  ICreateSitesChannelsRes,
  ISaveSitesParams,
  ISetSiteFormType
} from '@/interface/release'
import { renderMarkdown } from '@/utils/markdown'
import dayjs from 'dayjs'
import type { FormInstance } from 'element-plus'
import { ElLoading, ElMessageBox, ElNotification as Notification } from 'element-plus'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import SitePublic from './SitePublic.vue'
const { t } = useI18n()
const { isMobile } = useBasicLayout()

const props = defineProps<{
  slug: string
  value: boolean
  chatScript: string
  chatWebPage: string
  wwwBaseURL: string
  baseURL: string
}>()
const emit = defineEmits(['update:value'])
const visible = computed({
  get: () => props.value,
  set: (val) => emit('update:value', val)
})
const loading = ref()
const activeNames = ref('')
const sitesList = ref<ICreateSitesChannelsRes[]>([])

const codeIframeHtml = () => {
  return `
  <iframe
  src="${props.chatWebPage}?source=${CHATO_SOURCE_JS}"
  style="width: 100%;height: 100%;min-height: 700px;"
  frameborder="0"
  allow="microphone">
  </iframe>
  `
}

const codeContent = (id: number) => {
  return `
  <script>
  window.ChatoBotConfig = {
    baseURL: "${props.baseURL}",
    wwwBaseURL: "${props.wwwBaseURL}",
    token: "${props.slug}",
    id: ${id}
  }
  var st = document.createElement("script");
  st.type = 'module';
  st.async = true;st.src = "${props.chatScript}";
  var header = document.getElementsByTagName("head")[0];
  header.appendChild(st);
  <\/script>
  `
}

const submitEditSite = async (formEl: FormInstance, data: ISetSiteFormType, id: number) => {
  if (!formEl) return
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      try {
        loading.value = ElLoading.service({
          lock: true,
          text: t('更新中...'),
          background: 'rgba(0, 0, 0, 0.7)'
        })
        const postData = {
          id,
          status: ESiteStatus.update,
          ...data
        }
        updateSites(postData)
        loading.value.close()
      } catch (e) {
        loading.value.close()
      }
    } else {
      console.log('error submit!', fields)
    }
  })
}

const removeSite = (id: number, source: string) => {
  ElMessageBox.confirm(t('删除后，请移除嵌入到你网站中的代码，你确认要删除吗？'), t('温馨提示'), {
    confirmButtonText: t('确认'),
    cancelButtonText: t('取消'),
    type: 'warning'
  })
    .then(() => {
      const data = {
        id,
        source,
        status: ESiteStatus.delete
      }
      updateSites(data)
    })
    .catch(() => {})
}

const updateSites = async (data: Partial<ISaveSitesParams>) => {
  const params = {
    ...data,
    domain_slug: props.slug,
    deleted: data.status === ESiteStatus.delete ? dayjs().format('YYYY-MM-DD HH:mm:ss') : null
  }

  delete params.status

  const res = await postCommonGraph('share_channel/save', {
    ...params
  })
  // createDeleteEditSites(props.slug, data)
  initSitesList()
  Notification({
    type: 'success',
    message: res.data.message
  })
}

const initSitesList = async () => {
  const res = await getCommonGraph<ICreateSitesChannelsRes[]>('share_channel', {
    filter: `domain_slug=="${props.slug}"`
  })
  // getCreateSites(props.slug)
  const channels = res.data.data
  sitesList.value = channels.map((item) => ({
    ...item,
    codeContent: codeContent(item.id),
    codeIframeHtml: codeIframeHtml()
  }))
}

watch(sitesList, (v) => {
  activeNames.value = v.length ? v[v.length - 1].source : ''
})

watch([() => props.value, () => props.slug], ([newValue1, newValue2], [, oldValue2]) => {
  if (newValue1 === true || newValue2 !== oldValue2) {
    initSitesList()
  }
})
</script>
