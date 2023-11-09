<template>
  <Modal
    v-model:visible="internalVisible"
    :show-close="false"
    width="764px"
    class="md:max-h-[70%]"
    :footer-attrs="{ submitId: 'Chato_tranning_create_domain_by_template', submitting }"
    @submit="onSubmit"
  >
    <div class="flex gap-4 flex-wrap mb-6 lg:gap-3 lg:mb-4">
      <div
        v-for="item in templateTypeKeys"
        :key="item"
        :class="[
          'cursor-pointer px-6 py-2 text-xs text-[#303133] bg-[#F2F3F5] w-fit rounded-[18px] transition-colors lg:px-4 lg:py-1 hover:text-[#7C5CFC]',
          activeTemplateType === item && '!bg-[#7C5CFC] text-white font-medium hover:!text-white'
        ]"
        @click="activeTemplateType = item"
      >
        {{ item }}
      </div>
    </div>

    <el-row
      justify="start"
      :gutter="16"
      class="gap-y-4 max-h-[364px] md:max-h-[224px] overflow-y-auto"
    >
      <el-col
        v-for="item in templateWithDomains[activeTemplateType]"
        :key="item.id"
        :md="12"
        :lg="8"
      >
        <div
          @click="formTemplateId = item.id"
          :class="[
            'box-border flex items-center gap-2 p-4 rounded bg-white text-[#596780] font-medium text-sm transition-colors border border-solid border-[#E4E7ED] cursor-pointer hover:border-[#7C5CFC]',
            item.id === formTemplateId && '!border-[#7C5CFC]'
          ]"
        >
          <Avatar
            :avatar="item.avatar ?? DefaultAvatar"
            :size="32"
            :name="item.name.slice(0, 2)"
            class="w-8 h-8 rounded-full shrink-0"
          />
          <p class="truncate flex-1">{{ item.name }}</p>
        </div>
      </el-col>
    </el-row>
  </Modal>
</template>
<script lang="ts" setup>
import { getTemplateList } from '@/api/user'
import DefaultAvatar from '@/assets/img/avatar.png'
import Modal from '@/components/Modal/index.vue'
import type { IDomainInfo } from '@/interface/domain'
import { ElNotification } from 'element-plus'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  visible: boolean
}>()

const { t } = useI18n()

const emit = defineEmits(['update:visible', 'submit'])

const internalVisible = computed({
  get: () => props.visible,
  set: (v) => emit('update:visible', v)
})
const formTemplateId = ref<number>()

const submitting = ref(false)

const templateWithDomains = ref<Record<string, IDomainInfo[]>>({})
const templateTypeKeys = ref<string[]>([])
const activeTemplateType = ref('')
const domainsKeyByTemplateId: Record<number, IDomainInfo> = {}

const initTemplates = async () => {
  try {
    const {
      data: { data }
    } = await getTemplateList()

    const resTemplateWithDomains: Record<string, IDomainInfo[]> = {}
    const resTemplateTypeKeys: string[] = []
    data.map((item) => {
      const itemKey = Object.keys(item)[0]
      const itemDomains = Object.values(item)[0]
      itemDomains.map((dItem) => {
        domainsKeyByTemplateId[dItem.id] = dItem
      })
      resTemplateTypeKeys.push(itemKey)
      resTemplateWithDomains[itemKey] = item[itemKey]
    })

    templateWithDomains.value = resTemplateWithDomains
    templateTypeKeys.value = resTemplateTypeKeys
    activeTemplateType.value = resTemplateTypeKeys[0]
  } catch (err) {
  } finally {
  }
}

const onSubmit = async () => {
  if (!formTemplateId.value) {
    ElNotification.error(t('请选择机器人模板'))
    return
  }

  try {
    submitting.value = true
    emit('submit', domainsKeyByTemplateId[formTemplateId.value])
  } catch (err) {
  } finally {
    submitting.value = false
    internalVisible.value = false
  }
}

onMounted(() => {
  initTemplates()
})

watch(internalVisible, (v) => {
  v && (formTemplateId.value = null)
})
</script>
