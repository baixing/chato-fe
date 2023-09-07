<template>
  <el-skeleton v-if="templateLoading" :rows="5" animated class="text-left" />
  <template v-else>
    <div class="flex gap-4 flex-wrap mb-6 lg:gap-3 lg:mb-4">
      <div
        v-for="item in templateTypeKeys"
        :key="item"
        :class="[
          'cursor-pointer px-6 py-2 text-xs text-[#303133] bg-white w-fit rounded-[18px] hover:text-[#7C5CFC]',
          activeTemplateType === item && '!bg-[#7C5CFC] text-white font-medium hover:!text-white'
        ]"
        @click="activeTemplateType = item"
      >
        {{ item }}
      </div>
    </div>

    <el-row justify="start" :gutter="20" class="gap-y-5">
      <el-col v-for="item in viewDomains" :key="item.id" :sm="24" :md="12" :lg="6">
        <BotTemplateCard
          :domain="item"
          :active="item.id === formTemplateId"
          @select="onSelectTemplate"
        />
      </el-col>
      <el-col
        v-if="
          !templateLoading && activeTemplateType === templateTypeKeys[0] && viewDomains.length >= 16
        "
        :sm="24"
        :md="12"
        :lg="6"
      >
        <div
          class="box-border w-full rounded-lg bg-white text-sm text-center transition ease-linear border border-solid border-white cursor-pointer h-[94px] leading-[94px] hover:shadow-md text-[#7c5cfc]"
          @click="viewHasMore = !viewHasMore"
        >
          {{ viewHasMore ? $t('展开更多') : $t('收起') }}
        </div>
      </el-col>
    </el-row>

    <el-button
      size="large"
      @click="onSubmit"
      type="primary"
      data-script="Chato-createBot-confirm"
      class="mt-7"
      id="Chato_tranning_create_domain_by_template"
      >{{ $t('确认并创建') }}</el-button
    >
  </template>
</template>
<script lang="ts" setup>
import { createDomainV2, getTemplateList } from '@/api/user'
import useSpaceRights from '@/composables/useSpaceRights'
import { ESpaceRightsType } from '@/enum/space'
import type { IDomainInfo } from '@/interface/domain'
import { ElLoading, ElNotification as Notification } from 'element-plus'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import BotTemplateCard from './BotTemplateCard.vue'

const { t } = useI18n()
const { checkRightsTypeNeedUpgrade } = useSpaceRights()

const emit = defineEmits(['saveSuccess'])

const loading = ref()
const templateLoading = ref(false)
const formTemplateId = ref<number>()

const templateWithDomains = ref<Record<string, IDomainInfo[]>>({})
const templateTypeKeys = ref<string[]>([])
const activeTemplateType = ref('')
const viewHasMore = ref(true)

const viewDomains = computed<IDomainInfo[]>(() => {
  let res = templateWithDomains.value[activeTemplateType.value]
  if (activeTemplateType.value === templateTypeKeys.value[0] && viewHasMore.value) {
    return res.slice(0, 16)
  } else {
    return res
  }
})

const onSelectTemplate = (item: IDomainInfo) => {
  formTemplateId.value = item.id
}

const initTemplates = async () => {
  templateLoading.value = true
  try {
    const {
      data: { data }
    } = await getTemplateList()

    const resTemplateWithDomains: Record<string, IDomainInfo[]> = {}
    const resTemplateTypeKeys: string[] = []
    data.map((item) => {
      const itemKey = Object.keys(item)[0]
      resTemplateTypeKeys.push(itemKey)
      resTemplateWithDomains[itemKey] = item[itemKey]
    })

    templateWithDomains.value = resTemplateWithDomains
    templateTypeKeys.value = resTemplateTypeKeys
    activeTemplateType.value = resTemplateTypeKeys[0]
  } catch (err) {
  } finally {
    templateLoading.value = false
  }
}

const onSubmit = async () => {
  const needUpgrade = await checkRightsTypeNeedUpgrade(ESpaceRightsType.bot)
  if (needUpgrade) {
    return
  }

  if (!formTemplateId.value) {
    Notification.error(t('请选择机器人模板'))
    return
  }

  try {
    loading.value = ElLoading.service({
      lock: true,
      text: t('创建中...'),
      background: 'rgba(0, 0, 0, 0.7)'
    })
    const {
      data: { data }
    } = await createDomainV2(formTemplateId.value)

    emit('saveSuccess', data.id)
    Notification.success(t('创建成功'))
  } catch (err) {
  } finally {
    loading.value.close()
  }
}

onMounted(() => {
  initTemplates()
})
</script>
