import { currentEnvConfig } from '@/config'
import type { IResponse } from '@/interface/common'
import COS from 'cos-js-sdk-v5'
import { ElNotification } from 'element-plus'
import { v4 as uuidv4 } from 'uuid'

interface ITencentCloudFile {
  bucket: string
  credentials: ICredentials
  expiration: string
  expiredTime: number
  region: string
  requestId: string
  startTime: number
}

interface ICredentials {
  sessionToken: string
  tmpSecretId: string
  tmpSecretKey: string
}

const getUploadResult = (
  cos: COS,
  file: File,
  onProgress?: (progressData: COS.ProgressInfo) => void
): Promise<string> =>
  new Promise((resolve, reject) => {
    cos.uploadFile(
      {
        Bucket: 'afu-1255830993',
        Region: 'ap-shanghai',
        Key: file.name,
        StorageClass: 'STANDARD',
        Body: file,
        onProgress
      },
      function (err, data) {
        if (err) return reject(err)
        resolve('https://' + data.Location)
      }
    )
  })

export const cosServe = async (
  file: Blob,
  url: string = 'avatar/bot',
  needSuffix: boolean = true,
  fileName?: string,
  onProgress?: (progressData: COS.ProgressInfo) => void,
  headers?: HeadersInit
): Promise<string> => {
  const { type } = file
  const date = new Date()
  const name = needSuffix ? uuidv4() : '' + fileName
  const dateTime =
    '' + date.getFullYear() + (date.getMonth() > 10 ? date.getMonth() : '0' + date.getMonth()) + '/'
  const suffix = needSuffix ? dateTime : ''
  const imgName = url + '/' + suffix + name
  const files = new File([file], imgName, { type: type })
  const cos = new COS({
    getAuthorization: async (_, callback) => {
      const { data: res }: IResponse<ITencentCloudFile> = await fetch(
        currentEnvConfig.baseURL + '/chato/api/file/upload/tencent_cloud_file?path=' + imgName,
        {
          headers
        }
      )
        .then((steram) => steram.json())
        .catch((err) => ElNotification.error(err.toString))
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
