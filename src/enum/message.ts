export const enum EMessageEvalution {
  dislike = 'dislike',
  like = 'like',
  none = 'none'
}

export const enum EMessageDisplayType {
  question = 'question',
  answer = 'answer',
  remove = 'remove'
}

export const enum EMessageActionType {
  none = 'none', // 空状态
  retry = 'retry', // 重试
  copy = 'copy', // 复制
  delete = 'delete', // 删除
  like = 'like', // 赞
  dislike = 'dislike', // 踩
  translate = 'translate', // 翻译
  expand = 'expand', // 拓展
  fix = 'fix', // 修正
  save = 'save', // 保存
  audio = 'audio' // 语音播报
}

export const enum ChatHistoryParamsSource {
  all = 'all',
  customer = 'customer',
  admin = 'admin'
}

export const enum EWsMessageStatus {
  pending = 'pending',
  done = 'done',
  running = 'running',
  error = 'error',
  forbid = 'forbid',
  forbid_quota = 'forbid_quota', // 额度不足
  continue = 'continue' // 继续
}

export const enum EMessageType {
  text = 'text',
  image = 'image',
  mjImage = 'mj_image',
  end_flow = 'end_flow'
}
