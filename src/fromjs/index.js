const esprima = require('esprima')
const fs = require('fs')
// const path = require('path')
// let names = {}

// const getOutPath = (currentPath) => currentPath === "root" ? [] : currentPath.split("/").filter(e => e !== '')
// const getInPath = (currentPath) => currentPath === "root" ? [] : currentPath.split("/").filter(e => e !== '')
// const binaryOperatorToName = (operator) => {
//   switch (operator) {
//     case "+":
//       return "plus"
//     case "-":
//       return "minus"
//     default:
//       return "monoid"
//   }
// }

const rules = {}

rules.VariableDeclaration = function (block, parent, depth, currentPath, options) {
  // Currently a pass thru to VariableDeclarator
  // TODO: multiple declarations i.e. x = y = 3?
  return parseBlock(block.declarations[0], block, depth, currentPath)
}

rules.VariableDeclarator = function (block, parent, depth, currentPath, options) {
  const id = parseBlock(block.id, block, depth, currentPath)
  const init = parseBlock(block.init, block, depth, currentPath)
  return id + init
}

rules.ArrowFunctionExpression = function (block, parent, depth, currentPath, options) {
  const params = block.params
  const hasParams = (params && params.length > 0)

  if (hasParams) {
    let syntax = '[in_ call.open call.(func['
    for (const param of block.params) {
      syntax += parseBlock(param, block, depth, currentPath, options)
      syntax += '[in_ arg.open arg.in string.in concat]|'
    }
    syntax += parseBlock(block.body, parent, depth, currentPath)
    syntax += '|open_]|open return.open_)]|'
    return syntax
  } else {
    return parseBlock(block.body, parent, depth, currentPath, options)
  }
}

rules.ExpressionStatement = function (block, parent, depth, currentPath, options, ambients) {
  return parseBlock(block.expression, parent, depth, currentPath)
}

rules.CallExpression = function (block, parent, depth, currentPath, options, ambients) {
  // TODO: Resolve this better
  const funcName = block.callee.callee ? block.callee.callee.name : block.callee.name
  const out = parent.id ? parent.id.name : ''

  if (parent === 'root') {
    return `|open ${funcName}`
  } else {
    let syntax = `[out_ call.in_ ${funcName}|open func.open_|`
    syntax += `call[out ${out}.in ${funcName}.open_.return[open_.in ${out}.in func]]`
    syntax += '|'
    syntax += `func[in_ ${funcName}.open ${funcName}.(`

    // TODO: How do we know that the args in ?
    // Maybe the "function table" that creates the `nu`s can hold some function metadata
    if (block.arguments.length === 2) {
      syntax += `arg[string[${block.arguments[0].value}[]]|in left.open_]|`
      syntax += `arg[string[${block.arguments[1].value}[]]|in right.open_]|`
    }
    syntax += 'open func.open_)]]'
    return syntax
  }
}

rules.Identifier = (block, parent, depth, currentPath, options, ambients) => block.name

rules.BinaryExpression = function (block, parent, depth, currentPath, options, ambients) {
  // TODO: Switch on operator like above ^^
  const left = parseBlock(block.left, block, depth, currentPath, options)
  const right = parseBlock(block.right, block, depth, currentPath, options)
  return `string[concat[in_ ${left}|in_ ${right}]|in_ ${left}|in_ ${right}]`
}

const parseBlock = (block, parent, depth, currentPath, options) => {
  parent = parent || 'root'
  let ambients = ''

  // Set up, register names, etc.
  if (block && block.body && Array.isArray(block.body)) {
    // Create names
    block.body
      .filter(e => e.declarations !== undefined)
      .map(e => e.declarations[0].id.name)
      .forEach(e => { ambients += 'nu ' + e + '.' })

    // Create ambients
    ambients += '('

    block.body.forEach((e, i) => {
      ambients += parseBlock(e, parent, depth, currentPath, '')
    })

    ambients += ')'
  }
  if (rules[block.type]) {
    ambients += rules[block.type](block, parent, depth, currentPath, options)
  } else {
    console.log(`Unknown block type: ${block.type}`)
  }

  return ambients
}

module.exports = function (input) {
  const js = fs.readFileSync(input || process.argv[2] || './source.js').toString()
  const parsed = esprima.parseScript(js)
  return parseBlock(parsed, null, 0, '', '')
}
