<template>
  <div class="w-full userDusty-container">
    <el-form label-position="top" :rules="rules" :model="form">
      <el-form-item :label="$t('请选择身份')">
        <div class="flex justify-between items-center w-full">
          <div
            v-for="item in identityList"
            :class="[
              'w-[30%] text-[#596780]  rounded-lg py-[16px] flex flex-col justify-center items-center border-solid border-1 border-[#E4E7ED]',
              $notnull(currentIdentity) && currentIdentity.name === item.name
                ? '!border-[#7C5CFC] text-[#7C5CFC]'
                : ''
            ]"
            :key="item.id"
            @click="currentIdentity = item"
          >
            <div
              class="bg-[#F2F3F5] flex justify-center items-center w-[56px] h-[56px] rounded-full"
            >
              <svg-icon class="!w-[26px] !h-[25px]" :name="item.icon" />
            </div>
            <span class="mt-[12px] break-all text-center">{{ $t(item.name) }}</span>
            <span class="text-[12px] h-8 text-[#7C5CFC] leading-4 px-1">
              {{ item.tips ? $t(item.tips) : '' }}
            </span>
          </div>
        </div>
      </el-form-item>
      <el-form-item
        v-if="$notnull(currentIdentity)"
        :label="$t(currentIdentity.label)"
        prop="input"
      >
        <el-input
          size="large"
          v-model="form.input"
          class="w-full"
          :placeholder="$t(currentIdentity.placeholder)"
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { $notnull } from '@/utils/help'
import { EUserOriganizationRole } from '@/enum/userInformation'
import type { IUserIdentity } from '@/interface/userInformation'

const { t } = useI18n()
const emit = defineEmits(['handleChange'])
const props = defineProps<{
  defaultIdentity: Partial<IUserIdentity>
}>()
const identityList = [
  {
    id: 'company',
    name: '企业用户',
    icon: 'enterprise-users',
    label: '公司名称',
    placeholder: '请输入公司名称',
    tips: '可免费创建数字分身'
  },
  {
    id: 'person',
    name: '个人用户',
    icon: 'individual-users',
    label: '您的称呼',
    placeholder: '例如张女士、李先生'
  },
  {
    id: 'other',
    name: '其他组织',
    icon: 'other',
    label: '组织名称',
    placeholder: '请输入组织名称'
  }
]
const currentIdentity = ref()
const rules = reactive({
  input: [
    {
      required: true,
      message: t($notnull(currentIdentity.value) ? currentIdentity.value.placeholder : ''),
      trigger: 'blur'
    }
  ]
})
const form = reactive({
  input: ''
})

watch([() => form.input, currentIdentity], () => {
  const userIndentityResult = {
    organization_type: currentIdentity.value.id,
    company: '',
    surname: ''
  }
  currentIdentity.value.id !== EUserOriganizationRole.person
    ? (userIndentityResult.company = form.input)
    : (userIndentityResult.surname = form.input)
  emit('handleChange', userIndentityResult)
})

watch(
  props.defaultIdentity,
  (v) => {
    const index = identityList.findIndex((item) => $notnull(v) && item.id === v.organization_type)
    form.input = v.company || v.surname || ''
    currentIdentity.value = index !== -1 ? identityList[index] : {}
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
.userDusty-container {
  :deep(.el-form-item__label) {
    font-weight: bold;
    color: #3d3d3d;
  }

  :deep(.el-input__wrapper) {
    border-radius: 9999px;
  }
}
</style>
