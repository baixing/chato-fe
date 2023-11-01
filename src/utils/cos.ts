import { currentEnvConfig } from '@/config'
import COS from 'cos-js-sdk-v5'
import { v4 as uuidv4 } from 'uuid'

interface ITencentCloudFile {
  bucket: string
  credentials: Credentials
  expiration: string
  expiredTime: number
  region: string
  requestId: string
  startTime: number
}

interface Credentials {
  sessionToken: string
  tmpSecretId: string
  tmpSecretKey: string
}

const getUploadResult = (
  cos: COS,
  file: File,
  onProgress?: (progressData: COS.ProgressInfo) => void
): Promise<string> =>
  new Promise((resolve) => {
    cos.uploadFile(
      {
        Bucket: 'afu-1255830993',
        Region: 'ap-shanghai',
        Key: file.name,
        StorageClass: 'STANDARD',
        Body: file,
        onProgress
      },
      function (_, data) {
        resolve('https://' + data.Location)
      }
    )
  })

export const cosServe = async (
  file: Blob,
  url: string = 'avatar/bot',
  onProgress?: (progressData: COS.ProgressInfo) => void,
  headers?: HeadersInit
): Promise<string> => {
  const { type } = file
  const date = new Date()
  const name = uuidv4()
  const dateTime =
    '' + date.getFullYear() + (date.getMonth() > 10 ? date.getMonth() : '0' + date.getMonth()) + '/'
  const imgName = url + '/' + dateTime + name + '.png'
  const files = new File([file], imgName, { type: type })
  const cos = new COS({
    getAuthorization: async (_, callback) => {
      const res: ITencentCloudFile = await fetch(
        currentEnvConfig.baseURL + '/chato/api/file/upload/tencent_cloud_file?path=' + imgName,
        {
          headers
        }
      ).then((steram) => steram.json())
      callback({
        TmpSecretId: res.credentials.tmpSecretId,
        TmpSecretKey: res.credentials.tmpSecretKey,
        XCosSecurityToken: res.credentials.sessionToken,
        StartTime: res.startTime,
        ExpiredTime: res.expiredTime
      })
    }
  })
  return await getUploadResult(cos, files, onProgress)
}
