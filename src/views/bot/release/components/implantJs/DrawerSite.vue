<template>
  <el-drawer
    v-model="visible"
    :title="$t(`我的站点`)"
    :before-close="() => (visible = false)"
    class="create-drawer-container"
    :size="isMobile ? '100%' : '40%'"
  >
    <el-collapse v-model="activeNames" accordion>
      <el-collapse-item v-for="(item, index) in sitesList" :key="item.id" :name="item.source">
        <template #title>
          <p class="leading-5 break-all">{{ $t('站点') }}{{ index + 1 }}：{{ item.source }}</p>
        </template>
        <div>
          <SitePublic v-slot="slotProps" :name="item.source">
            <div class="text-xs">
              <p class="text-[#303133] text-sm mb-[12px]">{{ $t('JS代码') }}</p>
              <p class="copy-code-title">
                {{ $t('机器人代码，请将此 iframe 添加到您的 html 代码中') }}
              </p>
              <div
                class="copy-code-container markdown-body"
                v-html="renderMarkdown('```html' + item.codeIframeHtml)"
              />
              <p class="copy-code-title">
                {{ $t('添加聊天气泡，请复制添加到您的 html中') }}
              </p>
              <div
                class="copy-code-container markdown-body"
                v-html="renderMarkdown('```js' + item.codeContent)"
              />
            </div>

            <el-row class="w-full mt-2 mr-0" justify="end" :gutter="8">
              <el-col :lg="4" :xl="4" :xs="12" :sm="12" :md="12">
                <el-button size="large" @click="removeSite(item.id, item.source)">
                  {{ $t('删除') }}
                </el-button>
              </el-col>
              <el-col :lg="4" :xl="4" :xs="12" :sm="12" :md="12">
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
import { createDeleteEditSites, getCreateSites } from '@/api/iframe'
import { useBasicLayout } from '@/composables/useBasicLayout'
import type { ICreateDeleteEditSitesData, ICreateSitesChannelsRes } from '@/interface/release'
import { renderMarkdown } from '@/utils/markdown'
import type { FormInstance } from 'element-plus'
import { ElLoading, ElMessageBox, ElNotification as Notification } from 'element-plus'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import SitePublic from './SitePublic.vue'
const { t } = useI18n()
const { isMobile } = useBasicLayout()

interface EidtSiteData {
  name: string
}

const props = defineProps<{
  slug: string
  value: boolean
  chatWebPage: string
  tip_chato_color: string
  suspend_style: string
  chato_script_checkDomain: string
  chatScript: string
}>()
const emit = defineEmits(['update:value'])
const visible = computed({
  get: () => props.value,
  set: (val) => emit('update:value', val)
})
const loading = ref()
const activeNames = ref('')
const sitesList = ref<ICreateSitesChannelsRes[]>([])

const codeIframeHtml = (source: string) => {
  const iframeSrc = `${props.chatWebPage}?source=${source}`
  return `
    <iframe
    src="${iframeSrc}"
    width="408px"
    height="594px"
    frameborder="0"
    />
  `
}

const codeContent = (source) => {
  const scriptSrc = `${props.chatWebPage}?source=${source}`
  return `
    <script>
    window.tip_chato_color="${props.tip_chato_color}";
    window.tip_chato_bg="${props.suspend_style}";
    window.chato_iframe_src = "${scriptSrc}";
    window.chato_script_checkDomain = "${props.chato_script_checkDomain}";
    var st = document.createElement("script");
    st.type="text/javascript";
    st.async = true;
    st.src = "${props.chatScript}";
    var header = document.getElementsByTagName("head")[0];
    header.appendChild(st);
    </scr${'ipt>'}
  `
}

const submitEditSite = async (formEl: FormInstance, data: EidtSiteData, id: number) => {
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
          source: data.name,
          status: 'update'
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
  ElMessageBox.confirm(t('删除不可恢复，你确认要删除吗？'), t('温馨提示'), {
    confirmButtonText: t('确认'),
    cancelButtonText: t('取消'),
    type: 'warning'
  })
    .then(() => {
      const data = {
        id,
        source,
        status: 'delete'
      }
      updateSites(data)
    })
    .catch(() => {})
}

const updateSites = async (data: ICreateDeleteEditSitesData) => {
  const res = await createDeleteEditSites(props.slug, data)
  Notification({
    type: res.data.code === 200 ? 'success' : 'error',
    message: res.data.message
  })
  res.data.code === 200 ? initSitesList() : ''
}

const initSitesList = async () => {
  const res = await getCreateSites(props.slug)
  if (res.data.code === 200) {
    const channels = res.data.data.channels
    sitesList.value = channels.map((item) => ({
      ...item,
      codeContent: codeContent(item.source),
      codeIframeHtml: codeIframeHtml(item.source)
    }))
  }
}

watch(sitesList, (v) => {
  activeNames.value = v.length > 0 ? v[v.length - 1].source : ''
})

watch([() => props.value, () => props.slug], ([newValue1, newValue2], [oldValue1, oldValue2]) => {
  if (newValue1 === true || newValue2 !== oldValue2) {
    initSitesList()
  }
})
</script>
<style lang="scss" scoped>
.copy-code-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  color: #606266;
  font: 12px/12px Source Han Sans CN;
}

.copy-code-container {
  overflow: scroll;
  width: 100%;
  margin-bottom: 16px;
  border-radius: 8px;
  color: rgba(61, 61, 61, 0.35);
  word-break: break-all;

  pre {
    code {
      white-space: break-spaces;
    }
  }
}
</style>
<style lang="scss">
.create-drawer-container {
  .el-drawer__header {
    margin-bottom: 20px;
    color: #303133;
    font-weight: 500;
  }
  .el-drawer__body {
    padding-top: 0;
  }
  .el-collapse {
    border-top: none;
  }
  .el-form-item__label {
    color: #303133;
    font-size: 14px;
  }
}
</style>
