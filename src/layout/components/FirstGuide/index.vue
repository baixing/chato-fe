<template>
  <div class="create-bot-body" v-if="visible">
    <div class="create-bot-container" :style="{ width: isMobile ? '95%' : '576px' }">
      <div class="px-[40px]">
        <div class="flex justify-between items-center mb-1 font-medium text-[18px]">
          <span>{{ $t('欢迎加入Chato') }}</span>
          <span class="text-[14px]">{{ index }}/3</span>
        </div>
        <p class="md:mb-[12px] mb-[32px]">{{ $t('我们将根据你的回答，提供更好地服务') }}</p>
        <p class="text-sm font-medium md:mb-2 mb-4" v-if="index !== 3">
          {{ index === 1 ? t('所在行业') : t('预期希望解决的问题') }}
        </p>
        <AllIndusty
          v-if="index === 1"
          :index="index"
          v-model:value="industyName"
          :currentSelect="currentIndusty"
          :list="industy"
          :showUserInput="showInputIndusty"
          @handleSelect="handleIndusty"
        />
        <AllIndusty
          v-else-if="index === 2"
          v-model:value="questionName"
          :index="index"
          :currentSelect="curentQuestion"
          :list="questions"
          :showUserInput="showInputQustion"
          @handleSelect="handleIndusty"
        />
        <UserDusty v-else :jobList="jobList" @handleChange="(e) => (userDustyInfo = e)" />
      </div>

      <el-row
        class="w-full md:mt-[10px] mt-[24px] pl-[40px] pr-[26px]"
        :justify="index === 1 ? 'end' : 'space-between'"
      >
        <el-col class="" :md="12" :xs="12" :sm="12" :lg="6" v-if="[2, 3].includes(index)">
          <el-button class="justify-start" circle link size="large" @click="index -= 1">
            {{ $t('上一步') }}
          </el-button>
        </el-col>
        <el-col :md="12" :xs="12" :sm="12" :lg="6">
          <el-button
            type="primary"
            round
            :class="['rounded-full', disabled ? 'disabled-btn' : '']"
            size="large"
            @click="handleStep"
            >{{ [1, 2].includes(index) ? $t('下一步') : $t('完成') }}</el-button
          >
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getFirstGuideSelect, postFirstGuideSelect } from '@/api/release'
import { useBasicLayout } from '@/composables/useBasicLayout'
import { useAuthStore } from '@/stores/auth'
import { useBase } from '@/stores/base'
import { $notnull } from '@/utils/help'
import { ElLoading, ElNotification as Notification } from 'element-plus'
import { storeToRefs } from 'pinia'
import { computed, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AllIndusty from './AllIndusty.vue'
import UserDusty from './UserDusty.vue'

interface UserDustyInfo {
  surname: string
  company: string
  job: string
}

const baseStoreI = useBase()
const { isMobile } = useBasicLayout()
const { cookieToken } = useAuthStore()
const { userInfo } = storeToRefs(baseStoreI)
const index = ref<number>(1)
const loading = ref(null)
const visible = ref(false)
const authToken = cookieToken
// 行业
const currentIndusty = ref<string>('')
const industyName = ref<string>('')
const showInputIndusty = ref<boolean>(false)
const industy = ref<string[]>([])
const questions = ref<string[]>([])
// 解决问题
const curentQuestion = ref<string[]>([])
const questionName = ref<string>('')
const showInputQustion = ref<boolean>(false)
// 用户信息
const jobList = ref<string[]>([])
const userDustyInfo = ref<UserDustyInfo>()

const { t } = useI18n()
const disabled = computed(() =>
  index.value === 1 ? !currentIndusty.value : !curentQuestion.value.length
)

const handleIndusty = (item: string, index: number) => {
  if (index === 1) {
    currentIndusty.value = currentIndusty.value === item ? '' : item
    showInputIndusty.value = currentIndusty.value === t('其他') ? true : false
  } else {
    const index = curentQuestion.value.findIndex((i) => i === item)
    index < 0 ? curentQuestion.value.push(item) : curentQuestion.value.splice(index, 1)
    showInputQustion.value = curentQuestion.value.includes(t('其他')) ? true : false
  }
}

const handleStep = async () => {
  if (index.value === 1 && !industyName.value && !currentIndusty.value) {
    return Notification.error(t('请选择您所在行业'))
  }
  if (index.value === 2 && !curentQuestion.value.length && !questionName.value) {
    return Notification.error(t('请选择您预期希望解决的问题'))
  }

  if (index.value === 3) {
    if ($notnull(userDustyInfo.value) && userDustyInfo.value.job) {
      try {
        loading.value = ElLoading.service({
          lock: true,
          text: t('提交中'),
          background: 'rgba(0, 0, 0, 0.7)'
        })
        const industry =
          currentIndusty.value === t('其他') ? industyName.value : currentIndusty.value
        curentQuestion.value.push(questionName.value)
        await postFirstGuideSelect({
          industry,
          interests: curentQuestion.value,
          ...userDustyInfo.value
        })
        visible.value = false
        baseStoreI.getUserInfo()
      } catch (e) {
      } finally {
        loading.value.close()
        index.value = 1
      }
      return
    } else {
      return Notification.error(t('请选择您的职位'))
    }
  }
  index.value = index.value + 1
}

const init = async () => {
  try {
    const {
      data: { data }
    } = await getFirstGuideSelect()
    industy.value = data.industry
    questions.value = data.interest
    jobList.value = data.job
    visible.value = true
  } catch (e) {}
}

const watchUserInfo = watch(userInfo, () => {
  const showAuth =
    userInfo.value.id === userInfo.value.org.owner_id && !userInfo.value.org.additions
  showAuth && !authToken ? init() : (visible.value = false)
})

onUnmounted(() => {
  watchUserInfo()
})
</script>

<style lang="scss" scoped>
.create-bot-body {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  z-index: 2014;
  background-color: var(--el-overlay-color-lighter);
}
.disabled-btn {
  color: var(--el-button-disabled-text-color);
  cursor: not-allowed;
  background-image: none;
  background-color: var(--el-button-disabled-bg-color);
  border-color: var(--el-button-disabled-border-color);
}

.create-bot-container {
  max-height: 95%;
  overflow-y: scroll;
  box-sizing: border-box;
  position: fixed;
  left: 50%;
  top: 50%;
  z-index: 10;
  transform: translate(-50%, -50%);
  padding: 30px 0;
  background: url('@/assets/img/first-guide-bg.png') no-repeat;
  background-color: #fff;
  background-position: center;
  background-size: cover;
  font-size: 12px;
  color: #303133;
  line-height: 28px;
  letter-spacing: 0.08em;
  text-align: left;
  border-radius: 16px;
  cursor: pointer;
}
</style>
