const esprima = require('esprima')
const fs = require('fs')

let rules = {}

const findAlias = (name, aliases) => {
  if (aliases[name] && aliases[aliases[name]])
    return findAlias(aliases[name], aliases)
  return aliases[name]
}

rules.VariableDeclaration = function (block, parent, depth, currentPath, options) {
  // Currently a pass thru to VariableDeclarator
  // TODO: multiple declarations i.e. x = y = 3?
  return parseBlock(block.declarations[0], block, depth, currentPath, options)
}

rules.VariableDeclarator = function (block, parent, depth, currentPath, options) {
  const name = parseBlock(block.id, block, depth, currentPath, options)
  const init = parseBlock(block.init, block, depth, currentPath, options)

  if (block.init.type === "Literal" && parent.type === "VariableDeclaration") {
    return ""
  } else if (block.init.type === "Identifier" && parent.type === "VariableDeclaration") {
    options.aliases[name] = init
    return ""
  }

  return name + '[' + init + ']'
}

rules.ArrowFunctionExpression = function (block, parent, depth, currentPath, options) {
  const parentName = parent.id ? parent.id.name : null
  const params = block.params
  const paramNames = params.map(e => e.name)
  const hasParams = (params && params.length > 0)

  options.names[parentName] = {args: paramNames} // save the param names to a global cache for using as a lookup index elsewhere in the compiler

  let functionBody = ""
  let functionName = ""
  let functionType = ""

  if (block.body.type === "BinaryExpression") {
    const operator = block.body.operator
    if (operator === "+") {
      functionName = `concat`
      functionType = `string`
    }
  }

  if (hasParams) {
    let syntax = 'func['
    for (const param of block.params) {
      syntax += parseBlock(param, block, depth, currentPath, options)
      syntax += `[in_ arg.open arg.in ${functionType}.in ${functionName}]|`
    }
    syntax += parseBlock(block.body, block, depth, currentPath, options)
    syntax += '|open_]|'

    return syntax
  } else {
    let syntax = 'in_ call.open call.('

    if (block.body.type === "Identifier") {
      // Replace variable directly with its (previously compiled) value
      const value = options.names[block.body.name].value
      syntax += value + '|'
    } else if (block.body.type === "Literal") {
      syntax += parseBlock(block.body, parent, depth, currentPath, options)
    } else {
      syntax += parseBlock(block.body, parent, depth, currentPath, options)
    }

    syntax += 'open return.open_)'
    return syntax
  }
}

rules.ExpressionStatement = function (block, parent, depth, currentPath, options, ambients) {
  return parseBlock(block.expression, parent, depth, currentPath, options, ambients)
}

rules.CallExpression = function (block, parent, depth, currentPath, options, ambients) {
  const callee = block.callee.callee ? block.callee.callee.name : block.callee.name
  const alias = findAlias(callee, options.aliases)
  const funcName = alias || callee
  const parentName = parent.id ? parent.id.name : ''

  const args = block.arguments
  const paramNames = options.names[funcName] ? options.names[funcName].args : []
  const params = args.map((e, i) => {
    const opts = {target: paramNames[i], isLast: i === paramNames.length - 1}
    return parseBlock(e, parent, depth, currentPath, {...opts, ...options}, ambients)
  })

  if (parent === 'root') {
    let syntax = ''
    syntax += `call[in ${funcName}.open_.return[open_.in func]]|`
    syntax += `func[in_ ${funcName}.open ${funcName}.open_]|open func`
    return syntax
  } else {
    let syntax = `out_ call.in_ ${funcName}|`
    syntax += `call[out ${parentName}.in ${funcName}.open_.return[open_.in ${parentName}.in func]]`
    syntax += '|'
    syntax += `func[in_ ${funcName}.open ${funcName}.(`
    syntax += params.length > 0 ? (params.join('') + '|open func.') : ''
    syntax += 'open_)]|open func.'
    return syntax
  }
}

rules.Identifier = (block, parent, depth, currentPath, options, ambients) => block.name

rules.Literal = (block, parent, depth, currentPath, options, ambients) => {
  let ambient = ''
  const value = block.value
  const type = typeof value
  const parentBody = parent.init.body

  if (parentBody && parentBody.type === "CallExpression") {
    const { target, isLast } = options
    const p = isLast ? "" : "|"
    ambient = `arg[${type}[${value}[]]|in ${target}.open_]${p}`
  } else if (parent.type === "VariableDeclarator") {
    ambient = `${type}[${value}[]]`
    options.names[parent.id.name] = {value: ambient}
    ambient += '|'
  }
  return ambient
}

rules.BinaryExpression = function (block, parent, depth, currentPath, options, ambients) {
  // TODO: Switch on operator like above ^^
  const left = parseBlock(block.left, block, depth, currentPath, options)
  const right = parseBlock(block.right, block, depth, currentPath, options)
  return `string[concat[in_ ${left}|in_ ${right}]|in_ ${left}|in_ ${right}]`
}

rules.Program = function (block, parent, depth, currentPath, options) {
  let ambients = ''
    block.body.forEach((e, i) => {
      // console.log("parse:", e)
      const isLast = (i === block.body.length - 1)
      const parsed = parseBlock(e, parent, depth, currentPath, options)
      ambients += parsed + (isLast || parsed === "" ? "" : "|")
    })
  return ambients
}

const parseBlock = (block, parent, depth, currentPath, options) => {
  parent = parent || 'root'
  let ambients = ''
  if (rules[block.type]) {
    ambients += rules[block.type](block, parent, depth, currentPath, options)
  } else {
    console.log(`Unknown block type "${block.type}" in block:`)
    console.log(block)
  }
  return ambients
}

module.exports = function (input) {
  const js = fs.readFileSync(input || process.argv[2] || './source.js').toString()
  const parsed = esprima.parseScript(js)
  return parseBlock(parsed, null, 0, '', {names: {}, aliases: {}})
}
