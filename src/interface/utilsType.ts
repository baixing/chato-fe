import type { UploadUserFile } from 'element-plus'

type _BaseObjType = { [k in PropertyKey]: unknown }

// 用于对象类型合并
export type ExtendedObjectType<obj1 extends _BaseObjType, obj2 extends _BaseObjType> = {
  [k in keyof obj1 | keyof obj2]?: k extends Extract<keyof obj1, keyof obj2>
    ? obj1[k] | obj2[k]
    : k extends keyof obj1
    ? obj1[k]
    : obj2[k]
}

export interface UploadResDataType {
  data: {
    url?: string
  }
}

export type UploadResType = UploadUserFile & { response: UploadResDataType }
