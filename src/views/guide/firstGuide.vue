<template>
  <div
    class="fixed top-0 left-0 right-0 bottom-0 z-[9999] bg-white bg-[url('@/assets/img/first-guide-bg.png')] bg-center bg-cover bg-no-repeat overflow-hidden"
  >
    <div
      class="py-3 text-base font-medium leading-5 border-b border-solid border-t-0 border-l-0 border-r-0 border-[#E4E7ED] box-border"
    >
      <ChatoDomainAvatar :avatar-size="32" :font-size="16" class="!text-[#3D3D3D] mx-auto" />
    </div>
    <div
      ref="scrollContainerRef"
      v-loading="loading"
      element-loading-background="rgba(255, 255, 255, 0.08)"
      class="h-[calc(100%-57px)] overflow-y-auto px-[30%] lg:px-4 xl:px-[18%] 2xl:px-[24%] pt-3 pb-8 space-y-4"
    >
      <Transition name="left">
        <div v-show="currentStep > 0">
          <ChatoDomainAvatar />
          <div class="left-bubble">
            <div class="title !mb-2">
              <img src="@/assets/img/emoji/surprise.png" class="w-5" />
              {{ $t('Hi，欢迎进入 Chato 世界！') }}
            </div>
            <p>
              {{
                $t('很高兴认识你，我可以帮助你 10 秒快速定制 AI 机器人，并应用在各种渠道中使用。')
              }}
            </p>
          </div>
        </div>
      </Transition>
      <Transition name="left">
        <div v-show="currentStep > 1">
          <ChatoDomainAvatar />
          <div class="left-bubble">
            <div class="title">
              <img src="@/assets/img/emoji/bot.png" class="w-5" />
              {{ $t('请选择你想尝试制作什么机器人？') }}
            </div>
            <div class="flex flex-wrap gap-3">
              <span
                v-for="item in interestDomains"
                :key="item.id"
                @click="onSelectInterest(item)"
                class="select-tag"
              >
                {{ item.name }}
              </span>
            </div>
          </div>
        </div>
      </Transition>
      <Transition name="right">
        <div v-show="currentStep > 1 && formState.interests" class="flex justify-end">
          <div class="right-bubble">{{ formState.interests }}</div>
        </div>
      </Transition>
      <Transition name="left" v-if="isAdditions">
        <div v-show="currentStep > 2">
          <ChatoDomainAvatar />
          <div class="left-bubble">
            <div class="title">
              <img src="@/assets/img/emoji/tip.png" class="w-5" />
              {{ $t('请选择你会将机器人应用在什么场景？') }}
            </div>
            <div class="flex justify-between gap-4 w-full mb-10 flex-col">
              <div
                class="flex-col border rounded-lg text-[#596780] cursor-pointer border-solid border-[#E4E7ED] bg-white"
                v-for="item in ScenesList"
                @click="onSelectScenes(item)"
                :key="item.value"
                :class="{
                  '!border-[#7C5CFC]': item.value === formState.organization_type
                }"
              >
                <div class="py-3 px-7 lg:pl-5 flex items-center flex-col">
                  <div
                    class="w-10 h-10 text-xl flex items-center justify-center bg-[#F2F3F5] rounded-full m-0 mb-2"
                  >
                    <svg-icon
                      :name="item.icon"
                      :class="{
                        '!text-[#7C5CFC]': item.value === formState.organization_type
                      }"
                    />
                  </div>
                  <div class="text-center">
                    <div class="text-sm font-medium text-[#303133] mb-2">{{ item.label }}</div>
                    <div class="text-xs information">
                      {{ item.information }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
      <Transition name="right" v-if="isAdditions">
        <div v-show="currentStep > 2 && formState.organization_type_name" class="flex justify-end">
          <div class="right-bubble">{{ formState.organization_type_name }}</div>
        </div>
      </Transition>
      <Transition name="left">
        <div v-show="currentStep > 3">
          <ChatoDomainAvatar />
          <div class="left-bubble">
            <div class="title">
              <img src="@/assets/img/emoji/yeah.png" class="w-5" />
              {{ $t('收到，AI 机器人雏形已定制完成！') }}
            </div>
            <el-button :loading="saving" type="primary" round @click="onGotoCreate">
              {{ $t('快去看看') }}
            </el-button>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { updateDomain } from '@/api/domain'
import { getFirstGuideInterestDomains } from '@/api/industry'
import useGlobalProperties from '@/composables/useGlobalProperties'
import { EDomainStatus } from '@/enum/domain'
import { EUserOrganizationRole } from '@/enum/userInformation'
import type { IDomainInfo } from '@/interface/domain'
import router, { RoutesMap } from '@/router'
import { useBase } from '@/stores/base'
import { storeToRefs } from 'pinia'
import { nextTick, reactive, ref, watch } from 'vue'
import ChatoDomainAvatar from './components/ChatoDomainAvatar.vue'

// const ScenesList = [
//   { label: '企业降本增效', value: EUserOrganizationRole.company },
//   { label: '个人工作学习提效', value: EUserOrganizationRole.person }
// ] as const

const ScenesList = [
  {
    label: '公司业务使用',
    value: EUserOrganizationRole.company,
    icon: 'company',
    information: '用于公司业务中的营销、提效、降本等'
  },
  {
    label: '个人体验使用',
    value: EUserOrganizationRole.person,
    icon: 'person',
    information: '用于个人提效、创作、娱乐等'
  }
] as const

const baseStoreI = useBase()
const { userInfo } = storeToRefs(baseStoreI)
const { postCommonGraph } = useGlobalProperties()
let isAdditions = true
const formState = reactive<{
  interests: string
  organization_type: EUserOrganizationRole
  organization_type_name: string
}>({
  interests: '',
  organization_type: null,
  organization_type_name: ''
})
const loading = ref(false)
const interestDomains = ref<IDomainInfo[]>([])
const currentStep = ref(0)
let selectInterestDomain: IDomainInfo = null

const increaseStep = () => {
  currentStep.value += 1
}

const delayIncreaseStep = (time = 300) => {
  setTimeout(() => {
    increaseStep()
  }, time)
}

const onSelectInterest = (item: IDomainInfo) => {
  if (formState.interests) {
    return
  }
  formState.interests = item.name
  selectInterestDomain = item
  delayIncreaseStep()
  if (!isAdditions) {
    delayIncreaseStep()
  }
}

const onSelectScenes = (item: (typeof ScenesList)[number]) => {
  if (formState.organization_type) {
    return
  }
  formState.organization_type = item.value
  formState.organization_type_name = item.label
  delayIncreaseStep()
}

const saving = ref(false)
const onGotoCreate = async () => {
  try {
    saving.value = true
    if (isAdditions) {
      await postCommonGraph('chato_orgs/save', {
        id: userInfo.value.org.id,
        additions: JSON.stringify({
          interests: [formState.interests],
          organization_type: formState.organization_type
        })
      })
      baseStoreI.getUserInfo()
    }

    const {
      data: { data }
    } = await postCommonGraph<IDomainInfo>('chato_domains/save', {
      creator_id: userInfo.value.id,
      updater_id: userInfo.value.id,
      org: userInfo.value.org.id,
      desc_show: 0,
      name: '',
      status: 2,
      avatar: 'https://afu-1255830993.cos.ap-shanghai.myqcloud.com/447479457016221696.png'
    })
    const { id, slug } = data
    const { name, avatar, system_prompt, desc, welcome } = selectInterestDomain
    const domainState: Partial<IDomainInfo> = {
      id,
      slug,
      name,
      avatar,
      desc,
      system_prompt,
      welcome,
      status: EDomainStatus.able
    }
    await updateDomain(id, domainState)
    await router.push({ name: RoutesMap.tranning.botChat, params: { botId: id } })
  } catch (e) {
  } finally {
    saving.value = false
  }
}

const init = async () => {
  try {
    loading.value = true
    const {
      data: { data }
    } = await getFirstGuideInterestDomains()
    //  getCommonGraph<IDomainInfo[]>(`chato_domains`, {
    //   filter: `org_id==208 and visible==1 and template==1`
    // })
    const userInfoRes = await baseStoreI.getUserInfo()
    if (userInfoRes.org.additions) {
      const { organization_type, organization_type_name } = JSON.parse(userInfoRes.org.additions)
      formState.organization_type = organization_type
      formState.organization_type_name = organization_type_name
      isAdditions = false
    }
    increaseStep()
    delayIncreaseStep(500)
    interestDomains.value = data
  } catch (e) {
  } finally {
    loading.value = false
  }
}

init()

const scrollContainerRef = ref()
let latestScrollHeight = 0

const onScrollBottom = () => {
  nextTick(() => {
    const { scrollHeight, scrollTop } = scrollContainerRef.value

    if (latestScrollHeight !== scrollHeight && scrollHeight > scrollTop) {
      latestScrollHeight = scrollHeight
      scrollContainerRef.value.scrollTo({
        top: scrollHeight,
        behavior: 'smooth'
      })
    }
  })
}

watch(currentStep, () => {
  onScrollBottom()
})
</script>

<style lang="scss" scoped>
.left-bubble {
  @apply w-fit mt-2 mr-3 bg-white rounded-2xl rounded-tl-[2px] overflow-hidden py-3 px-4 text-[15px] tracking-[0.13px] text-[#596780] break-words leading-6;

  .title {
    @apply flex items-center gap-1 font-medium text-[#303133] break-words mb-3;
  }

  .select-tag {
    @apply inline-block border border-solid border-[#E4E7ED] text-[13px] leading-5 py-[6px] px-4 cursor-pointer rounded-[18px] transition-colors hover:opacity-80;
  }
}

.right-bubble {
  @apply w-fit ml-3 bg-[#7C5CFC] rounded-2xl rounded-br-[2px] overflow-hidden py-3 px-4 text-[15px] tracking-[0.13px] text-white break-words leading-6;
}

.left-enter-active,
.left-leave-active {
  transition: all 0.5s ease;
}
.left-enter-from,
.left-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.right-enter-active,
.right-leave-active {
  transition: all 0.5s ease;
}
.right-enter-from,
.right-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
