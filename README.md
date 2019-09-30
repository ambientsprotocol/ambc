# Ambients _(ambients)_

> Peer-to-Peer Programs and Data

## Background

This repository is JavaScript implementation of the ideas in the Ambients Protocol whitepaper. At the moment, it
contains a parser that translates ambient syntax like ` a[in b] | b[in_ a]` to an AST structure that JavaScript can work with.

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
