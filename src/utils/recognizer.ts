import Recorder from 'recorder-core'
import 'recorder-core/src/engine/pcm'

export default class Recognizer {
  public rec = null
  public SampleRate = 16000
  public testBitRate = 16
  public isCloseRecorder = false
  public SendInterval = 300
  public realTimeSendTryType = 'pcm'
  public realTimeSendTryEncBusy = 0
  public realTimeSendTryTime = 0
  public realTimeSendTryNumber = 0
  public transferUploadNumberMax = 0
  public realTimeSendTryChunk = null
  public soundType = 'pcm'
  public recwaveElm = ''
  public recorderRefusedAuthorized = ''

  public TransferUpload(number, blob, duration, recMock, isClose) {}
  public TransferProcess(number, blobOrNull, duration, blobRec, isClose) {}

  initRecorder() {
    const rec = Recorder({
      type: this.soundType,
      bitRate: this.testBitRate,
      sampleRate: this.SampleRate,
      onProcess: (buffers, level, time, sampleRate) => {
        // this.RealTimeSendTry(rec, false) //推入实时处理，因为是unknown格式，这里简化函数调用，没有用到buffers和bufferSampleRate，因为这些数据和rec.buffers是完全相同的。
      }
    })

    rec.open(
      () => {
        rec.start()
        this.recorderRefusedAuthorized = ''
        this.isCloseRecorder = false
        this.RealTimeSendTryReset(this.soundType) //重置
      },
      (msg, isUserNotAllow) => {
        // 用户拒绝了录音权限，或者浏览器不支持录音
        this.recorderRefusedAuthorized = (isUserNotAllow && 'UserNotAllow ') + '无法录音：' + msg
      }
    )
    this.rec = rec
  }

  constructor(config) {
    this.soundType = config.soundType || 'pcm'
    this.SampleRate = config.sampleRate || 16000
    this.recwaveElm = config.recwaveElm || ''
    this.TransferUpload = config.translerCallBack || this.TransferProcess
    this.initRecorder()
  }

  RealTimeSendTryReset(type) {
    this.realTimeSendTryType = type
    this.realTimeSendTryTime = 0
  }

  RealTimeSendTry(rec, isClose) {
    const t1 = Date.now()
    // const endT = 0
    // const recImpl = Recorder.prototype
    if (this.realTimeSendTryTime == 0) {
      this.realTimeSendTryTime = t1
      this.realTimeSendTryEncBusy = 0
      this.realTimeSendTryNumber = 0
      this.transferUploadNumberMax = 0
      this.realTimeSendTryChunk = null
    }
    if (!isClose && t1 - this.realTimeSendTryTime < this.SendInterval) {
      return //控制缓冲达到指定间隔才进行传输
    }
    this.realTimeSendTryTime = t1
    const number = ++this.realTimeSendTryNumber

    //借用SampleData函数进行数据的连续处理，采样率转换是顺带的
    const chunk = Recorder.SampleData(
      rec.buffers,
      rec.srcSampleRate,
      this.SampleRate,
      this.realTimeSendTryChunk,
      { frameType: isClose ? '' : this.realTimeSendTryType }
    )

    //清理已处理完的缓冲数据，释放内存以支持长时间录音，最后完成录音时不能调用stop，因为数据已经被清掉了
    for (
      let i = this.realTimeSendTryChunk ? this.realTimeSendTryChunk.index : 0;
      i < chunk.index;
      i++
    ) {
      rec.buffers[i] = null
    }
    this.realTimeSendTryChunk = chunk

    //没有新数据，或结束时的数据量太小，不能进行mock转码
    if (chunk.data.length == 0 || (isClose && chunk.data.length < 2000)) {
      this.TransferUpload(number, null, 0, null, isClose)
      return
    }
    //实时编码队列阻塞处理
    if (!isClose) {
      if (this.realTimeSendTryEncBusy >= 2) {
        console.log('编码队列阻塞，已丢弃一帧', 1)
        return
      }
    }
    this.realTimeSendTryEncBusy++

    //通过mock方法实时转码成mp3、wav
    const encStartTime = Date.now()
    const recMock = Recorder({
      type: this.realTimeSendTryType,
      sampleRate: this.SampleRate, //采样率
      bitRate: this.testBitRate //比特率
    })
    recMock.mock(chunk.data, chunk.sampleRate)
    recMock.stop(
      (blob, duration) => {
        this.realTimeSendTryEncBusy && this.realTimeSendTryEncBusy--
        blob.encTime = Date.now() - encStartTime

        //转码好就推入传输
        this.TransferUpload(number, blob, duration, recMock, isClose)
      },
      (msg) => {
        this.realTimeSendTryEncBusy && this.realTimeSendTryEncBusy--
        //转码错误？没想到什么时候会产生错误！
        console.log('不应该出现的错误:' + msg, 1)
      }
    )
  }

  recordClose(blob: Blob) {
    try {
      this.rec.close(() => {
        this.isCloseRecorder = true
      })
      // latestSend && this.RealTimeSendTry(this.rec, true) //最后一次发送
      this.TransferUpload(0, blob, 0, null, true)
    } catch (ex) {
      // this.recordClose()
    }
  }

  recordEnd() {
    try {
      this.rec.stop(
        (blob, duration) => {
          this.recordClose(blob)
        },
        (s) => {
          this.recordClose(s)
          // this.recordClose(blob)
        }
      )
    } catch (ex) {}
  }
  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        resolve((reader.result as string).split(',')[1]) // 只提取base64数据部分
      }
      reader.onerror = () => {
        reject(new Error('Failed to convert Blob to Base64'))
      }
      reader.readAsDataURL(blob)
    })
  }
}
