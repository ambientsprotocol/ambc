# Ambients Protocol Compiler _(ambc)_

> Ambient Syntax `a[]` to JSON represntation `{ "type": "Ambient", "id": "a", "children": [] }`

## Background

[Ambients](https://ambients.org) is a protocol for distributed computation. It allows you to request and execute computation as easily as you can data inside OrbitDB. Think of it like AWS Lambda or Azure Cloud functions, but on a decentralized peer-to-peer network.

The protocol also includes guarantees as to the verfiability and safety of the code, all without a blockchain.

## Description

A working implementation of the Ambients protocol has two main functions:

1. Compile source language code into "byecode" DAG, and store it in a distributed, peer-to-peer network.
2. Retrieve the DAG from said network and safely + verfiably execute the code.

This code covers the first part: the compiler. This is covered in great detail in [Chapter 6 of the Ambients Whitepaper](https://github.com/ambientsprotocol/whitepaper/blob/master/06-compilation-model.md)

`ambc` functions by first detecting the type of input file and then performing the parsing necessary to compile it down to an _abstract syntax tree_ (AST).

The compiler steps are as follows:
1. Input source code from your desired language (currently JavaScript) and compile to Ambient ASCII syntax as an intermediate representation.
2. Parse ASCII syntax into a JSON AST and output.

The code in this repository deals _only_ with step 2 above, and relies on external dependencies like `js2amp` for step 1.

### Step 1: Source code -> Ambients syntax

```JavaScript
() => "hello"
```
### ⬇
```text
func[
  open_|
  string[hello[]]
]|
open func
```

#### Supported source languages

- Ambients Syntax
- [JavaScript (WIP)](https://github.com/aphelionz/js2amb)

If you think you know a particular language (Ruby, C#, etc) _really_ well and want to get your head around Ambients,
this is a great place to start contributing. It's even just a great way of testing your understanding.

### Step 2: Ambients Syntax to preliminary Abstract Syntax Tree (AST)

```text
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

The JSON AST is intentionally and exceedingly simple. It a recursive structure of nodes that has three fields:

1. `type`: **Required** - the type of the ambient, enum as string
2. `id`: _Optional_ - a string identifier
3. `children` _Optional_ - array of more child nodes

Note that things like types and the `func` primitive are not given any special treatment yet.

From there, it's as simple as `ipfs add` or `ipfs dag put`. The hash from that operation is what will be stored and passed along to the execution engine to be run on a distributed, peer to peer network.

## Install

First, [install node.js](https://www.nodejs.org) Then:

```bash
$ git clone https://github.com/aphelionz/ambc
$ cd ambc
$ npm install
```

# Usage

There is currently rudimentary CLI support via `src/bin.js`:

```bash
$ ./src/bin.js path/to/js/file.js # outputs AST
$ ./src/bin.js other/path/raw.ambient # Also understands ambient syntax
```

You can run the tests.

```bash
$ npm install
% make test
```

# Contributing

Please do! If you're _at all_ interested in this topic you should definitely
[seek us out on Gitter](https://gitter.im/ambientsprotocol/community), open issues, and submit PRs.

To edit the parser syntax, edit the grammar at `src/parser/ambients.pegjs` and then run `make build` to build the `parser.js` file (optimized for speed) and its little buddy the `parser-tiny.js` file, optimized for size.

# License

[MIT](LICENSE) © Haja Networks Oy
