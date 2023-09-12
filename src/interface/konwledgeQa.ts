import type { EDocumentOperateType, QuestionMateEnumType } from '@/enum/knowledge'
export interface IQAForm {
  title?: string
  content?: string
  id?: number
  image?: string
  images?: string[]
  question_id?: number
  modalType?: EDocumentOperateType
  status?: EDocumentOperateType
}

export interface questionMateType {
  name: string
  value: QuestionMateEnumType
  extra: string
  mate?: QuestionMateEnumType
}
