#!/usr/bin/env node

const fs = require('fs')
const mime = require('mime-types')
const { output } = require('./index')
const multiaddr = require('multiaddr')

const argv = require('yargs')
  .usage('$0 <input> [options]', 'Compile source code to ambient syntax or JSON AST', (yargs) => {
    yargs
      .positional('input', {
        describe: 'Path to the source code file you want to compile'
      })
      .option('display', {
        describe: 'Write output to stdout instead of the output file',
        type: 'boolean',
        default: false
      })
      .option('ipfs-api', {
        describe: 'Use an IPFS HTTP API by specifying a multiaddress i.e. "/ip4/127.0.0.1/tcp/5001"'
      })
      .option('format', {
        describe: 'Output format of the compiler',
        choices: ['ambient', 'ir', 'final'],
        default: 'final'
      })
      .option('o', {
        describe: 'Use to specify a custom path to the output file i.e. "./out/function.js"'
      })
  })
  .showHelpOnFail(true, 'Specify --help for available options')
  .argv

;(async (argv) => {
  let ipfs

  try {
    if (argv['ipfs-api']) {
      // --ipfs-api option
      const IPFS = require('ipfs-http-client')
      const addr = multiaddr(argv['ipfs-api'])
      const nodeAddress = addr.nodeAddress()
      ipfs = new IPFS(nodeAddress.address, nodeAddress.port)
    } else {
      const IPFS = require('ipfs')
      ipfs = await IPFS.create({ start: false })
    }
  } catch (e) {
    console.error(e)
    throw new Error('Please use npm to install either `ipfs` or `ipfs-http-client`.')
  }

  // Register new MIME type for .ambient files
  mime.extensions['text/ambients'] = ['ambient']
  mime.types.ambient = 'text/ambients'

  const file = fs.readFileSync(argv.input).toString().trim()

  let result
  switch (mime.lookup(argv.input)) {
    case 'application/javascript':
      result = await output(ipfs, file, argv); break
    case 'text/ambients':
      result = await output(ipfs, file, argv); break
    default:
      throw new Error('File type not recognized')
  }

  process.stdout.write(result + '\n')
  process.exit(0)
})(argv)
