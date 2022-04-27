#!/usr/bin/env ts-node
const program = require('commander')

program
  .version(require('../package').version)
  .usage('<command> [options]')
  .command('upload', 'upload a new project')

program.parse(process.argv)