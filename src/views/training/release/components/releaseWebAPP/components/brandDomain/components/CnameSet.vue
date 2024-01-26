<template>
  <div class="w-full">
    <el-form label-position="top" ref="cnameSetForm" :model="cnameSetModel" class="cname-set-form">
      <el-form-item class="text-[#303133]">
        <template #label>
          <p class="font-medium">{{ $t('1.配置CNAME') }}</p>
        </template>
        <p>
          {{ $t('腾讯云备案，请在域名服务网址上添加CNAME记录指向') }}
          ：lb-dakiz3dz-xqijdy8pkuzsm4gw.clb.ap-shanghai.tencentclb.com
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
              v-model:value="cnameUpload.pub_key"
              :disabled="cnameUpload.pub_key.length > 0"
              :name="$t(`上传证书文件`)"
              :extra="$t(`后缀为：*.pem或*.crt的文件`)"
              :maxSize="0.5"
              :limitType="['.pem', '.crt']"
            />
          </div>
          <div class="w-full">
            <UploadFile
              v-model:value="cnameUpload.pri_key"
              :disabled="cnameUpload.pri_key.length > 0"
              :name="$t(`上传私钥文件`)"
              :extra="$t(`后缀为：*.key的文件`)"
              :maxSize="0.5"
              :limitType="['.key']"
            />
          </div>
        </el-form-item>
        <el-form-item>
          <el-row justify="end" class="w-full">
            <el-col :lg="4" :xl="4" :md="12" :xs="12" :sm="12">
              <el-button type="primary" size="large" :disabled="disabled" @click="handleSubmit">
                {{ $t('提交审核') }}
              </el-button>
            </el-col>
          </el-row>
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>
<script lang="ts" setup>
import useGlobalProperties from '@/composables/useGlobalProperties'
import { EBrandCreateEditStatusType } from '@/enum/domain'
import type { IBrandDomainType, IBrandDomainTypeKeyFile } from '@/interface/release'
import { useBase } from '@/stores/base'
import { cosServe } from '@/utils/cos'
import { $notnull } from '@/utils/help'
import type { FormInstance, UploadUserFile } from 'element-plus'
import { ElLoading, ElNotification as Notification } from 'element-plus'
import { storeToRefs } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import UploadFile from '../../UploadFile.vue'

const { t } = useI18n()
const props = defineProps<{
  slug: string
  status: EBrandCreateEditStatusType
  brandDomainInfo: IBrandDomainTypeKeyFile
}>()
const emit = defineEmits(['nextClick', 'handleSubmitSuccess'])
const base = useBase()
const { userInfo } = storeToRefs(base)
const { postCommonGraph } = useGlobalProperties()
const cnameSetForm = ref<FormInstance>()
const cnameUpload = reactive({
  pub_key: [],
  pri_key: []
})
const cnameSetModel = reactive<IBrandDomainType>({
  id: 0,
  hostname: '',
  record: '',
  status: EBrandCreateEditStatusType.create,
  pub_key: '',
  pri_key: ''
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

const handleSubmit = async () => {
  // 提交审核
  const loading = ElLoading.service({
    lock: true,
    text: t('保存中'),
    background: 'rgba(0, 0, 0, 0.7)'
  })
  const ch = {
    id: props.brandDomainInfo?.id === 0 ? null : props.brandDomainInfo?.id,
    hostname: cnameSetModel?.hostname,
    record: cnameSetModel?.record,
    pub_key: JSON.stringify(cnameSetModel?.pub_key),
    pri_key: JSON.stringify(cnameSetModel?.pri_key),
    expired: 0,
    memo: '',
    domain_slug: props.slug,
    uid: userInfo.value.id,
    s_status: 'pending'
  }
  const res = await postCommonGraph('custom_host/save', ch)
  loading.close()
  if (res.data.code === 200) {
    Notification.success(t('操作成功，正在审核中....'))
    emit('handleSubmitSuccess')
  } else {
    Notification.success(res.data.message)
  }
}

const onUploadPriFile = async (key: string, fileList: UploadUserFile[]) => {
  return await cosServe(fileList.at(-1).raw, `domain/${key}`, false, fileList.at(-1).name)
}

const watchAndUpload = (keyType: 'pem' | 'key', propName: 'pri_key' | 'pub_key') => {
  watch(
    () => cnameUpload[propName],
    async (v) => {
      const res = await onUploadPriFile(keyType, v)
      cnameSetModel[propName] = res
    }
  )
}

watchAndUpload('pem', 'pri_key')
watchAndUpload('key', 'pub_key')

watch(
  () => props.brandDomainInfo,
  (v) => {
    if ($notnull(v)) {
      cnameSetModel.id = v.id
      cnameSetModel.status = EBrandCreateEditStatusType.update
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
</style>
