import SvgIcon from '@/components/SvgIcon/index.vue'
import type sensors from 'sa-sdk-javascript'

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
  interface Array<T> {
    findLastIndex(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any): number
  }
}
