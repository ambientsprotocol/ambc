# Ambients Protocol Compiler _(ambc)_

> Compile your code into something that "speaks" Ambients

## Description

[Ambients](https://ambients.org) is a protocol for distributed computation. It has two main functions:

1. Compile source language code into "byecode" DAG, and store it in a distributed, peer-to-peer network.
2. Retrieve the DAG from said network and safely + verfiably execute the code.

This code covers the first part: the compiler.

### Stage 0: Source Code -> Ambients Syntax

```JavaScript
() => "hello"
```
### ⬇
```
func[
  open_|
  string[hello[]]
]|
open func
```

#### Supported Source Languages

- JavaScript (WIP) [Using Esprima AST](https://github.com/aphelionz/ambients.js/blob/master/src/fromjs/index.js)

If you think you know a particular language (Ruby, C#, etc) _really_ well and want to get your head around Ambients,
this is a great place to start contributing. It's even just a great way of testing your understanding.

### Stage 1: Ambients Syntax to Preliminary AST

```
func[
  open_|
  string[hello[]]
]|
open func
```
### ⬇
```json
{ "type": "Parallel", "children": [
  { "type": "Ambient", "id": "func", "children":[
    { "type": "Parallel", "children": [
      { "type": "Open_", "id": "*" },
      { "type": "Ambient", "id": "string", "children": [
        { "type": "Noop", "id": "hello" }
      ]
    }
  ] },
  { "type": "Open", "id": "func" }
] }
```

Note that things like types and the `func` primitive are not given any special treatment yet.

### [WIP] Stage 2: AST to Ambient Primitives
### [WIP] Stage 3: Ambient Primitives to Bytecode DAG

Stages 2 and 3 are also great places to contribute since from there, it's as simple as `ipfs add` or `ipfs dag put`.

## Install

First, [install node.js](https://www.nodejs.org) Then:

```bash
$ git clone https://github.com/aphelionz/ambients.js
$ cd ambients.js
$ npm install
```

# Usage

To see it in action, you can run the tests.

```bash
% make test
```

# Contributing

Please do! If you're _at all_ interested in this topic you should definitely
[seek us out on Gitter](https://gitter.im/ambientsprotocol/community), open issues, and submit PRs.

To edit the parser syntax, edit the grammar at `src/parser/ambients.pegjs` and then run `make build` to build the `parser.js`
file (optimized for speed) and its little buddy the `parser-tiny.js` file, optimized for size.

# License

MIT
