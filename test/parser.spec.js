const assert = require('assert')

const ambients = require('../src')
const fs = require('fs')
const parse = ambients.parser.parse

const FIXTURES_PATH = 'test/fixtures/parser/'

describe('Parser', function () {
  it('Parses basic ambient syntax', () => {
    const fixtures = fs.readdirSync(FIXTURES_PATH)
    while (fixtures.length > 0) {
      console.log(`Parsing: ${fixtures[0].split('.')[0]}`)
      const syntax = fs.readFileSync(FIXTURES_PATH + fixtures[0])
      const result = fs.readFileSync(FIXTURES_PATH + fixtures[1])
      assert.deepStrictEqual(parse(syntax.toString().trim()), JSON.parse(result.toString()))
      fixtures.splice(0, 2)
    }
  })
})
