/**
 * Request
 */
export interface IUploadOptions {
  autoCrop: boolean
  autoCropHeight: number
  autoCropWidth: number
  canMove: boolean
  canMoveBox: boolean
  centerBox: boolean
  enlarge: number
  fillCover: string
  fixed: boolean
  fixedBox: boolean
  fixedNumber: number[]
  full: boolean
  high: boolean
  img: string
  limitMinSize: number[]
  maxImgSize: number
  mode: string
  original: boolean
  outputType: string
  size: number
}
