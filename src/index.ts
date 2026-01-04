#!/usr/bin/env node
import { upload } from './upload'
import { Command } from 'commander'
import { backup } from './backup'
import { compress } from './compress'
import {useConfig} from './config' 

const program = new Command()
program
  .version(require('../version').version)
  .name('yx-deploy')

program
  .command('upload').alias('u')
  .option('-e --env <env-name>', 'Please enter an environment')
  .description('Upload project')
  .action((option) => {
    upload(option,useConfig)
  })

program
  .command('revert').alias('r')
  .description('Revert project')
  .option('-l --latest', 'Revert latest version')
  .option('-e --env <env-name>', 'Please enter an environment')
  .action((options:any) => {
    backup(options,useConfig)
  })

program
  .command('compress').alias('c')
  .option('-s --source <source-dir>', 'Source directory to compress')
  .option('-t --type <compress-type>', 'Compression type: zip, tar, tgz')
  .option('-o --output <output-dir>', 'Specify output directory for compressed file')
  .option('-f --file', 'Use yx.deploy.config.ts configuration file')

  .description('Compress project only (without upload)')
  .action((option) => {
    compress(option)
  })

program.parse(process.argv)