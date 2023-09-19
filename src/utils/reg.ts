export function regReplaceA(str: string, properties?: Record<string, string | number>) {
  const regex = /#\s*([^#\s]+)\s*#/g
  return str.replace(regex, (match, content) => {
    if (content.trim() === '') {
      // 如果# #中间只有空格，则直接返回空字符串，不进行替换
      return ''
    } else {
      let aAttributes = ''
      if (properties) {
        for (const key in properties) {
          aAttributes += `${key}="${properties[key]}" `
        }
      }
      // 否则进行替换
      return `<a href="javascript:;" style="color: #7C5CFC;" data-chref="${content}" data-sensors-label-question="${content}" ${aAttributes}>${content}</a>`
    }
  })
}

export function removewRegReplaceA(str: string) {
  return str.replace(/<a\b[^>]*>(.*?)继续<\/a>/g, '')
}

export function isImageUrl(url: string) {
  const pattern =
    /^(https?:\/\/.*\.(jpg|png|jpeg|gif|webp))|(data:image\/(jpeg|png|gif|webp);base64,)/i
  return pattern.test(url)
}

export function convertToMarkdown(text: string, imageUrl: string[]) {
  let markdown = ''
  // 转换字符串为Markdown格式
  markdown += text + '\n\n'
  // 转换图片链接为Markdown格式
  imageUrl.forEach((item) => {
    markdown += `![图片](${item})`
  })

  return markdown
}

export function verifyImageReg(name: string) {
  return /\.(jpg|jpeg|png)$/i.test(name)
}
