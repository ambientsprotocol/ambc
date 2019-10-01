const assert = require('assert')

const ambients = require('../src')
const fs = require('fs')
const FIXTURES_PATH = 'test/fixtures/js/'

describe('JS Compiler', function () {
  it('parses ', () => {
    const fixtures = fs.readdirSync(FIXTURES_PATH)
    while (fixtures.length > 0) {
      console.log(`Parsing: ${fixtures[0].split('.')[0]}`)
      // console.log(JSON.stringify(parse(syntax.toString().trim())))
      const result = fs.readFileSync(FIXTURES_PATH + fixtures[0])
      assert.strictEqual(ambients.fromJS(FIXTURES_PATH + fixtures[1]), result.toString().replace(/\r?\n\s*|\r\s*/g, "").replace(/\s+/g, ' '))
      fixtures.splice(0, 2)
    }
  })
})
