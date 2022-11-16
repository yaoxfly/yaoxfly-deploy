#!/usr/bin/env node
import { upload } from './upload'
import { Command } from 'commander'
import { backup } from './backup'
const program = new Command()

program
  .version(require('../version').version)
  .name('yx-deploy')

program
  .command('upload').alias('u')
  .description('Upload project')
  .action(() => {
    upload()
  })

program
  .command('revert').alias('r')
  .description('Revert project')
  .option('-l --latest', 'Revert latest version')
  .action((options:any) => {
    backup(options)
  })

program.parse(process.argv)