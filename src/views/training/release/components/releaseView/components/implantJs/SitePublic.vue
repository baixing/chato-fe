<template>
  <el-form
    ref="ruleFormCreateSiteRef"
    size="large"
    label-position="top"
    :rules="rulesCreateSitePublic"
    :model="inputCreateSiteForm"
    class="input-text-form"
  >
    <el-form-item :label="$t(`站点名称`)" prop="source">
      <el-input
        type="text"
        v-model="inputCreateSiteForm.source"
        :placeholder="$t(`请输入站点名称`)"
      />
    </el-form-item>
    <el-form-item :label="$t(`展现形式`)" prop="show_location">
      <div class="flex justify-between w-full">
        <div
          :class="[
            'w-[48%] flex flex-col justify-center items-center text-[#596780] cursor-pointer',
            inputCreateSiteForm.show_location === item.id ? 'active-show-loaction' : ''
          ]"
          v-for="item in ShowLocationList"
          :key="item.id"
        >
          <img
            :src="item.url"
            class="md:mr-0 w-[100%] rounded-[16px] mb-[12px]"
            @click="inputCreateSiteForm.show_location = item.id"
          />
          <span>{{ $t(item.name) }}</span>
        </div>
      </div>
    </el-form-item>
    <template v-if="inputCreateSiteForm.show_location === ESiteShowLocationType.lower_right">
      <el-form-item :label="$t(`弹出频率`)" prop="popup">
        <el-radio-group v-model="inputCreateSiteForm.popup">
          <el-radio v-for="item in PopupList" :key="item.id" :label="item.id">
            {{ $t(item.name) }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <template v-if="inputCreateSiteForm.popup === ESitePopupType.active">
        <el-form-item prop="popup_frequency">
          <NumberInput
            prefix="访问停留"
            suffix="秒后自动弹出"
            inputClass="!w-32"
            v-model:value="inputCreateSiteForm.popup_frequency"
          />
        </el-form-item>
        <el-form-item>
          <div class="flex items-center justify-between w-full">
            {{ $t('气泡展示') }}
            <SwitchWithStateMsg v-model:value="inputCreateSiteForm.show_bubble" />
          </div>
        </el-form-item>
      </template>
      <el-form-item :label="$t('气泡颜色')">
        <div class="flex justify-start items-center text-xs">
          <div class="flex flex-col items-center justify-between w-full mr-10">
            <el-color-picker v-model="inputCreateSiteForm.suspend_style" />
            <span class="mt-2">{{ $t('外层') }}</span>
          </div>
          <div class="flex flex-col items-center justify-between w-full">
            <el-color-picker class="mb-2" v-model="inputCreateSiteForm.suspend_style_color" />
            <span class="mt-1">{{ $t('内层') }}</span>
          </div>
        </div>
      </el-form-item>
    </template>
  </el-form>
  <slot :submit="inputCreateSiteForm" :ruleFormCreateSiteRef="ruleFormCreateSiteRef"></slot>
</template>
<script lang="ts" setup>
import siteShowFull from '@/assets/img/release/site-show-full.png'
import siteShowRight from '@/assets/img/release/site-show-right.png'
import NumberInput from '@/components/Input/NumberInput.vue'
import SwitchWithStateMsg from '@/components/SwitchWithStateMsg/index.vue'
import { ESitePopupType, ESiteShowLocationType } from '@/enum/release'
import { $notnull } from '@/utils/help'
import { reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const props = withDefaults(
  defineProps<{
    source?: string
    popupFrequency?: number
    popup: ESitePopupType
    showLocation: ESiteShowLocationType
    showBubble?: number
    visible?: boolean
    suspend_style?: string
    suspend_style_color?: string
  }>(),
  {
    source: '',
    popupFrequency: 0,
    popup: ESitePopupType.passive,
    showLocation: ESiteShowLocationType.lower_right,
    showBubble: 1,
    suspend_style: '#4C83F3',
    suspend_style_color: '#FFFFFF'
  }
)
const ShowLocationList = [
  {
    id: ESiteShowLocationType.lower_right,
    name: '右下角',
    url: siteShowRight
  },
  {
    id: ESiteShowLocationType.full,
    name: '全页面',
    url: siteShowFull
  }
]
const PopupList = [
  {
    id: ESitePopupType.active,
    name: '主动弹出'
  },
  {
    id: ESitePopupType.passive,
    name: '不主动弹出'
  }
]

const ruleFormCreateSiteRef = ref()
const rulesCreateSitePublic = reactive({
  name: [{ required: true, trigger: 'blur', message: t('请输入站点名字') }]
})

const inputCreateSiteForm = reactive({
  source: '',
  show_location: ESiteShowLocationType.lower_right,
  show_bubble: 1,
  popup: ESitePopupType.passive,
  popup_frequency: 10,
  suspend_style: '#4C83F3',
  suspend_style_color: '#FFFFFF'
})

watch(
  props,
  (v) => {
    if ($notnull(v)) {
      inputCreateSiteForm.source = v.source
      inputCreateSiteForm.show_location = v.showLocation || ESiteShowLocationType.lower_right
      inputCreateSiteForm.show_bubble = v.showBubble
      inputCreateSiteForm.popup = v.popup || ESitePopupType.passive
      inputCreateSiteForm.popup_frequency = v.popupFrequency
      inputCreateSiteForm.suspend_style = v.suspend_style
      inputCreateSiteForm.suspend_style_color = v.suspend_style_color
    }
  },
  { deep: true, immediate: true }
)
</script>

<style lang="less" scoped>
.active-show-loaction {
  @apply text-[#7c5cfc] font-medium;
  img {
    @apply border border-[#7c5cfc] border-solid;
  }
}
</style>
