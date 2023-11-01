import { useBase } from '@/stores/base'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

export const ABTestCaseViewMapper = [
  'viewA',
  'viewB',
  'viewC',
  'viewD',
  'viewE',
  'viewF',
  'viewG',
  'viewH',
  'viewI',
  'viewJ'
] as const

export default function useABTest(caseNum: number) {
  const baseStoreI = useBase()
  const { abTestConfig } = storeToRefs(baseStoreI)

  const currentABTestConfig = computed(() =>
    abTestConfig.value && caseNum in abTestConfig.value ? Number(abTestConfig.value[caseNum]) : 0
  )
  const currentABTestView = computed<string>(() => ABTestCaseViewMapper[currentABTestConfig.value])

  const executeABTestFn = (fnConfig: Record<(typeof ABTestCaseViewMapper)[number], Function>) => {
    return fnConfig[currentABTestView.value]?.()
  }

  return { currentABTestView, currentABTestConfig, abTestConfig, executeABTestFn }
}
