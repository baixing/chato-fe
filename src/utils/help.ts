import { ChatMessageImgLimit, ChatMessageImgLimit_Size_800 } from '@/constant/chat'
import { MANGER_ROLES } from '@/constant/common'
import router from '@/router'
import { useClipboard } from '@vueuse/core'
import { ElNotification } from 'element-plus'
import { validateURL } from './validate'

export const $notnull = (target) => {
  if (target === undefined) return false
  if (target === null) return false
  if (typeof target === 'string' || typeof target === 'boolean') return Boolean(target) // boolean/string
  if (Array.isArray(target)) return Boolean(target.length) // array
  if (Object.prototype.toString.call(target) === '[object Object]') {
    return Boolean(Object.keys(target).length) // objet
  }
  return true
}

// 生成任意长度随机字符串
export const randomString = (len) => {
  len = len || 32
  const $chars =
    'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678' /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
  const maxPos = $chars.length
  let pwd = ''
  for (let i = 0; i < len; i++) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos))
  }
  return pwd
}

export function convertSize(sizeBytes) {
  if (sizeBytes === 0) return '0B'
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(sizeBytes) / Math.log(1024))
  let size = sizeBytes / Math.pow(1024, i)
  size = Math.round(size * 100) / 100
  return size + ' ' + sizes[i]
}

export const openPreviewUrl = (url: string) => {
  if (!url) {
    return
  }

  window.open('https://file.chato-ai.com/onlinePreview?url=' + encodeURIComponent(btoa(url)))
}

export function getMarkDownUrl(text: string) {
  let imageLinks = []
  const regex = /!\[图片\]\((.*?)\)/g
  const matches = text.match(regex)
  // const pattern = /!\[.*?\]\((https?:\/\/.*?)\)/i
  // const imageUrls = text.match(pattern) || []
  // console.log(imageUrls)
  // return imageUrls.length >= 1 ? imageUrls[1] : ''
  if (matches) {
    imageLinks = matches.map((match) => match.replace(/!\[图片\]\(|\)/g, ''))
  }
  return imageLinks
}

export function replaceMarkdownUrl(text: string) {
  return text.replace(/!\[图片\]\([^)]+\)/g, '')
}

export function removeCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=.chato.cn; path=/;`
}

// 复制粘贴
export const copyPaste = (text: any) => {
  if (navigator.clipboard) {
    const { copy, isSupported } = useClipboard({ legacy: true })

    if (!isSupported) {
      ElNotification.warning('当前浏览器不支持复制，请切换或升级浏览器！')
    }
    copy(text)
  } else {
    const input = document.createElement('input')
    input.setAttribute('value', text)
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
  }

  ElNotification.success('复制成功')
}

export const downloadImg = async (fileUrl: string) => {
  const image = new Image()
  // 解决跨域 Canvas 污染问题
  image.setAttribute('crossOrigin', 'anonymous')
  const imgName = fileUrl.match(/\/([^\/]+)\.[^\/.]+$/)?.[1] || randomString(16)
  image.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height
    const context = canvas.getContext('2d')
    context.drawImage(image, 0, 0, image.width, image.height)
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.download = imgName
      a.href = url
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    })
  }
  image.src = fileUrl
}

// 如果图片是地址，走地址的逻辑，base64 图片直接返回
export const generatePreviewImgUrl = (imgUrl: string) => {
  return validateURL(imgUrl) && imgUrl.includes(ChatMessageImgLimit_Size_800)
    ? imgUrl.replace(ChatMessageImgLimit_Size_800, ChatMessageImgLimit)
    : imgUrl
}

export const paramsSerializer = (params) => {
  return Object.keys(params)
    .map((key) => `${key}=${params[key]}`)
    .join('&')
}

export const downloadFile = (data: any) => {
  const blob = new Blob([data as ArrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = '表单收集明细.xlsx' // 设置要保存的文件名
  a.style.display = 'none' // 隐藏下载链接
  document.body.appendChild(a) // 将下载链接添加到页面中
  a.click() // 触发下载
  document.body.removeChild(a) // 下载完成后移除下载链接
  URL.revokeObjectURL(url)
}

export const handleRequestError = (error = null, errorMsg = '') => {
  if (error?.response?.status === 403) {
    router.replace('/error/403')
  } else {
    const msg = errorMsg || error?.response?.data?.detail?.msg || '接口请求错误'
    ElNotification.error(msg)
  }
}

export const isManagerRole = (role: string): boolean => {
  return MANGER_ROLES.includes(role)
}

const allModules = {
  '': import.meta.glob('/src/assets/img/*'),
  home: import.meta.glob('/src/assets/img/home/*'),
  'home/caseImg': import.meta.glob('/src/assets/img/home/caseImg/*'),
  release: import.meta.glob('/src/assets/img/release/*'),
  example: import.meta.glob('/src/assets/img/example/*')
}

export const localeImagePath = async (
  imageName: string,
  lan: string,
  subDir: string = '',
  fileType: string = 'png'
) => {
  const modules = allModules[subDir]
  if (!modules) {
    throw new Error(`No modules found for subDirectory: ${subDir}`)
  }

  const path = `/src/assets/img/${subDir ? subDir + '/' : ''}${imageName}-${lan}.${fileType}`
  const imageModule = await modules[path]?.()

  if (!imageModule) {
    throw new Error(`Image not found: ${path}`)
  }

  return (imageModule as any)?.default
}
