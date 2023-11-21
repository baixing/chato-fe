<template>
  <div class="create-bot-body box-border flex items-center justify-center" v-if="visible">
    <div
      class="create-bot-card w-[460px] min-h-[426px] lg:min-h-[446px] lg:w-11/12 pt-8 flex flex-col items-center bg-white rounded-2xl px-10"
    >
      <Transition name="logo" v-show="seep > 0">
        <div class="w-full flex flex-col items-center">
          <div
            class="w-16 h-16 bg-white rounded-full shadow-3xl flex justify-center items-center mb-5"
          >
            <svg-icon name="logo" class="text-4xl" />
          </div>
          <div class="text-[##303133] font-medium mb-5">{{ $t('Hi，我是Chato小助理！') }}</div>
        </div>
      </Transition>
      <Transition name="chato">
        <div
          v-show="seep > 1"
          class="text-[#596780] text-xs font-normal text-center leading-5 mb-6"
        >
          <p class="w-[310px] lg:w-full">
            {{ $t('很高兴认识你，Chato可以帮你简单、快速定制AI机器人，并应用在各种渠道中使用。') }}
          </p>
        </div>
      </Transition>
      <Transition name="button">
        <div v-show="seep > 2" class="w-full flex flex-col items-center">
          <div class="text-[##303133] font-medium text-sm mb-3">
            {{ $t('你会将机器人应用在什么场景？') }}
          </div>
          <div class="flex justify-between gap-4 w-full mb-10">
            <div
              class="text-[#596780] py-3 px-7 w-1/2 flex lg:flex-col cursor-pointer items-center justify-between border rounded-lg border-solid border-[#E4E7ED] bg-white"
              v-for="item in ScenesList"
              @click="userInfoOrganization = item.value"
              :key="item.value"
              :class="{
                '!text-[#7C5CFC]': item.value === userInfoOrganization,
                '!border-[#7C5CFC]': item.value === userInfoOrganization
              }"
            >
              <div
                class="w-10 h-10 text-xl flex items-center justify-center bg-[#F2F3F5] rounded-full lg:mb-1"
              >
                <svg-icon :name="item.icon" />
              </div>
              <div class="text-xs font-medium">{{ item.label }}</div>
            </div>
          </div>
          <el-button
            class="mb-9 w-32 !h-9 !rounded-full !text-white !text-sm"
            :disabled="userInfoOrganization === undefined"
            @click="onChato"
            type="primary"
          >
            {{ $t('进入chato') }}
          </el-button>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { saveFirstGuideAdditions } from '@/api/industry'
import { getMyOrgs } from '@/api/org'
import { EUserOrganizationRole } from '@/enum/userInformation'
import { useAuthStore } from '@/stores/auth'
import { useBase } from '@/stores/base'
import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'

const userInfoOrganization = ref<EUserOrganizationRole>()
const baseStoreI = useBase()
const { cookieToken } = useAuthStore()
const { userInfo } = storeToRefs(baseStoreI)
const seep = ref(0)
const visible = ref(false)
const authToken = cookieToken

const ScenesList = [
  { label: '企业用户', value: EUserOrganizationRole.company, icon: 'company' },
  { label: '个人用户', value: EUserOrganizationRole.person, icon: 'person' }
] as const

const delayIncreaseStep = (time = 300) => {
  setTimeout(() => {
    seep.value++
  }, time)
}

const init = async () => {
  try {
    visible.value = true
    delayIncreaseStep(400)
    delayIncreaseStep(1200)
    delayIncreaseStep(2000)
  } catch (e) {}
}

const onChato = async () => {
  await saveFirstGuideAdditions({
    organization_type: userInfoOrganization.value
  })
  const res = await getMyOrgs()
  const org = res.data?.data?.[0] || {}
  baseStoreI.updateOrgInfo(org)
  visible.value = false
}

watch(userInfo, () => {
  const contrastId = userInfo.value.id === userInfo.value.org.owner_id
  const showAuth = contrastId && !userInfo.value.org.additions
  showAuth && !authToken ? init() : (visible.value = false)
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
.create-bot-card {
  background: url('@/assets/img/first-guide-bg.png') no-repeat;
  background-color: #fff;
  background-position: center;
  background-size: cover;
}
.logo-enter-active,
.logo-leave-active {
  transition: all 0.5s ease;
}
.logo-enter-from,
.logo-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.chato-enter-active,
.chato-leave-active {
  transition: all 0.5s ease;
}
.chato-enter-from,
.chato-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.button-enter-active,
.button-leave-active {
  transition: all 0.5s ease;
}
.button-enter-from,
.button-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
