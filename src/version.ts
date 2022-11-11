#!/usr/bin/env node
import { readFile, resolve } from './utils'
import fs from 'fs'
import chalk from 'chalk'
import symbols from 'log-symbols';
const packageJson = readFile(resolve('../package.json'))
fs.writeFile(resolve('../version.json'), JSON.stringify({ version: packageJson.version }, null, 2), function (err) {
  if (err) console.error(err)
  console.log(symbols.success, chalk.green('version.json文件已经更新'));
})