<template>
  <el-form
    ref="formRef"
    :model="formState"
    label-position="top"
    :rules="formRules"
    class="bot-create-form"
  >
    <el-form-item :label="t('角色名字')" prop="role" required>
      <HansInputLimit
        v-model:value="formState.role"
        type="text"
        size="large"
        :placeholder="$t(`例如：营销助手、客服专员等`)"
        :limit="20"
        class="w-full"
      />
    </el-form-item>
    <el-form-item :label="t('角色需求')">
      <HansInputLimit
        v-model:value="formState.role_requirement"
        type="textarea"
        size="large"
        :placeholder="$t('例如：制定专业的苹果手机营销计划和策略')"
        :rows="4"
        :limit="300"
        class="w-full"
      />
    </el-form-item>
  </el-form>

  <div v-show="AIGenerateVisible" class="mb-14">
    <div class="label-title flex justify-between items-center">
      <span class="text-[#596780] font-normal">
        {{ AIGenerateLoading ? $t('正在为您生成...') : $t('已为您生成') }}
      </span>
      <el-button
        v-show="AIGenerateVisible && !AIGenerateLoading"
        link
        type="primary"
        :icon="RefreshRight"
        @click="onAIGenerate"
        >{{ $t('重新生成') }}</el-button
      >
    </div>
    <div class="bg-white rounded-lg p-6">
      <p class="label-title !text-[#596780] !font-normal">{{ $t('简介') }}</p>
      <HansInputLimit
        v-model:value="formState.desc"
        type="textarea"
        :rows="6"
        size="large"
        disabled
        class="w-full mb-6"
      />

      <p class="label-title !text-[#596780] !font-normal">
        {{ $t('角色描述') }}
      </p>
      <HansInputLimit
        v-model:value="formState.system_prompt"
        type="textarea"
        :rows="6"
        size="large"
        disabled
        class="w-full mb-6"
      />
      <p class="label-title !text-[#596780] !font-normal">{{ $t('欢迎语') }}</p>
      <HansInputLimit
        v-model:value="formState.welcome"
        type="textarea"
        :rows="6"
        size="large"
        disabled
        class="w-full"
      />
    </div>
  </div>

  <el-button
    :disabled="AIGenerateVisible && AIGenerateLoading"
    size="large"
    @click="onBtnClick"
    type="primary"
    :id="`${
      AIGenerateVisible
        ? 'Chato_tranning_create_domain_by_ai'
        : 'Chato_tranning_create_domain_ai_generate'
    }`"
  >
    {{ AIGenerateVisible ? $t('确认并创建') : $t('AI 一键生成') }}
  </el-button>
</template>
<script lang="ts" setup>
import { createDomainByAI } from '@/api/user'
import HansInputLimit from '@/components/Input/HansInputLimit.vue'
import useSpaceRights from '@/composables/useSpaceRights'
import { EDomainAIGenerateType } from '@/enum/domain'
import { ESpaceRightsType } from '@/enum/space'
import SSE from '@/utils/sse'
import { RefreshRight } from '@element-plus/icons-vue'
import { ElLoading, ElNotification, type FormInstance, type FormRules } from 'element-plus'
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const emit = defineEmits(['saveSuccess'])

let formState = reactive<{
  role: string
  role_requirement: string
  desc: string
  welcome: string
  system_prompt: string
}>({
  role: '',
  role_requirement: '',
  desc: '',
  welcome: '',
  system_prompt: ''
})
const formRef = ref<FormInstance>()
const formRules = reactive<FormRules>({
  role: [{ required: true, message: t('角色名字不能为空'), trigger: 'change' }]
})

const AIGenerateVisible = ref(false)
const AIGenerateLoading = ref(false)

const SSEInstance = new SSE()

const onSSE = (type: EDomainAIGenerateType) => {
  return SSEInstance.request(
    '/prompt/generated',
    {
      role: formState.role,
      user_prompt: formState.role_requirement,
      generate_type: type
    },
    (str) => {
      switch (type) {
        case EDomainAIGenerateType.intro:
          formState.desc += str
          break
        case EDomainAIGenerateType.role:
          formState.system_prompt += str
          break
        case EDomainAIGenerateType.welcome:
          formState.welcome += str
          break
      }
    }
  )
}

const onAIGenerate = async () => {
  try {
    await formRef.value.validate()
    AIGenerateVisible.value = true
    AIGenerateLoading.value = true
    formState = Object.assign(formState, {
      desc: '',
      welcome: '',
      system_prompt: ''
    })
    const allPromises = [
      EDomainAIGenerateType.intro,
      EDomainAIGenerateType.role,
      EDomainAIGenerateType.welcome
    ].map((item) => onSSE(item))
    await Promise.all(allPromises)
  } catch (e) {
  } finally {
    AIGenerateLoading.value = false
  }
}

const loading = ref()
const { checkRightsTypeNeedUpgrade } = useSpaceRights()

const onBtnClick = async () => {
  const needUpgrade = await checkRightsTypeNeedUpgrade(ESpaceRightsType.bot)
  if (needUpgrade) {
    return
  }

  if (AIGenerateVisible.value) {
    try {
      loading.value = ElLoading.service({
        lock: true,
        text: t('创建中...'),
        background: 'rgba(0, 0, 0, 0.7)'
      })
      const {
        data: { data }
      } = await createDomainByAI(formState)

      emit('saveSuccess', data.id)
      ElNotification.success(t('创建成功'))
    } catch (err) {
    } finally {
      loading.value.close()
    }
  } else {
    onAIGenerate()
  }
}
</script>
<style lang="scss" scoped>
.label-title {
  @apply text-[#303133] text-sm leading-4 font-medium tracking-[0.13px] mb-4;
}

.bot-create-form {
  :deep(.el-form-item__label) {
    @apply label-title;
  }
}
</style>
