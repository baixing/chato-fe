import type { UploadUserFile } from 'element-plus'

export type ObjType = { [k in PropertyKey]: unknown }

// 用于对象类型合并
export type ExtendedObjectType<obj1 extends ObjType, obj2 extends ObjType> = {
  [k in never as keyof obj1 | keyof obj2]: k extends keyof obj1 & keyof obj2
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
