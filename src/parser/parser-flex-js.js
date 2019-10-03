const Lexer = require('flex-js')
const assert = require("assert")

// const input = "a[in_ b.open_] | open a | b[in a]"
// const input = "a[in_ b.open b.open_] | open a | b[in a.open_|result[]]"
// const input = "func[in_ x.open x.open_] | x[in func.open_ | result[y[open_]]] | open func"

const parse = (input) => {
  // const input = process.argv[2]
  let depth = 0
  let curOp = null

  let ambient = {name: "", children: [], capabilities: [], prev: null}

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

  lexer.addRule(/(in+\s+\w+\b)/, createNext)
  lexer.addRule(/(in_+\s+\w+\b)/, createNext)
  lexer.addRule(/(out+\s+\w+\b)/, createNext)
  lexer.addRule(/(out_+\s+\w+\b)/, createNext)
  lexer.addRule(/(open+\s+\w+\b)/, createNext)
  lexer.addRule(/(open_+)/, createNext)
  lexer.addRule('|', endOfSequence)
  lexer.addRule('[', lexer => {})
  lexer.addRule(']', lexer => {
    endOfSequence()
    const prev = ambient.prev
    delete ambient.prev
    prev.children.push(ambient)
    ambient = prev
  })
  // Match words as ambient names
  lexer.addRule(/\w+\b/, lexer => {
    ambient = {name: lexer.text, children: [], capabilities: [], prev: ambient}
  })
  // Discard everything else
  lexer.addRule(/\w/, lexer.discard())

  // Run
  lexer.setSource(input)
  lexer.lex()

  delete ambient.prev
  return ambient
}

module.exports = parse