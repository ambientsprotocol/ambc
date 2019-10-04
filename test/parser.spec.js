const assert = require('assert')

const { parse, irParser } = require('../src')
const fs = require('fs')

const IR_FIXTURES_PATH = 'test/fixtures/ir/'
const PARSER_FIXTURES_PATH = 'test/fixtures/parser/'

describe('Parser', function () {
  it('Parses ambient syntax into intermediate representation', () => {
    const fixtures = fs.readdirSync(IR_FIXTURES_PATH)
    while (fixtures.length > 0) {
      console.log(`Parsing: ${fixtures[0].split('.')[0]}`)
      const syntax = fs.readFileSync(IR_FIXTURES_PATH + fixtures[0])
      // console.log(JSON.stringify(parser.parse(syntax.toString().trim())))
      const result = fs.readFileSync(IR_FIXTURES_PATH + fixtures[1])
      assert.deepStrictEqual(irParser.parse(syntax.toString().trim()), JSON.parse(result.toString()))
      fixtures.splice(0, 2)
    }
  })

  it('Parses ambient syntax into machine-readable primitive representation', () => {
    const fixtures = fs.readdirSync(PARSER_FIXTURES_PATH)
    while (fixtures.length > 0) {
      console.log(`Parsing: ${fixtures[0].split('.')[0]}`)
      const syntax = fs.readFileSync(PARSER_FIXTURES_PATH + fixtures[0])
      // console.log(JSON.stringify(parse(syntax.toString().trim())))
      const result = fs.readFileSync(PARSER_FIXTURES_PATH + fixtures[1])
      assert.deepStrictEqual(parse(syntax.toString().trim()), JSON.parse(result.toString()))
      fixtures.splice(0, 2)
    }
  })
})
