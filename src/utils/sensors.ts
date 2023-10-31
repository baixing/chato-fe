import { useBasicLayout } from '@/composables/useBasicLayout'
import useChannel from '@/composables/useChannel'
import useLocationDvid from '@/composables/useLocationDvid'
import { PageViewPathTracker } from '@/constant/tracker'
import { useBase } from '@/stores/base'
import { storeToRefs } from 'pinia'
import sa from 'sa-sdk-javascript'
import rgp from 'sa-sdk-javascript/dist/web/plugin/register-properties/index.es6'

export default class Sensors {
  public saInstance: typeof sa
  public pageViewPathKeys: string[] = []

  constructor() {
    if (!this.pageViewPathKeys.length) {
      this.pageViewPathKeys = Object.keys(PageViewPathTracker)
    }

    if (!this.saInstance && import.meta.env.VITE_APP_SENSORS_URL) {
      this.initSa()
    }
  }

  private initSa() {
    const registerPlugin = sa.use(rgp, {})
    registerPlugin.hookRegister((eventInfo) => {
      const { event, properties } = eventInfo
      const customProperties = {}
      let matchRegStr
      if (event === '$pageview') {
        matchRegStr = this.pageViewPathKeys.find((item) =>
          new RegExp(`^${item}$`, '').test(properties.$url_path)
        )
      }

      if (properties.$element_id) {
        customProperties['event_type'] = properties.$element_id
      } else if (matchRegStr) {
        customProperties['event_type'] = PageViewPathTracker[matchRegStr]
        const matchRes = properties.$url_path.match(new RegExp(matchRegStr, ''))
        if (matchRes[1]) {
          customProperties['bot_id'] = matchRes[1]
        }
      }

      return customProperties
    })

    sa.init({
      server_url: import.meta.env.VITE_APP_SENSORS_URL,
      is_track_single_page: true,
      use_client_time: true,
      send_type: 'beacon',
      show_log: false, // 不调试时，关闭
      heatmap: {
        clickmap: 'default',
        scroll_notice_map: 'not_collect',
        collect_tags: {
          button: true,
          a: true
        },
        loadTimeout: 3000,
        collect_element: (target: HTMLElement) => {
          if (
            target.nodeName === 'BUTTON' ||
            target.nodeName === 'A' ||
            target.hasAttribute('data-sensors-click')
          ) {
            return true
          } else {
            return false
          }
        },
        custom_property: (target: HTMLElement) => {
          const baseStoreI = useBase()
          const { abTestConfig } = storeToRefs(baseStoreI)
          const res = { abtest: abTestConfig.value }
          Array.from(target.attributes).map((item) => {
            const matchAttr = item.name
              .match(/^data-sensors-(?!click\b)(.+)/)?.[1]
              ?.replace(/-/g, '_')
            if (matchAttr) {
              res[matchAttr] = target.getAttribute(item.name)
            }
          })

          return res
        }
      }
    })

    const { dvid } = useLocationDvid()
    const { isMobile } = useBasicLayout()
    const { shareChannel } = useChannel()

    sa.registerPage({
      dvid,
      tag: isMobile.value ? 'Wap' : 'PC',
      source: shareChannel.value
    })

    this.saInstance = sa
  }
}
