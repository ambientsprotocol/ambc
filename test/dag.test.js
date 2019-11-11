const assert = require('assert')
const IPFS = require('ipfs')
const io = require('orbit-db-io')
const CID = require('cids')
const multihash = require('multihashes')

const { ambients } = require('../src')
const fs = require('fs')

const PARSER_FIXTURES_PATH = 'test/fixtures/parser/'
const fixtures = fs.readdirSync(PARSER_FIXTURES_PATH)

describe('DAG', function () {
  let ipfs, cid

  before(async () => {
    ipfs = await IPFS.create()
    const syntax = fs.readFileSync(PARSER_FIXTURES_PATH + fixtures[6])
    const result = ambients.parse(syntax.toString())
    const hash = await io.write(ipfs, 'dag-cbor', result)
    assert.strictEqual(hash, 'zdpuAzo5YJPXi4ToJfY9Nfdx51JnYQ8R8PSQaiLrQ8tW3j211')
    cid = new CID(hash)
  })

  it('outputs an IPLD CBOR CID', async () => {
    multihash.validate(cid.multihash)
    assert.strictEqual(cid.version, 1)
    assert.strictEqual(cid.codec, 'dag-cbor')
    assert.strictEqual(cid.multibaseName, 'base58btc')
  })

  const dagStruct = (value) => { return { remainderPath: '', value: value } }

  it('can traverse the AST via DAG', async () => {
    assert.deepStrictEqual((await ipfs.dag.get(cid, 'name')), dagStruct(''))
    assert.deepStrictEqual((await ipfs.dag.get(cid, 'capabilities')), dagStruct([]))
    assert.deepStrictEqual((await ipfs.dag.get(cid, 'create')), dagStruct([]))
    assert.deepStrictEqual((await ipfs.dag.get(cid, 'children/0/children/0/capabilities')),
      dagStruct([{
        next: null,
        op: 'out',
        target: 'b'
      }]))
  })

  it('can traverse the DAG tree', async () => {
    const tree = [
      'name',
      'create',
      'children',
      'children/0',
      'children/0/name',
      'children/0/create',
      'children/0/children',
      'children/0/children/0',
      'children/0/children/0/name',
      'children/0/children/0/create',
      'children/0/children/0/children',
      'children/0/children/0/capabilities',
      'children/0/children/0/capabilities/0',
      'children/0/children/0/capabilities/0/op',
      'children/0/children/0/capabilities/0/next',
      'children/0/children/0/capabilities/0/target',
      'children/0/capabilities',
      'children/0/capabilities/0',
      'children/0/capabilities/0/op',
      'children/0/capabilities/0/next',
      'children/0/capabilities/0/target',
      'capabilities'
    ]
    assert.deepStrictEqual((await ipfs.dag.tree(cid)), tree)
  })

  after(async () => {
    await ipfs.stop()
  })
})
