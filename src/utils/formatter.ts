import { UPLOAD_FILE_FORCED_CONVERSION_TO_TXT_TYPES } from '@/constant/common'

export function formatPriceInFen(fen, decimal = 2) {
  decimal = Number.isInteger(decimal) ? decimal : 2
  const yuan = Number(fen) / 100
  return Number(yuan).toFixed(decimal)
}

export function toSimpleDate(str) {
  // '2024-03-21T21:59:12' => '2024-03-21'
  const temp = String(str).split('T')
  return temp[0]
}
export function toSimpleDateTime(str) {
  // '2024-03-21T21:59:12' => '2024-03-21 21:59'
  const temp = String(str).replace('T', ' ').split(':')
  temp.pop()
  return temp.join(':')
}

export function trimDecimal(number, decimal = 0, defaultText = '--') {
  if (typeof number !== 'number') {
    return defaultText
  }
  number = Number(number)
  return number.toFixed(decimal)
}

export const FILE_TYPE_NAMES = {
  editor: '在线文档',
  webpage: '网页',
  pdf: 'pdf',
  docx: 'word',
  text: 'txt',
  txt: 'txt',
  ppt: 'ppt',
  pptx: 'pptx',
  xls: 'excel',
  xlsx: 'excel',
  url: 'url',
  ...UPLOAD_FILE_FORCED_CONVERSION_TO_TXT_TYPES.reduce((pre, cur) => {
    pre[cur.replace('.', '')] = 'txt'
    return pre
  }, {})
}

export function getFileTypeName(type) {
  return FILE_TYPE_NAMES[type] || type || '-'
}

export function getFileName(fileName: string) {
  const fileExtension = fileName.match(/\.([^.]+)$/)?.[1] // 使用正则表达式从文件名末尾提取文件后缀

  if (fileExtension && UPLOAD_FILE_FORCED_CONVERSION_TO_TXT_TYPES.includes(`.${fileExtension}`)) {
    const fileHeadName = fileName.replace(/\.[^.]+$/, '') // 使用正则表达式去除文件名末尾的后缀
    return `${fileHeadName} [${fileExtension}转txt]`
  }

  return fileName
}

export const FILE_STATUS_NAMES = {
  all: '全部状态',
  pending: '待处理',
  parsing: '正在解析',
  learning: '学习中',
  learned: '学习完成',
  error: '学习失败',
  crawl_error: '爬取失败'
}
export function getFileStatusName(status) {
  return FILE_STATUS_NAMES[status] || status || '-'
}
