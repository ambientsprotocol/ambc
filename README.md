# Ambients Protocol Compiler _(ambc)_

> Ambient Syntax `a[]` to JSON represntation `{ "type": "Ambient", "id": "a", "children": [] }`

## Table of contents

- [Background](#background)
- [Description](#description)
    - [Compiler steps](#compiler-steps)
    - [Supported source languages](#supported-source-languages)
    - [Abstract syntax tree format](#abstract-syntax-tree-format)
- [Install](#install)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Background

[Ambients](https://ambients.org) is a protocol for distributed computation. It allows you to request and execute computation as easily as you can data inside OrbitDB. Think of it like AWS Lambda or Azure Cloud functions, but on a decentralized peer-to-peer network.

The protocol also includes guarantees as to the verfiability and safety of the code, all without a blockchain.

## Description

From the [Ambients whitepaper](https://github.com/ambientsprotocol/whitepaper/blob/master/06-compilation-model.md#translating-ambients-programs):

> The Ambients protocol overall is programming language-agnostic. That means almost any programming language can be used to write distributed programs, as long as there's a compiler that can process the source language and turn it into the Ambients bytecode. While most common programming languages can be used, due to the protocol primitives, functions and types, functional languages are especially well-suited to write distributed programs.

> Compilation model requires all compilers to:

> 1. compile original source code to an intermediate abstract syntax structure (usually as in Abstract Syntax Tree)
> 2. translate the intermediate structure to the computation primitives, distribution primitives and computation abstractions of the Ambients protocol
> 3. generate the bytecode executable from the primitives

`ambc` satisfies requirement #1 by compiling ambients syntax, and JavaScript into an [Abstract Syntax Tree](#abstract-syntax-tree-format). Since this is a lossless encoding, downstream components in the overall system can satisfy requirements #2 and #3 as required.

### Compiler steps

The compiler is very simple, and has only two primary steps:

#### Step 1: Source code -> Ambients syntax

Compile source code from JavaScript (other languages TBD) to Ambient ASCII syntax. For example:

```JavaScript
() => "hello"
```
⬇
```text
func[
  open_|
  string[hello[]]
]|
open func
```

#### Step 2: Ambients Syntax to preliminary Abstract Syntax Tree (AST)

Parse ASCII syntax and output a JSON directed-acyclic-graph (DAG) AST.

```text
func[
  open_|
  string[hello[]]
]|
open func
```
⬇
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

### Supported source languages

- Ambients Syntax
- [JavaScript](https://github.com/aphelionz/js2amb) (WIP)

### Abstract syntax tree format

The JSON AST is intentionally and exceedingly simple. It a recursive structure of nodes that has three fields:

1. `type`: **Required** - the type of the ambient, enum as string. Can be one of:
   - Parallel
   - Serial
   - Group
   - Ambient
   - In_
   - In
   - Out_
   - Open
   - Open_
2. `id`: _Optional_ - a string identifier
3. `children` _Optional_ - array of more child nodes

The idea here is that it is the simplest possible encoding that does not lose any of the data presented in the original ASCII syntax. Once the tree is generated it can be stored as a DAG on any compatible store. In development we simply use the in-memory structures to work with, but in practice we will likely use IPFS or IPLD.

Finally, `ambc` should return a [multihash](https://github.com/multiformats/multihash) from that operation. This hash will be used by the execution engine to run the code on a distributed, peer to peer network.

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
