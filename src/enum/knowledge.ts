export const enum EDocumentOperateType {
  update = 'update',
  preview = 'preview',
  create = 'create',
  delete = 'delete',
  retry = 'retry'
}

export const enum EDocumentTabType {
  uploadDoc = 'upload-doc',
  inputText = 'input-text',
  inputUrl = 'input-url',
  inputPublic = 'input-public'
}

export const enum EKnowledgeBusinessType {
  document = 'document',
  qa = 'qa'
}

export enum QuestionMateEnumType {
  all = 'all',
  vague = 'vague'
}

export enum LearningStatesPerformanceType {
  all = 'all',
  pending = 'pending',
  parsing = 'parsing',
  learned = 'learned',
  learning = 'learning',
  error = 'error',
  crawl_error = 'crawl_error',
  deleted = 'deleted'
}

export enum DeleteRetryFileMateStatusType {
  deleted = 'deleted',
  pending = 'pending'
}

export enum EDocConvertOrDisuse {
  convert = 'convert',
  disuse = 'disuse'
}

export enum EDocConvertCheckStatus {
  pending = 'pending',
  done = 'done'
}
