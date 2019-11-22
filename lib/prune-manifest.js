// TODO: Use Object.fromEntries() once Node 10 support is over
const fromEntries = require('fromentries')

const supportedMuxrpcTypes = [
  'sync',
  'async',
  'source'
]

const mapEntries = (obj, map) =>
  fromEntries(
    Object.entries(obj)
      .map(map)
      .filter(entry =>
        entry !== null
      )
  )

// Sometimes the manifest file we get comes with methods we can't run.
// See also: https://github.com/ssbc/muxrpc/issues/55
//
// This method recursively prunes the manifest to remove methods that
// we can't actually access. I'm sure there's a better way to do this.
const prune = (obj, api) =>
  mapEntries(obj, ([key, value]) => {
    const isMethod =
      typeof value === 'string' &&
      key in api &&
      supportedMuxrpcTypes.includes(value)

    const isGroup =
      typeof key === 'string' &&
      typeof value === 'object' &&
      Object.entries(value).length > 1 &&
      key in api &&
      typeof api[key] === 'object' &&
      Object.entries(api[key]).length > 1

    if (isMethod) {
      // Any code that falls into this condition is like: ["whoami", "sync"]
      // These are methods that we'll be able to call without any problems.
      return [key, value]
    } else if (isGroup) {
      // Objects are the only things that pass this condition. Like: [ "blobs": { "add": "sync", "ls", "async" ]
      // We want to recursively prune these objects.
      return [
        key,
        prune(value, api[key]) // Recursion!
      ]
    } else {
      // Neither a valid method or group, we don't want it.
      return null
    }
  })

module.exports = prune
