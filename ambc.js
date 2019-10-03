const ambients = require('./src')
const parse = require('./src/parser/parser-flex-js')
const fs = require('fs')

console.log("Compiling...")
const output = ambients.fromJS(process.argv[2])
console.log(output)

console.log("Convert to json...")
const json = parse(output)
console.log()
// console.log(JSON.stringify(json))

const outputFilename = process.argv[2].split("/").pop().split(".js").slice(0, 1) + ".json"
fs.writeFileSync(outputFilename, JSON.stringify(json, null, 2))
console.log("Saved to", outputFilename)
