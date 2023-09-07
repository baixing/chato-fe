<template>
  <el-form
    ref="ruleFormCreateSiteRef"
    size="large"
    label-position="top"
    :rules="rulesCreateSitePublic"
    :model="inputCreateSiteForm"
    class="input-text-form"
  >
    <el-form-item :label="$t(`站点名称`)" prop="name">
      <el-input
        type="text"
        v-model="inputCreateSiteForm.name"
        :placeholder="$t(`请输入站点名称`)"
      ></el-input>
    </el-form-item>
  </el-form>
  <slot :submit="inputCreateSiteForm" :ruleFormCreateSiteRef="ruleFormCreateSiteRef"></slot>
</template>
<script lang="ts" setup>
import { onUnmounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const props = withDefaults(
  defineProps<{
    name?: string
  }>(),
  {
    name: ''
  }
)

const ruleFormCreateSiteRef = ref()

const rulesCreateSitePublic = reactive({
  name: [{ required: true, trigger: 'blur', message: t('请输入站点名字') }]
})

const inputCreateSiteForm = reactive({
  name: ''
})

const watchProps = watch(
  props,
  (v) => {
    inputCreateSiteForm.name = v.name
  },
  { deep: true, immediate: true }
)

onUnmounted(() => {
  watchProps()
})
</script>
