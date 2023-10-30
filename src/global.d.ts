import type sensors from 'sa-sdk-javascript'
import SvgIcon from '@/components/SvgIcon/index.vue'

declare module 'vue' {
  export interface ComponentCustomProperties {
    $sensors?: typeof sensors
    $copyText: (e: string) => void
  }
  export interface GlobalComponents {
    SvgIcon: typeof SvgIcon
  }
}

declare global {
  interface Window {
    showPreview(url: string): void
    ChatoBotConfig: {
      wwwBaseURL: string
      baseURL: string
      token: string
      id: number
    }
  }
}
