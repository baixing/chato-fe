import hljs from 'highlight.js/lib/common'
import MarkdownIt from 'markdown-it'
import markdownItAttrs from 'markdown-it-attrs'
// import mili from 'markdown-it-linkify-images'
import Prism from 'prismjs'

const md = MarkdownIt({
  html: true,
  breaks: true,
  highlight: function (str: string, lang: string) {
    const langHtml = lang ? `<span>${lang}</span>` : ''
    const copyButtonHtml = `<div ref="copyBtns" class="copy-btn-code">Copy <span class="text">${str}</span> </div>`
    let renderCode = ''

    try {
      if (lang && Prism.languages[lang]) {
        renderCode = Prism.highlight(str, Prism.languages[lang], lang)
      } else if (lang && hljs.getLanguage(lang)) {
        renderCode = hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
      } else {
        renderCode = Prism.highlight(str, Prism.languages['javascript'], 'javascript')
      }
    } catch (error) {
      console.log(`Code highlight error: ${error}`)
      renderCode = Prism.highlight(str, Prism.languages['javascript'], 'javascript')
    }

    return `<div class="top-set-bg flex justify-between px-4 py-2">${langHtml}${copyButtonHtml}</div> <pre class="language-${lang}"><code>${renderCode}</code></pre>`
  }
})

const defaultRender =
  md.renderer.rules.link_open ||
  function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options)
  }

md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  // If you are sure other plugins can't add `target` - drop check below
  const aIndex = tokens[idx].attrIndex('target')

  if (aIndex < 0) {
    tokens[idx].attrPush(['target', '_blank']) // add new attribute
  } else {
    tokens[idx].attrs[aIndex][1] = '_blank' // replace value of existing attr
  }

  const bIndex = tokens[idx].attrIndex('href')
  const url = tokens[idx].attrs[bIndex][1]

  if (bIndex >= 0) {
    tokens[idx].attrs[bIndex][1] = '/link?target=' + url // replace value of existing attr
    if (/^https:\/\/.+\/endPlatform\/adCollectForm\//.test(url)) {
      const matches = url.match(
        /^https:\/\/.+\/endPlatform\/adCollectForm\/([^\/]+)(?:\/([^\/]+))?/
      )
      tokens[idx].attrs.push(['id', 'Chato-customer-collect-form'])
      tokens[idx].attrs.push(['data-form-id', matches[1]])
      tokens[idx].attrs.push(['data-uid', matches[2] || ''])
      tokens[idx].attrs.push(['onclick', 'return false;'])
    }
  }
  // pass token to default renderer.
  return defaultRender(tokens, idx, options, env, self)
}

md.use(markdownItAttrs)
// md.use(mili, {
//   target: '_blank',
//   linkClass: 'custome-link-class',
//   imgClass: 'custome-img-class'
// })

md.renderer.rules.image = function (tokens, idx, options, env, self) {
  const token = tokens[idx]
  const altText = token.content // 获取图片的alt文本
  const imageUrl = token.attrs[token.attrIndex('src')][1] // 获取图片的src属性值
  const imageList = []
  tokens.forEach((item) => {
    const itemUrl = item.attrs?.[0]?.[1]
    itemUrl && imageList.push(itemUrl)
  })
  const previewIndex = idx >= imageList.length ? 0 : idx
  const imageListStr = imageList.length ? imageList.join(',') : ''

  return `<img src="${imageUrl}" alt="${altText}" onclick="previewImages('${imageListStr}', '${previewIndex}')">`
}

export const detectMarkdown = (text) => {
  // if (text.length < 50) return false
  // if (!text.includes('\n\n')) return false
  const reHeading = /^\s*#+\s*.+$/gm
  const reCodeBlockFence = /^\s*`{3,}\w*\s*$/gm
  const reImage = /<\s*img\s+.+>/
  const reBr = /<\s*br\s*\/?\s*>/g
  const regMd = /([*_~`]|#{1,6}|[|:-])+/

  if (_matchCount(text, reHeading) > 1) {
    return true
  } else if (_matchCount(text, reCodeBlockFence) > 1) {
    return true
  } else if (_matchCount(text, reBr) > 1) {
    return true
  } else if (reImage.test(text)) {
    return true
  } else if (regMd.test(text)) {
    return true
  }
  return false
}

function _matchCount(str, regex) {
  const matches = str.match(regex) || []
  return matches.length
}

export const renderMarkdown = (markdown) => {
  return md.render(markdown)
}
