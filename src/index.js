const irParser = require('./ir')
const parse = require('./parser')
const js2amb = require('js2amb')
const io = require('orbit-db-io')
const fs = require('fs')

const ambients = { irParser, parse }

const js = {
  irParser: (js) => {
    const ambientSyntax = js2amb(js)
    return ambients.irParser.parse(ambientSyntax)
  },
  parse: (js) => {
    const ambientSyntax = js2amb(js)
    return ambients.parse(ambientSyntax)
  }
}

const output = async (ipfs, ambient, argv) => {
  console.log(argv)
  // --format option
  let result
  switch (argv.format) {
    case 'ambient':
      result = ambient
      break
    case 'ir':
      result = js.irParser.parse(ambient)
      result = JSON.stringify(result, null, 2)
      break
    default:
      result = js.parse(ambient)
      result = JSON.stringify(result, null, 2)
      break
  }

  // --display flag
  // -o option
  if (argv.display) return process.stdout.write(result)
  if (argv.o) return fs.writeFileSync(argv.o, result)

  const hash = await io.write(ipfs, 'dag-cbor', result)
  return hash
}

module.exports = { ambients, js, output }
