const irParser = require('./ir')
const parse = require('./parser')
const js2amb = require('js2amb')

module.exports = {
  ambients: { irParser, parse },
  js: {
    // irParser: () => {}, TODO: IR for javascript
    parse: (js) => {
      const ambientSyntax = js2amb(js)
      return parse(ambientSyntax)
    }
  }
}
