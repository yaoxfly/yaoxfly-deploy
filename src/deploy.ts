#!/usr/bin/env ts-node
import path from 'path'
import fs from 'fs'
import { Client } from 'ssh2'
import child_process from 'child_process' // 引入子进程
import compressing from 'compressing'
import ora from 'ora' //这个ora包不能下最新的会报错
import chalk from 'chalk' //这个chalk包不能下最新的会报错
const configPath = path.resolve(process.cwd(), './deploy.js')
interface Config {
  connect: {
    host: string
    port: string
    username: string
    password: string
  }
  upload: {
    name: string,
    path: string,
    remotePath: string
  }
  build: {
    command: string
  }
}

let config: Config = {
  connect: {
    host: "",
    port: "",
    username: "",
    password: ""
  },
  upload: {
    name: "",
    path: "",
    remotePath: ""
  },

  build: {
    command: ""
  }
};


//输出函数
const log = (text, type = 'success',) => {
  const keyMap = {
    'success': chalk.green(text),
    'error': chalk.red(text)
  }
  console.log('\n', keyMap[type])
}


const isFileExisted = (path) => {
  return new Promise((resolve, reject) => {
    fs.access(path, (err) => {
      if (err) {
        reject(false);
      } else {
        resolve(true);
      }
    })
  })
}


// 部署函数
async function deploy() {
  const exists = await isFileExisted(configPath)
  if (!exists) {
    throw new Error('deploy.js文件不可为空')
  }
  config = require(configPath)

  // 第一步，构建项目
  config.build?.command && await new Promise((resolve, reject) => {
    const spinner = ora('正在打包').start();
    child_process.exec(`${config.build.command}`, {
      maxBuffer: 999999999 // 标准输出或标准错误允许的最大数据量（单位字节）。 超出则子进程将终止并截断任何输出。
    }, function (err, stdout, stderr) {
      // 子进程执行结束后的回调
      if (err) {
        reject(err)
      } else {
        spinner.stop();
        resolve('打包成功')
      }
    })
  })


  // 第二步，压缩目录
  await new Promise((resolve, reject) => {
    const dir = path.resolve(process.cwd(), config.upload.path) // 待压缩文件和目录
    const dest = path.resolve(process.cwd(), `${config.upload.name}.zip`) // 压缩后存放目录和文件名称
    const spinner = ora('正在压缩').start();
    compressing.zip.compressDir(dir, dest).then(async (rs) => {
      await spinner.stop();
      //用异步不然还会出现正在压缩
      await log('压缩成功')
      resolve('压缩成功')
    }, err => {
      reject(err)
    })
  })


  // 第三步，上传linux服务器
  const connect = new Client()

  // 连接linux服务器
  // 异步进行，先注册连接状态的监听事件
  setTimeout(() => {
    connect.connect({
      host: config.connect.host, // 主机ip
      port: config.connect.port, // SSH 连接端口
      username: config.connect.username, // 用户名
      password: config.connect.password // 用户登录密码
    })
  })

  // 连接成功
  connect.on('ready', async () => {
    // 上传文件到linux服务器
    // 先连接sftp
    await new Promise((resolve, reject) => {
      connect.sftp((err, sftp) => {
        // sftp连接失败，退出
        if (err) {
          reject(err)
          return
        }

        // sftp连接成功，发起上传
        const file = path.resolve(process.cwd(), `${config.upload.name}.zip`) // 要上传的文件
        const dest = `${config.upload.remotePath}${config.upload.name}.zip` //  linux下存放目录和压缩后的名称。
        sftp.fastPut(file, dest, (err, res) => {
          if (err) {
            log('上传失败', 'error')
            reject(err)
          } else {
            log('上传成功')
            resolve('上传成功')
          }
        })
      })
    })



    // 执行shell脚本
    // 对上传的文件进行解压
    await new Promise((resolve, reject) => {
      // 先进行shell连接
      connect.shell(async (err, stream) => {
        // 连接失败退出
        if (err) {
          reject(err)
          return
        }

        // 到目录下删除旧的包，解压文件后，再删除掉zip包
        stream.write(`cd ${config.upload.remotePath} && rm -r -f ${config.upload.name} \nnext\n`)
        stream.write(`unzip ${config.upload.name}.zip \nnext\n`)  //服务器需要安装unzip
        stream.write(`rm -r -f ${config.upload.name}.zip \nexit\n`)
        stream.on('close', (err) => {
          connect.end()
          if (err) {
            log(err, 'error')
            return
          }
          log('******* SUCCESS!! *******')

          //上传成功后再删除文件
          fs.unlink(`${config.upload.name}.zip`, function (err) {
            if (err) {
              throw err;
            }
            // console.log('文件:' + `${config.upload.name}.zip` + '删除成功！');
          })
        })
        let buf = ''
        stream.on('data', data => {
          buf += data
        })
      })
    })
  })

  // 连接错误
  connect.on('error', (err) => {
    log('*******连接出错*******', 'error')

  })

  // 连接关闭
  connect.on('end', () => {
    log('*******连接关闭*******')
  })

  // 连接异常关闭
  connect.on('close', (err) => {
    if (err) log('*******连接出错*******', 'error')
  })

}

// 执行一键部署
deploy()
