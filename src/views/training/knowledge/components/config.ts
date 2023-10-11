import { LearningStatesPerformanceType } from '@/enum/knowledge'
import { FILE_STATUS_NAMES } from '@/utils/formatter'
export const selectableDeclarations = [
  {
    label: FILE_STATUS_NAMES.all,
    value: LearningStatesPerformanceType.all
  },
  {
    label: FILE_STATUS_NAMES.learned,
    value: LearningStatesPerformanceType.learned
  },
  {
    label: FILE_STATUS_NAMES.error,
    value: LearningStatesPerformanceType.error
  },
  {
    label: FILE_STATUS_NAMES.learning,
    value: LearningStatesPerformanceType.learning
  },
  {
    label: FILE_STATUS_NAMES.parsing,
    value: LearningStatesPerformanceType.parsing
  },
  {
    label: FILE_STATUS_NAMES.pending,
    value: LearningStatesPerformanceType.pending
  }
]
