#!/usr/bin/env node

const argv = require('yargs')
  .usage('$0 <input> [options]', 'Compile source code to ambient ', (yargs) => {
    yargs
      .positional('input', {
        describe: 'Path to the source code file you want to compile'
      })
      .option('format', {
        describe: 'Output format of the compiler',
        choices: ['ambient', 'ir', 'final'],
        default: 'final'
      })
      .option('display', {
        describe: 'Write output to stdout instead of the output file',
        type: 'boolean',
        default: false
      })
      .option('o', {
        describe: 'Use to specify a custom path to the output file i.e. "./out/funcion.js"',
        default: 'output.json'
      })
  })
  .showHelpOnFail(true, 'Specify --help for available options')
  .argv

const fs = require('fs')
const js2amb = require('js2amb')
const mime = require('mime-types')
const { parse, irParser } = require('./index')

const output = (ambient, argv) => {
  // --format option
  let result
  switch (argv.format) {
    case 'ambient':
      result = ambient
      break
    case 'ir':
      result = irParser.parse(ambient)
      result = JSON.stringify(result, null, 2)
      break
    case 'final':
      result = parse(ambient)
      result = JSON.stringify(result, null, 2)
      break
  }

  // --display flag
  // -o option
  argv.display ? process.stdout.write(result) : fs.writeFileSync(argv.o, result)
}

// Register new MIME type for .ambient files
mime.extensions['text/ambients'] = ['ambient']
mime.types.ambient = 'text/ambients'

const file = fs.readFileSync(argv.input).toString().trim()

switch (mime.lookup(argv.input)) {
  case 'application/javascript':
    output(js2amb(file), argv)
    break
  case 'text/ambients':
    output(file, argv)
    break
  default:
    throw new Error('File type not recognized')
}
