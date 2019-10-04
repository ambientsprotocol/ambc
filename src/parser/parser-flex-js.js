const Lexer = require('flex-js')
const assert = require("assert")

// const input = "func[in_ x.open x.open_] | x[in func.open_ | result[y[open_]]] | open func"

const parse = (input) => {
  let depth = 0
  let curOp = null

  let ambient = {name: "", children: [], capabilities: [], create: [], prev: null}
  let blockParent = null
  let isInBlock = false

  const ambientToString = (a) => {
    return a.next.map((e, i) => {
      let res = ""
      if (e.op === "create") {
        res += e.target + "["
      } else {
        res += e.op + (e.target ? " " + e.target : "")
        if (e.next.length > 0)
          res += "."
      }

      if (i === a.next.length)
        res += ""
      else
        res += ambientToString(e)

      if (e.op === "create")
        res += "]"

      if (a.next.length > 1 && i < a.next.length - 1)
        res += " | "

      return res
    }).join("")
  }

  const createNext = (lexer) => {
    const [op, target] = lexer.text.split(" ")
    // console.log("", " ".repeat(depth), "op!", "op:", op, ", target:", target, "parent:", parent)
    // if (curOp) {
    //   curOp.next.push({op, target, next: []})
    //   curOp = curOp.next[curOp.next.length - 1]
    // } else {
      // curOp = {op, target, next: []}
      ambient.capabilities.push(lexer.text)
    // }
  }
  const endOfSequence = () => {
    curOp = null
  }

  const lexer = new Lexer()
  lexer.addState('ambient', true)
  lexer.addState('comment', false)

  lexer.addRule(/(in+\s+\w+\b)/, createNext)
  lexer.addRule(/(in_+\s+\w+\b)/, createNext)
  lexer.addRule(/(out+\s+\w+\b)/, createNext)
  lexer.addRule(/(out_+\s+\w+\b)/, createNext)
  lexer.addRule(/(open+\s+\w+\b)/, createNext)
  lexer.addRule(/(open_+)/, createNext)
  lexer.addRule('|', endOfSequence)
  lexer.addRule('.', lexer => {})
  lexer.addRule('[', lexer => {})
  lexer.addRule(']', lexer => {
    endOfSequence()
    // console.log(">>", JSON.stringify(ambient, null, 2))
    const prev = ambient.prev
    delete ambient.prev
    prev.children.push(ambient)
    ambient = prev
  })

  lexer.addRule('(', lexer => {
    // console.log()
    // console.log("1", ambient)
    blockParent = Object.assign({}, ambient)
    ambient.capabilities.push("create")
    ambient = {name: "", children: [], capabilities: [], create: [], prev: Object.assign({}, ambient)}
  })
  lexer.addRule(')', lexer => {
    // console.log()
    // console.log("2", ambient)
    // console.log("------------\n", JSON.stringify(ambient, null, 2))
    // console.log("------------")
    const prev = ambient.prev
    delete ambient.prev
    prev.create.push(ambient)
    ambient = prev
    // console.log("3", JSON.stringify(ambient, null, 2))
  })

  // Match words as ambient names
  lexer.addRule(/\w+\b/, lexer => {
    ambient = {name: lexer.text, children: [], capabilities: [], create: [], prev: ambient}
  })
  // Discard everything else
  lexer.addRule(/\w/, lexer.discard())

  // Run
  lexer.setSource(input)
  lexer.lex()

  delete ambient.prev
  // console.log(JSON.stringify(ambient, null, 2))
  return ambient
}

module.exports = parse