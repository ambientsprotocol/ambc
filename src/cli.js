#!/usr/bin/env node

const fs = require('fs')
const js2amb = require('js2amb')
const mime = require('mime-types')
const { parse, irParser } = require('./index')
const multiaddr = require('multiaddr')
const io = require('orbit-db-io')

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
      console.log(nodeAddress)
      ipfs = new IPFS(nodeAddress.address, nodeAddress.port)
    } else {
      const IPFS = require('ipfs')
      ipfs = await IPFS.create()
    }
  } catch (e) {
    console.error(e)
    throw new Error('Please use npm to install either `ipfs` or `ipfs-http-client`.')
  }

  const output = async (ambient, argv) => {
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
      default:
        result = parse(ambient)
        result = JSON.stringify(result, null, 2)
        break
    }

    // --display flag
    // -o option
    if (argv.display) return process.stdout.write(result)
    if (argv.o) return fs.writeFileSync(argv.o, result)

    const hash = await io.write(ipfs, 'dag-cbor', result)
    process.stdout.write(hash)
  }

  // Register new MIME type for .ambient files
  mime.extensions['text/ambients'] = ['ambient']
  mime.types.ambient = 'text/ambients'

  const file = fs.readFileSync(argv.input).toString().trim()

  switch (mime.lookup(argv.input)) {
    case 'application/javascript':
      await output(js2amb(file), argv); break
    case 'text/ambients':
      await output(file, argv); break
    default:
      throw new Error('File type not recognized')
  }

  if (!argv['ipfs-api']) {
    await ipfs.stop()
    process.exit(0)
  }
})(argv)
