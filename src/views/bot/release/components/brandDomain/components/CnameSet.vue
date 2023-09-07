<template>
  <div class="w-full">
    <el-form label-position="top" ref="cnameSetForm" :model="cnameSetModel" class="cname-set-form">
      <el-form-item class="text-[#303133]">
        <template #label>
          <p class="font-medium">{{ $t('1.配置CNAME') }}</p>
        </template>
        <p>
          {{
            $t(
              '腾讯云备案，请在域名服务网址上添加CNAME记录指向：lb-ni22fj7z-behsioq6t9mx2w15.clb.ap-shanghai.tencentclb.com'
            )
          }}
        </p>
        <p class="mt-[16px]">
          <el-checkbox v-model="checked">{{ $t('已完成配置') }}</el-checkbox>
        </p>
      </el-form-item>
      <div :class="[!checked ? 'cnameSet-overlay' : '']">
        <el-form-item class="required-item text-[#303133]">
          <template #label>
            <p class="font-medium">
              {{ $t('2.填写域名和备案信息 ') }}<span class="text-[#7C5CFC] font-medium">*</span>
            </p>
          </template>
          <p>{{ $t('输入独立域名') }}</p>
          <el-input
            v-model="cnameSetModel.hostname"
            :placeholder="$t(`例：x.chato.cn`)"
            class="my-4"
          ></el-input>
          <p>{{ $t('输入备案信息') }}</p>
          <el-input
            v-model="cnameSetModel.record"
            :placeholder="$t(`例：粤.ICP备.xxxxxxxx号`)"
            class="my-4"
          ></el-input>
        </el-form-item>
        <el-form-item class="required-item text-[#303133]">
          <template #label>
            <p class="font-medium">
              {{ $t('3.上传安全证书 ') }}<span class="text-[#7C5CFC] font-medium">*</span>
            </p>
          </template>
          <p class="my-4 text-[#9DA3AF] text-xs">
            {{ $t('需要从购买证书的服务网站上下载证书后，在此上传') }}
          </p>
          <div class="w-full">
            <UploadFile
              v-model:value="cnameSetModel.pub_key"
              :disabled="cnameSetModel.pub_key.length > 0"
              :apiUpload="apiUpload"
              :name="$t(`上传证书文件`)"
              :extra="$t(`后缀为：*.pem或*.crt的文件`)"
              accept-type=".pem,.crt"
            />
          </div>
          <div class="w-full">
            <UploadFile
              v-model:value="cnameSetModel.pri_key"
              :disabled="cnameSetModel.pri_key.length > 0"
              :apiUpload="apiUpload"
              :name="$t(`上传私钥文件`)"
              :extra="$t(`后缀为：*.key的文件`)"
              accept-type=".key"
            />
          </div>
        </el-form-item>
        <el-form-item>
          <el-row justify="end" class="w-full">
            <el-col :lg="4" :xl="4" :md="12" :xs="12" :sm="12">
              <el-button type="primary" size="large" :disabled="disabled" @click="handleSubmit">{{
                $t('提交审核')
              }}</el-button>
            </el-col>
          </el-row>
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>
<script lang="ts" setup>
import { saveBrandDomain } from '@/api/release'
import type { UploadResType } from '@/components/ImgUpload/data'
import { currentEnvConfig } from '@/config'
import { brandCreateEditStatusType } from '@/enum/domain'
import type { brandDomainType, brandDomainTypeKeyFile } from '@/interface/release'
import { useDomainStore } from '@/stores/domain'
import { $notnull } from '@/utils/help'
import * as url from '@/utils/url'
import type { FormInstance } from 'element-plus'
import { ElLoading, ElNotification as Notification } from 'element-plus'
import { storeToRefs } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import UploadFile from './UploadFile.vue'

const { t } = useI18n()
type cnameSetModelType = brandDomainType & {
  pub_key: UploadResType[]
  pri_key: UploadResType[]
}
const props = defineProps<{
  slug: string
  status: brandCreateEditStatusType
  brandDomainInfo: brandDomainTypeKeyFile
}>()
const emit = defineEmits(['nextClick', 'handleSubmitSuccess'])
const route = useRoute()
const domainStoreI = useDomainStore()
const { domainInfo } = storeToRefs(domainStoreI)
const domainId = (domainInfo.value.id || route.params.botId).toString()
const cnameSetForm = ref<FormInstance>()
const cnameSetModel = reactive<cnameSetModelType>({
  id: 0,
  hostname: '',
  record: '',
  pub_key: [],
  pri_key: [],
  status: brandCreateEditStatusType.create
})
const checked = ref(false)
const disabled = computed(() => {
  let disable = false
  for (const key in cnameSetModel) {
    if (!$notnull(cnameSetModel[key])) {
      disable = true
    }
  }
  return disable
})
const apiUpload = url.join(currentEnvConfig.uploadBaseURL, '/chato/api/file/upload/file')

const PubkeyToData = (pubKey: UploadResType[]) => {
  return pubKey.length > 0
    ? JSON.stringify(pubKey.map((item) => ({ name: item.name, url: item.url }))[0])
    : ''
}

const handleSubmit = async () => {
  // 提交审核
  const loading = ElLoading.service({
    lock: true,
    text: t('保存中'),
    background: 'rgba(0, 0, 0, 0.7)'
  })
  const data = {
    ...cnameSetModel,
    id: $notnull(props.brandDomainInfo) ? props.brandDomainInfo.id : 0,
    expired: 0,
    memo: '',
    status: $notnull(props.brandDomainInfo)
      ? brandCreateEditStatusType.create
      : brandCreateEditStatusType.update,
    pub_key: PubkeyToData(cnameSetModel.pub_key),
    pri_key: PubkeyToData(cnameSetModel.pri_key)
  }
  const res = await saveBrandDomain(props.slug, data)
  loading.close()
  if (res.data.code === 200) {
    Notification.success(t('操作成功，正在审核中....'))
    emit('handleSubmitSuccess')
  } else {
    Notification.success(res.data.message)
  }
}

watch(
  () => props.brandDomainInfo,
  (v) => {
    if ($notnull(v)) {
      cnameSetModel.id = v.id
      cnameSetModel.status = brandCreateEditStatusType.update
    }
  },
  { immediate: true, deep: true }
)
</script>
<style lang="scss" scoped>
.cnameSet-overlay {
  position: relative;
  &::after {
    display: inline-block;
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    opacity: 0.5;
    background: #fff;
  }
}
.required-item {
}
</style>
