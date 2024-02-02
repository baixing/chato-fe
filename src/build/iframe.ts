window.onload = () => {
  async function chatoIframe() {
    const ChatDotSquare = `
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="22"
        height="22" viewBox="0 0 22 22">
            <g>
              <g>
                <g style="opacity:0;"></g>
                <g>
                  <path
                    d="M18.46991796875,16.83C18.46991796875,16.83,18.85991796875,19.99,18.85991796875,19.99C18.95991796875,20.82,18.069917968749998,21.4,17.35991796875,20.97C17.35991796875,20.97,13.89989796875,18.91,13.89989796875,18.91C13.65989796875,18.77,13.59989796875,18.47,13.72989796875,18.23C14.22989796875,17.310000000000002,14.49989796875,16.27,14.49989796875,15.23C14.49989796875,11.57,11.359897968750001,8.59,7.49989796875,8.59C6.70989796875,8.59,5.9398979687499995,8.71,5.21989396875,8.95C4.84989396875,9.07,4.48989376875,8.73,4.57989376875,8.35C5.48989396875,4.71,8.98989796875,2,13.16989796875,2C18.04991796875,2,21.99991796875,5.6899999999999995,21.99991796875,10.24C21.99991796875,12.94,20.60991796875,15.33,18.46991796875,16.83C18.46991796875,16.83,18.46991796875,16.83,18.46991796875,16.83Z"
                    fill="currentColor" fill-opacity="1" />
                </g>
                <g>
                  <path
                    d="M13,15.22984375C13,16.41984375,12.56,17.51984375,11.82,18.38984375C10.83,19.58984375,9.26,20.35984375,7.5,20.35984375C7.5,20.35984375,4.890000000000001,21.90984375,4.890000000000001,21.90984375C4.45,22.17984375,3.8899999999999997,21.80984375,3.95,21.29984375C3.95,21.29984375,4.2,19.329843750000002,4.2,19.329843750000002C2.86,18.399843750000002,2,16.90984375,2,15.22984375C2,13.469843749999999,2.94,11.91984375,4.38,10.99984375C5.27,10.41984375,6.34,10.08984375,7.5,10.08984375C10.54,10.08984375,13,12.38984375,13,15.22984375C13,15.22984375,13,15.22984375,13,15.22984375Z"
                    fill="currentColor" fill-opacity="1" />
                </g>
              </g>
            </g>
      </svg>
    `

    const createChatoConfig = {
      tipChatoBg: '#4C83F3',
      tipChatoColor: '#fff',
      chatoIframeSrc: '',
      wwwBaseURL: window.ChatoBotConfig.wwwBaseURL || '',
      baseURL: window.ChatoBotConfig.baseURL || '',
      domainSlug: window.ChatoBotConfig.token || '',
      id: window.ChatoBotConfig.id || 0,
      popupFrequency: 0
    }

    async function fetchChatoDetail() {
      // ${createChatoConfig.domainSlug}/${createChatoConfig.id}
      const domainSlug = createChatoConfig.domainSlug
      const wwwBaseURL = createChatoConfig.wwwBaseURL
      const response = await fetch(
        `${createChatoConfig.baseURL}/chato/api/v1/graph/share_channel?filter=id=="${createChatoConfig.id}"`
      )
      const data = await response.json()
      if (data.code === 200036) {
        return Promise.reject(data.message)
      }

      const domainConfig = data.data[0] || {}
      createChatoConfig.tipChatoBg = domainConfig.suspend_style
      createChatoConfig.tipChatoColor = domainConfig.suspend_style_color || '#fff'
      createChatoConfig.chatoIframeSrc = `${wwwBaseURL}/b/${domainSlug}?source=Chato_share_js&source_id=${encodeURIComponent(
        `${window.top.location.href}=title=${window.top.document.title}`
      )}`
      createChatoConfig.popupFrequency = domainConfig.popup_frequency
      return Promise.resolve(domainConfig)
    }

    async function createChato(domainConfig) {
      const tip_chato = document.createElement('div')
      const inframe_container = document.createElement('div')
      const iframe_chato = document.createElement('iframe')
      const body = document.body
      tip_chato.id = 'tip_chato_www'
      tip_chato.setAttribute(
        'style',
        `
      box-sizing: border-box;
      position: fixed;
      right: 44px;
      bottom: 44px;
      z-index: 99999;
      width: 44px;
      height: 44px;
      padding: 10px;
      border-radius: 100%;
      background-color: ${createChatoConfig.tipChatoBg};
      color: ${createChatoConfig.tipChatoColor};
      cursor: grab;
      box-shadow: rgba(0, 0, 0, 0.2) 0px 4px 8px 0px;
    `
      )
      tip_chato.innerHTML = ChatDotSquare

      inframe_container.id = 'inframe_container'
      iframe_chato.id = 'iframe_chato'
      iframe_chato.allow = 'microphone *;camera *'
      iframe_chato.src = createChatoConfig.chatoIframeSrc

      inframe_container.setAttribute(
        'style',
        `
      display: none;
      position: fixed;
      z-index: 999999;
      width: 85vw;
      max-width: 375px;
      height: 70vh;
      max-height: 667px;
      right: 12px;
      bottom: 12px;
      overflow: hidden;
      box-shadow: 0px 8px 32px 0px rgba(0, 0, 0, 0.16);
      border-radius: 16px;
      `
      )
      iframe_chato.setAttribute(
        'style',
        `
      width: 100%;
      height: 100%;
      border: none;
    `
      )

      inframe_container.innerHTML = `<div id="close_chato" style="position: absolute; left: 16px; top: 20px; cursor: pointer;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none">
          <defs>
            <clipPath id="a">
              <rect width="16" height="16" rx="0"/>
            </clipPath>
          </defs>
          <g clip-path="url(#a)">
            <path fill="#303133" d="M13.422 12.463a.689.689 0 0 1-.974.974L8 8.99 3.55 13.437a.687.687 0 0 1-.973 0 .689.689 0 0 1 0-.974l4.448-4.448-4.449-4.449a.689.689 0 0 1 .974-.974L8 7.041l4.448-4.448a.689.689 0 1 1 .974.974L8.974 8.015l4.448 4.448Z"/>
          </g>
        </svg>
      </div>`
      inframe_container.appendChild(iframe_chato)

      if (domainConfig.show_bubble) {
        body.appendChild(tip_chato)
      }
      body.appendChild(inframe_container)

      let isDragging = false
      let offsetX = 0
      let offsetY = 0
      let lastX = 0
      let lastY = 0
      let newX = window.innerWidth - inframe_container.clientWidth - 44
      let newY = window.innerHeight - inframe_container.clientHeight - 44
      let firstShowChato = true // 第一次弹出chato标识

      tip_chato?.addEventListener('mousedown', startDrag)
      document.addEventListener('mousemove', drag)
      document.addEventListener('mouseup', endDrag)

      function startDrag(e: MouseEvent) {
        isDragging = true
        offsetX = e.clientX - tip_chato.getBoundingClientRect().left
        offsetY = e.clientY - tip_chato.getBoundingClientRect().top
        lastX = e.clientX
        lastY = e.clientY
      }

      function drag(e: MouseEvent) {
        if (isDragging) {
          const x = e.clientX - offsetX
          const y = e.clientY - offsetY
          const maxX = window.innerWidth - tip_chato.offsetWidth
          const maxY = window.innerHeight - tip_chato.offsetHeight
          const clampedX = Math.max(0, Math.min(x, maxX))
          const clampedY = Math.max(0, Math.min(y, maxY))
          const deltaX = e.clientX - lastX
          const deltaY = e.clientY - lastY
          lastX = e.clientX
          lastY = e.clientY
          smoothMove(clampedX, clampedY, deltaX, deltaY)
        }
      }

      function endDrag() {
        isDragging = false
      }

      function smoothMove(x: number, y: number, deltaX: number, deltaY: number) {
        newX = x + deltaX
        newY = y + deltaY
        tip_chato.style.left = `${newX}px`
        tip_chato.style.top = `${newY}px`
      }

      function updateContainerPosition() {
        const containerEl = document.getElementById('inframe_container')
        if (containerEl) {
          // 在每次需要更新位置时获取元素尺寸
          const maxWidth = window.innerWidth - containerEl.clientWidth - 44
          const maxHeight = window.innerHeight - containerEl.clientHeight - 44
          inframe_container.style.left = `${Math.min(newX, maxWidth)}px`
          inframe_container.style.top = `${Math.min(newY, maxHeight)}px`
        }
      }

      window.addEventListener('DOMContentLoaded', updateContainerPosition)

      function visibleChato(tipV = 'none', inframeV = 'block') {
        tip_chato && (tip_chato.style.display = tipV)
        inframe_container.style.display = inframeV
        firstShowChato = false
        if (inframeV === 'block') {
          updateContainerPosition()
        }
      }

      let intervaler = null

      function popupFrequencyChato(rate: number) {
        if (rate > 0) {
          if (intervaler) {
            clearInterval(intervaler)
          }
          intervaler = setInterval(function () {
            if (firstShowChato) {
              visibleChato('none', 'block')
              clearInterval(intervaler)
            }
          }, rate * 1000)
        }
      }

      tip_chato?.addEventListener('click', function () {
        visibleChato()
      })

      document.getElementById('close_chato')?.addEventListener('click', function () {
        inframe_container.style.display = 'none'
        tip_chato && (tip_chato.style.display = 'block')
        popupFrequencyChato(createChatoConfig.popupFrequency)
      })

      const xiaonaEl = document.getElementById('Chato_mobile_xiaona_chat_click')
      if (xiaonaEl) {
        xiaonaEl.style.display = 'none'
      }

      popupFrequencyChato(createChatoConfig.popupFrequency)
    }

    try {
      const domainConfig = await fetchChatoDetail()
      await createChato(domainConfig)
    } catch (error) {
      console.error(error)
    }
  }

  chatoIframe()
}

export { }

