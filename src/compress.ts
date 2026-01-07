import fs from 'fs'
import compressing from 'compressing'
import ora from 'ora'
import inquirer from 'inquirer'
import dayjs from 'dayjs'
import path from 'path'
import { resolve, successLog, errorLog, shellExec } from './utils'
import { useConfig, Config } from './config'

interface CompressOptions {
  output?: string
  type?: string
  source?: string
  env?: string
  file?: boolean
}

export const compress = async (option: CompressOptions = {}) => {
  // 优先级：直接传参 > 配置文件（当启用时）> 询问用户
  
  // 1. 检查是否启用配置文件读取
  const useConfigFile = option.file === true
  
  // 2. 尝试读取配置文件（仅在启用时）
  let config: Config | null = null
  let compressName = ''
  
  if (useConfigFile) {
    try {
      // 先读取配置文件内容进行检查
      const configBasePath = resolve(process.cwd(), './yx.deploy.config');
      const configPaths = [
        configBasePath,
        `${configBasePath}.js`,
        `${configBasePath}.ts`
      ];
      
      let configContent = null
      for (const path of configPaths) {
        try {
          fs.accessSync(path, fs.constants.F_OK);
          configContent = require(path);
          break;
        } catch (err) {
          // 文件不存在，继续检查下一个
        }
      }
      
      if (configContent) {
        // 检查是否所有环境的压缩配置都相同
        let allCompressConfigsSame = true
        
        if (Array.isArray(configContent)) {
          // 多环境配置：检查所有环境的压缩配置是否相同
          const firstConfig = configContent[0]
          for (let i = 1; i < configContent.length; i++) {
            const currentConfig = configContent[i]
            if (firstConfig.compress?.type !== currentConfig.compress?.type ||
                firstConfig.backup?.outputDir !== currentConfig.backup?.outputDir) {
              allCompressConfigsSame = false
              break
            }
          }
          
          // 如果所有环境的压缩配置相同，修改option参数跳过环境选择
          if (allCompressConfigsSame && configContent[0]?.env?.name) {
            option = { ...option, env: configContent[0].env.name }
          }
        }
        
        // 复用useConfig函数，根据option参数决定是否选择环境
        const configResult = await useConfig(option)
        config = configResult.config
        compressName = configResult.compressName
        
        console.log('📋 已启用配置文件读取')
      } else {
        console.log('⚠️  配置文件不存在，将跳过配置文件读取')
      }
    } catch (err) {
      // 配置文件读取失败
      console.log('⚠️  配置文件读取失败，将跳过配置文件读取')
      config = null
    }
  } else {
    console.log('📋 未启用配置文件读取，将使用直接传参或交互式设置')
  }
  
  // 3. 检查是否有外部传参
  const hasExternalParams = option && (option.output !== undefined || option.type !== undefined || option.source !== undefined)
  
  // 4. 检查是否有配置文件（仅在启用时）
  const hasConfigFile = useConfigFile && !!config
  

  // 5. 最终值变量声明
  let output, type, source

  // 6. 优先级逻辑：直接传参 > 配置文件（当启用时）> 询问用户
  
  // 优先使用外部传参
  if (hasExternalParams) {
    type = option.type
    source = option.source
    output = option.output
    console.log('📋 使用外部传参设置')
    console.log(`   压缩类型: ${type}`)
    console.log(`   源目录: ${source}`)
    console.log(`   输出目录: ${output}`)
    console.log('')
  }
  // 其次使用配置文件的值（仅在启用时）
  else if (hasConfigFile) {
    // 复用useConfig函数已经处理过的配置信息
    type = config.compress?.type
    source = config.upload?.name
    output = config.backup?.outputDir
    
    console.log('📋 使用配置文件中的设置')
    console.log(`   压缩类型: ${type}`)
    console.log(`   源目录: ${source}`)
    console.log(`   输出目录: ${output}`)
    console.log('')
  }
  
  // 检查是否有任何参数为undefined，如果有则进行交互式提问
  if (type === undefined || source === undefined || output === undefined) {
    console.log('🔧 参数不完整，请手动设置压缩参数')
    console.log('='.repeat(40))
    
    const questions = [
      {
        type: 'list',
        name: 'type',
        message: '请选择压缩类型:',
        choices: [
          { name: 'ZIP - 通用压缩格式', value: 'zip' },
          { name: 'TAR - Unix归档格式', value: 'tar' },
          { name: 'TGZ - 压缩的TAR格式', value: 'tgz' }
        ],
        default: type || 'zip'
      },
      {
        type: 'input',
        name: 'source',
        message: '请输入要压缩的文件或文件夹路径(支持多个路径，用逗号分隔):',
        default: source || '.',
        validate: (input) => {
          if (!input.trim()) {
            return '路径不能为空'
          }
          const paths = input.split(',').map(p => p.trim()).filter(p => p)
          for (const path of paths) {
            const resolvedPath = resolve(process.cwd(), path)
            if (!fs.existsSync(resolvedPath)) {
              return `路径不存在: ${resolvedPath}`
            }
          }
          return true
        }
      },
      {
        type: 'input',
        name: 'output',
        message: '请输入输出目录:',
        default: output || '.',
        validate: (input) => {
          if (!input.trim()) {
            return '输出目录不能为空'
          }
          return true
        }
      }
    ]

    const answers = await inquirer.prompt(questions)
    
    // 使用交互式获取的值覆盖参数
    // 如果参数为undefined，使用交互式获取的值；如果已有值，使用交互式获取的值覆盖
    type = answers.type
    source = answers.source
    output = answers.output
    
    console.log('='.repeat(40))
  }

  // 处理源路径，支持数组形式
  let sourcePaths: string[] = []
  if (Array.isArray(source)) {
    // 如果source已经是数组，直接使用
    sourcePaths = source
  } else if (typeof source === 'string') {
    // 如果是字符串，检查是否包含逗号分隔的多个路径
    if (source.includes(',')) {
      sourcePaths = source.split(',').map(p => p.trim()).filter(p => p)
    } else {
      sourcePaths = [source]
    }
  }

  // 解析输出目录
  const outputDir = resolve(process.cwd(), output)
  
  // 确保输出目录存在
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
    console.log(`📁 创建输出目录: ${outputDir}`)
  }

  // 验证压缩类型
  const validTypes = ['zip', 'tar', 'tgz']
  if (!validTypes.includes(type)) {
    errorLog(`不支持的压缩类型: ${type}。支持的格式: ${validTypes.join(', ')}`)
    return
  }

  // 检查源路径是否存在
  for (const sourcePath of sourcePaths) {
    const resolvedPath = resolve(process.cwd(), sourcePath)
    if (!fs.existsSync(resolvedPath)) {
      errorLog(`源路径不存在: ${resolvedPath}`)
      return
    }
  }

  // 批量压缩处理
  const results = []
  
  for (const sourcePath of sourcePaths) {
    const resolvedSourcePath = resolve(process.cwd(), sourcePath)
    
    // 生成文件名
  let fileName
  if (hasConfigFile && compressName && !hasExternalParams && sourcePaths.length === 1) {
    // 复用配置文件中的压缩文件名（仅当启用配置文件且没有外部传参且只有一个文件时）
    fileName = compressName
  } else {
    // 手动生成文件名（使用外部传参或没有启用配置文件时）
    const folderName = sourcePath === '.' ? 'backup' : sourcePath.split(/[/\\]/).pop() || 'backup'
    const fileExt = type === 'tgz' ? 'tar.gz' : type
    fileName = `${folderName}_${dayjs().format('YYYYMMDD_HHmmss')}.${fileExt}`
  }
    
    const destPath = resolve(outputDir, fileName)

    // 显示压缩信息
    console.log(`\n📋 压缩设置 (${sourcePaths.indexOf(sourcePath) + 1}/${sourcePaths.length}):`)
    console.log(`   📁 源路径: ${resolvedSourcePath}`)
    console.log(`   📦 压缩类型: ${type.toUpperCase()}`)
    console.log(`   📂 输出目录: ${outputDir}`)
    console.log(`   📄 输出文件: ${fileName}`)

    const spinner = ora(`正在压缩 ${sourcePath}...`).start();
    
    try {
      let result
      switch(type) {
        case 'tar':
        case 'tgz': {
          // tar 或 tgz 使用系统命令压缩，保留外层文件夹
          const gzipFlag = type === 'tgz' ? 'z' : '' // tgz 需要 gzip 压缩
          // Git Bash / WSL 下路径转换：D:\... -> /d/...
          const toGitBashPath = (p: string) => {
            const driveLetter = p[0].toLowerCase()
            return '/' + driveLetter + p.slice(2).replace(/\\/g, '/')
          }
      
          // resolvedSourcePath 是要压缩的完整路径
          const parentDir = path.dirname(resolvedSourcePath)       // 父目录
          const baseName = path.basename(resolvedSourcePath)       // 文件夹名
      
          const posixDest = toGitBashPath(destPath)
          const posixParent = toGitBashPath(parentDir)
          const cmd = `tar -c${gzipFlag}f "${posixDest}" -C "${posixParent}" "${baseName}"`
          result = await shellExec({ directive: cmd, cwd: process.cwd() })
          break
        }
        case 'zip':
        default:
          result = await compressing.zip.compressDir(resolvedSourcePath, destPath)
      }
      
      spinner.stop();
      successLog(`压缩成功: ${destPath}`)
      
      // 显示文件大小
      const stats = fs.statSync(destPath)
      const fileSize = (stats.size / 1024 / 1024).toFixed(2)
      console.log(`📊 文件大小: ${fileSize} MB`)
      
      results.push({
        source: resolvedSourcePath,
        dest: destPath,
        size: fileSize,
        type: type
      })
    } catch (error) {
      spinner.stop();
      errorLog(`压缩失败: ${error.message}`)
      throw error
    }
  }

  // 显示批量压缩总结
  if (sourcePaths.length > 1) {
    console.log('\n' + '='.repeat(50))
    console.log('📦 批量压缩完成总结:')
    console.log('='.repeat(50))
    results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.source} -> ${result.dest} (${result.size} MB)`)
    })
    console.log(`\n✅ 总共压缩了 ${results.length} 个文件/文件夹`)
  }

  return results
}

