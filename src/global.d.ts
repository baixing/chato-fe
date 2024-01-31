import { deleteCommonGraph, getCommonGraph, postCommonGraph } from '@/api/graph'
import { ExtendedObjectType } from '@/interface/utilsType'
import { globalComponents } from '@/utils/globalComponents'
import type sensors from 'sa-sdk-javascript'

type TGlobalComponents<
  T extends typeof globalComponents = typeof globalComponents,
  num extends number[] = [],
  globalObj extends Partial<Record<keyof T[number]['key'], keyof T[number]['component']>> = {}
> = num['length'] extends T['length']
  ? globalObj
  : TGlobalComponents<
      T,
      [...num, 0],
      ExtendedObjectType<
        globalObj,
        Record<
          T[num['length']]['key'],
          Awaited<ReturnType<T[num['length']]['component']>>['default']
        >
      >
    >

declare module 'vue' {
  export interface ComponentCustomProperties {
    $sensors?: typeof sensors
    $copyText: (e: string, successMessage?: string) => void
    postCommonGraph: typeof postCommonGraph
    deleteCommonGraph: typeof deleteCommonGraph
    getCommonGraph: typeof getCommonGraph
  }
  export interface GlobalComponents extends TGlobalComponents {}
}

declare global {
  interface Window {
    previewImages(imgStr: string, imgIndex?: number): void
    ChatoBotConfig: {
      wwwBaseURL: string
      baseURL: string
      token: string
      id: number
    }
    WeixinJSBridge?: {
      invoke(action: string, data: any, callback: (res: any) => void): void
    }
  }
  interface Array<T> {
    findLastIndex(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any): number
  }
  interface Document {
    attachEvent(event: string, listener: EventListener): boolean
  }
}
