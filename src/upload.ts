import fs from 'fs'
import compressing from 'compressing'
import ora from 'ora' //这个ora包不能下最新的会报错
import { connect } from './connect'
import path from 'path'
import { shellExec, resolve, successLog } from './utils'
export const upload = async (option, useConfig) => {
  const { config, compressName } = await useConfig(option)
  const { upload, build, backup } = config || {}
  build?.command && await shellExec({
    directive: `${build.command}`,
    cwd: '',
    loading: '正在打包...',
    log: `${build.command}`,
    succeed: '打包成功'
  })

  const compressDir = async () => {
    try {
      fs.accessSync(backup.outputDir, fs.constants.F_OK);
    } catch (err) {
      backup?.open && await shellExec({
        directive: `mkdir ${backup.outputDir}`,
        cwd: process.cwd(),
      })
    }

    if (backup?.open && backup?.quantity) {
      const backupDir = resolve(process.cwd(), backup.outputDir)
      const file = []
      try {
        const files = fs.readdirSync(backupDir);
        files.forEach(item => {
          file.push(item)
        });
      } catch (err) {
        throw new Error('The backup folder does not exist!')
      }

      if (file.length >= backup.quantity) {
        const len = file.length - backup.quantity
        file.some((item, index) => {
          if (index === len + 1) {
            return true
          } else {
            fs.unlinkSync(`${backupDir}/${item}`)
          }
        })
      }
    }

    const dir = resolve(process.cwd(), upload.path)
    const compressType = config.compress?.type || 'zip'
    const fileExt = compressType === 'tgz' ? 'tar.gz' : compressType
    const dest = resolve(process.cwd(), `${backup?.open ? backup.outputDir + '/' : ""}${compressName.replace('.zip', `.${fileExt}`)}`)
    const spinner = ora('正在压缩').start();
    let rs
    switch (compressType) {
      case 'tar':
      case 'tgz': {
        // tar 或 tgz 使用系统命令压缩，保留外层文件夹
        const gzipFlag = compressType === 'tgz' ? 'z' : '' // tgz 需要 gzip 压缩
        // Git Bash / WSL 下路径转换：D:\... -> /d/...
        const toGitBashPath = (p: string) => {
          const driveLetter = p[0].toLowerCase()
          return '/' + driveLetter + p.slice(2).replace(/\\/g, '/')
        }

        // dir 是要压缩的完整路径
        const parentDir = path.dirname(dir)       // 父目录
        const baseName = path.basename(dir)       // 文件夹名

        const posixDest = toGitBashPath(dest)
        const posixParent = toGitBashPath(parentDir)
        const cmd = `tar -c${gzipFlag}f "${posixDest}" -C "${posixParent}" "${baseName}"`
        rs = await shellExec({ directive: cmd, cwd: process.cwd() })
        break
      }
      default:
        // zip 仍然使用 compressing
        rs = await compressing.zip.compressDir(dir, dest)
    }

    spinner.stop();
    successLog('压缩成功')
  }
  await compressDir()
  await connect(config, compressName)
}