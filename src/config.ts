import fs from 'fs'
import { resolve } from './utils'
import dayjs from 'dayjs'
import inquirer from 'inquirer'
export type Config = {
  env?: {
    name?: string,
    description?: string
  }
  connect?: {
    host?: string,
    port?: number | string,
    username?: string,
    password?: string
  },
  upload?: {
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

export const useConfig = async (option) => {
  // console.log(option, '配置里获取到的option参数')
  const { env } = option || {}
  const configBasePath = resolve(process.cwd(), './yx.deploy.config');
  const configPaths = [
    configBasePath,
    `${configBasePath}.js`,
    `${configBasePath}.ts`
  ];
  let configPath = '';
  for (const path of configPaths) {
    try {
      fs.accessSync(path, fs.constants.F_OK);
      configPath = path;
      break;
    } catch (err) {
    }
  }
  
  if (!configPath) {
    throw new Error('The yx.deploy.config file does not exist! Supported extensions are: none, .js, .ts');
  }

  let configContent = require(configPath)
  let config: Config = {}
  let compressName = ''

  if (Array.isArray(configContent)) {
    const configObj: Config = {}
    configContent.forEach(item => {
      const { env: { name = '' } } = item || {}
      configObj[name] = item
    })
    const choices = Object.keys(configObj).map(key => {
      const { env: { name = '', description = '' } } = configObj[key] || {}
      return `${name} ${description ? '--' + description : ''}`
    })
    if (env) {
      config = configObj[env]
      // console.log(config)
    } else {
      const param = [
        {
          type: 'list',
          message: '请选择要上传的服务器环境',
          name: 'selectEnv',
          choices: choices,
          filter: (val) => {
            return val.split(' ')[0]
          }
        }
      ]
      const answers = await inquirer.prompt(param)
      const { selectEnv } = answers || {}
      // console.log(configObj[selectEnv])
      config = configObj[selectEnv]
    }
  } else {
    config = configContent
  }
  compressName = `${config.upload.name}_${dayjs().format('YYYYMMDD_HHmmss')}.zip`
  return { config, compressName }
}