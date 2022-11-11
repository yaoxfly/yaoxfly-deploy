import { Client } from 'ssh2'
import { config,compressName as compress } from './config'
import { resolve,successLog,errorLog } from './utils'
import ora from 'ora' //这个ora包不能下最新的会报错
import fs from 'fs'
export const connect= async (compressName=compress)=>{
  const { backup,upload,connect:connects } = config || {}
  const connect = new Client()
  const spinnerHost = ora('正在连接服务器...')
  const connectHost = () => {
    spinnerHost.start()
    connect.connect({
      host: connects.host, // 主机ip
      port: connects.port, // SSH 连接端口
      username: connects.username, // 用户名
      password: connects.password // 用户登录密码
    })
  }
  
  await connectHost()
  connect.on('ready', async () => {
    spinnerHost.stop()
    successLog('连接服务器成功')
    const spinner = ora('正在上传').start();
    await new Promise((resolves, reject) => {
      connect.sftp((err, sftp) => {
        if (err) {
          spinner.stop();
          reject(err)
          return
        }
        const file = resolve(process.cwd(), `${backup?.open ? backup.outputDir + '/' : ""}${compressName}`)// 要上传的文件
        const dest = `${upload.remotePath}${compressName}` //  linux下存放目录和压缩后的名称。
        sftp.fastPut(file, dest, (err, res) => {
          if (err) {
            spinner.stop();
            errorLog('上传失败')
            reject(err)
          } else {
            spinner.stop();
            successLog('上传成功')
            resolves('上传成功')
          }
        })
      })
    })
  
    await new Promise((resolve, reject) => {
      connect.shell(async (err, stream) => {
        if (err) {
          reject(err)
          return
        }
        // 到目录下删除旧的包，解压文件后，再删除掉zip包
        stream.write(`cd ${upload.remotePath} && rm -r -f ${upload.name} \nnext\n`)
        stream.write(`unzip ${compressName} \nnext\n`)
        stream.write(`rm -r -f ${compressName} \nexit\n`)
        stream.on('close', (err) => {
          connect.end()
          if (err) {
            errorLog(err)
            return
          }
          successLog('******* SUCCESS!! *******', { icon: false })
          //上传成功后再删除本地文件
          !backup?.open && fs.unlink(`${compressName}`, function (err) {
            if (err) {
              throw err;
            }
          })
        })
        let buf = ''
        stream.on('data', data => {
          buf += data
        })
      })
    })
  })
  
  connect.on('error',async (err) => {
   await spinnerHost.stop()
   await errorLog('*******连接出错*******',{ icon: false })
  })
  
  connect.on('end', () => {
    successLog('*******连接关闭*******', { icon: false })
  })
  
  connect.on('close',async (err) => {
    if (err){
     await spinnerHost.stop()
     await errorLog('*******连接出错*******',{ icon: false })
    } 
  })
}