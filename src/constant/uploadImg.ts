import type { InjectionKey } from 'vue'

export const imgBlob = Symbol() as InjectionKey<() => Blob>
