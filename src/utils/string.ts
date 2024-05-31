export const RE_ZH = /[\u4E00-\u9FA5]/g

// 计算字符串的视觉宽度（一个汉字换算为 2 个西文字符）
export function getStringWidth(str) {
  if (!str) {
    return 0
  }
  str = String(str).trim()
  str = str.replace(RE_ZH, 'XX')
  return str.length
}

export function getStringoriginWidth(str) {
  if (!str) {
    return 0
  }
  str = String(str).trim()
  return str.length
}

// 把字符串缩短，把中间挤压掉的字符用 ... 替换
export function shortenString(str, desiredWidth) {
  str = String(str)
  const width = getStringWidth(str)
  if (width <= desiredWidth) return str
  if (desiredWidth <= 4) return str[0] + '...'

  const head = []
  let headWidth = 0
  const tail = []
  let tailWidth = 0
  let result = joinHeadAndTail()

  do {
    // console.log('loop')
    // 如果头部并不比尾部长，则尝试头部
    if (headWidth <= tailWidth) {
      console.log('head 1')
      addHead()
      if (isOutOfLimit()) break
      else result = joinHeadAndTail()
      if (isOnLimit()) break

      // 如果头部仍然并不比尾部长，则继续尝试头部（进入下一个循环）
      if (headWidth <= tailWidth) {
        // console.log('head 1+')
        break
      }
    }

    // 如果头部比尾部长，则尝试分配尾部
    else {
      // console.log('tail 1')
      addTail()
      if (isOutOfLimit()) break
      else result = joinHeadAndTail()
      if (isOnLimit()) break
    }

    // eslint-disable-next-line no-constant-condition
  } while (true)

  // util
  function addHead() {
    const char = str[0]
    str = str.slice(1)
    // console.log(`addHead: '${head.join('')}' <- '${char}'`)
    head.push(char)
    headWidth += getStringWidth(char)
  }

  function addTail() {
    const char = str.at(-1)
    str = str.slice(0, -1)
    // console.log(`addTail: '${char}' -> '${tail.join('')}'`)
    tail.unshift(char)
    tailWidth += getStringWidth(char)
  }

  function joinHeadAndTail() {
    return `${head.join('')}...${tail.join('')}`
  }

  function isOnLimit() {
    return headWidth + 3 + tailWidth === desiredWidth
  }

  function isOutOfLimit() {
    return headWidth + 3 + tailWidth > desiredWidth
  }

  // output
  return result
}

export function encodeParam(param) {
  return btoa(param)
}

export function decodeParam(encodedParam) {
  return atob(encodedParam)
}
