const test = require('tape')
const pruneManifest = require('./lib/prune-manifest')
const replaceDotCommands = require('./lib/replace-dot-commands')
const getUsage = require('./lib/get-usage')

const f = () => {}
test('basic sanity tests', async (t) => {
  const api = {
    help: (cb) => cb(null, {
      description: 'some fake API',
      commands: {
        a: {
          type: 'string',
          description: 'a',
          optional: true
        },
        b: {
          type: 'someNumber',
          description: 'b',
          optional: false
        },
        c: {
          description: 'c'
        }
      }
    }),
    a: f,
    b: f,
    c: {
      help: (cb) => cb(null, {
        description: 'deep fake API',
        commands: {
          a: {
            type: 'messageId',
            description: 'A'
          },
          b: {
            type: 'boolean',
            description: 'B',
            optional: true,
            default: true
          },
          c: {
            description: 'C',
            optional: false
          }
        }
      }),
      a: f,
      b: f,
      c: f,
      d: {
        a: f,
        b: f,
        c: {
          // Single-method group
          a: f
        }
      }
    },
    // Method only exists in API
    d: f,
    // Group only exists in API
    e: {
      a: f,
      b: f
    },
    // Empty group
    f: {}
  }

  const manifest = {
    a: 'sync',
    b: 'async',
    c: {
      a: 'source',
      b: 'duplex', // Unsupported real MuxRPC method type
      c: 'example', // Unsupported fake MuxRPC method type
      d: {
        a: 'sync',
        b: 'async',
        c: {
          a: 'source'
        },
        // Method only exists in manifest
        d: 'source',
        // Group only exists in manifest
        e: {
          a: f
        }
      }
    }
  }

  const expected = {
    a: 'sync',
    b: 'async',
    c: {
      a: 'source',
      d: {
        a: 'sync',
        b: 'async',
        c: {
          a: 'source'
        }
      }
    }
  }

  const actual = pruneManifest(manifest, api)
  t.deepEqual(expected, actual, 'pruned manifest is correct')

  const expectedUsage = {
    help: {
      description: 'some fake API',
      commands: {
        a: {
          type: 'string',
          description: 'a',
          optional: true
        },
        b: {
          type: 'someNumber',
          description: 'b',
          optional: false
        },
        c: {
          description: 'c'
        }
      }
    },
    c: {
      description: 'deep fake API',
      commands: {
        a: {
          type: 'messageId',
          description: 'A'
        },
        b: {
          type: 'boolean',
          description: 'B',
          optional: true,
          default: true
        },
        c: {
          description: 'C',
          optional: false
        }
      }
    }
  }

  const usage = await getUsage(api)

  t.deepEqual(expectedUsage, usage, 'correct usage parsing')

  t.end()
})

test('support dot commands', (t) => {
  const input = [
    '/usr/bin/node',
    '/usr/bin/ssb-cli',
    'gossip.peers'
  ]

  const expected = [
    '/usr/bin/node',
    '/usr/bin/ssb-cli',
    'gossip',
    'peers'
  ]

  const output = replaceDotCommands(input)

  t.deepEqual(output, expected, 'dot commands replaced')
  t.end()
})

test('don\'t replace non-dot commands', (t) => {
  const input = [
    '/usr/bin/node',
    '/usr/bin/ssb-cli',
    'gossip',
    'peers'
  ]

  const output = replaceDotCommands(input)

  t.deepEqual(output, input, 'regular commands not touched')
  t.end()
})
