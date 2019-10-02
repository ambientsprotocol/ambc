const assert = require('assert')

const ambients = require('../src')
const fs = require('fs')
const FIXTURES_PATH = 'test/fixtures/js/'

describe('JS Compiler', function () {
  it('compiles to ambient syntax', () => {
    const fixtures = fs.readdirSync(FIXTURES_PATH)
    const len = fixtures.length / 2
    while (fixtures.length > 0) {
      console.log(`Compiling: ${fixtures[0].split('.')[0]}`)
      // console.log(JSON.stringify(parse(syntax.toString().trim())))
      const result = fs.readFileSync(FIXTURES_PATH + fixtures[0])
      assert.strictEqual(ambients.fromJS(FIXTURES_PATH + fixtures[1]), result.toString().replace(/\r?\n\s*|\r\s*/g, "").replace(/\s+/g, ' '), 'Test case ' + (len - fixtures.length / 2 + 1) + " failed")
      fixtures.splice(0, 2)
    }
  })
})
