#!/usr/bin/env node
import {upload} from './upload'
import { Command } from 'commander'
const program = new Command()

program
  .version(require('../version').version)
  .name('yx-deploy')

  program
  .command('upload' ).alias('u')
  .description('Upload project')
  .action(() => {
    upload()
  })

program.parse(process.argv)