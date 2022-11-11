import fs from 'fs'
import { resolve } from './utils'
import dayjs from 'dayjs'
export type Config = {
  connect: {
    host?: string,
    port?: number | string,
    username?: string,
    password?: string
  },
  upload: {
    name?: string
    path?: string,
    remotePath?: string
  },

  build?: {
    command?: string
  },

  backup?: {
    open?: boolean,
    outputDir?: string,
    quantity?: number
  }
}

const configPath = resolve(process.cwd(), './yx.deploy.config')
try {
  fs.accessSync(configPath, fs.constants.F_OK);
} catch (err) {
  throw new Error('The yx.deploy.config file does not exist!')
}
export const config: Config = require(configPath)
export const compressName = `${config.upload.name}_${dayjs().format('YYYYMMDD_HHmmss')}.zip`
