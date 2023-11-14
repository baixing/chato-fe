import { LearningStatesPerformanceType } from '@/enum/knowledge'

export const KnowledgeLearningFinalStatus = [
  LearningStatesPerformanceType.crawl_error,
  LearningStatesPerformanceType.learned,
  LearningStatesPerformanceType.error
]

export const KnowledgeQuestionConvertQABtn = {
  0: '生成问答',
  1: '生成中',
  2: '审阅问答'
}
