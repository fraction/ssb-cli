#!/usr/bin/env node

const pull = require('pull-stream')
const ssbClient = require('ssb-client')
const yargs = require('yargs')

const supportedMuxrpcTypes = [
  'sync',
  'async',
  'source'
]

const dictionary = {
  'sync': 'synchronous method',
  'async': 'asynchronous method',
  'source': 'streamable source method'
}

let handled = false

// Connect to an SSB service on the standard host and port (localhost + 8008).
ssbClient((err, api) => {
  if (err) {
    if (err.message === 'could not connect to sbot') {
      console.log('Oops! It looks like we couldn\'t connect to SSB. This module doesn\'t run a server, so you need to start one in the background.')
      console.log('Currently the simplest way to do this is to open an SSB app or run `ssb-server start`.')
      console.log() // a e s t h e t i c
    }
    throw err
  }

  // Get the manifest from the server, which, strangely, exports methods we don't have access to.
  api.manifest((err, rawManifest) => {
    if (err) throw err

    // Sometimes the manifest file we get comes with methods we can't run.
    // See also: https://github.com/ssbc/muxrpc/issues/55
    //
    // This method recursively prunes the manifest to remove methods that
    // we can't actually access. I'm sure there's a better way to do this.
    const prune = (obj, ref) => {
      return Object.entries(obj).map(([key, value]) => {
        if (typeof value === 'string') {
          // Method!
          // Any code that falls into this condition is like: ["whoami", "sync"]
          if (key in ref && supportedMuxrpcTypes.includes(value)) {
            if (key === 'help') {
              /*
               * This parses muxrpc help text, but it seems too experimental.
               * See also: https://github.com/ssbc/muxrpc/issues/54
               *
               *     ref[key]((err, value) => {
               *       if (err) throw err
               *       console.log(value)
               *     })
               *
               * Maybe later we can add this back? Or maybe the help() will get
               * standardized so we don't have to call the method repeatedly.
               */
            }

            // This method is good to go, we can run it just fine.
            return [key, value]
          } else {
            // This method doesn't exist in our local API. Prune it!
            return []
          }
        } else if (typeof key === 'string' && typeof value === 'object' && key in ref && ref[key] != null && Object.entries(ref[key]).length > 1) {
          // Objects are the only things that pass this condition. Like: [ "blobs": { "add": "sync", "ls", "async" ]
          // We want to recursively prune these objects.
          const result = [key, prune(value, ref[key])]
          return result
        } else {
          // FAIL
          return []
        }
      }).reduce((acc, [key, value]) => {
        // This takes our entries and zip them back up into an object.
        if (key && value) {
          acc[key] = value
        }

        return acc
      }, {})
    }

    const manifest = prune(rawManifest, api)

    // Now we want to add commands for each of the muxrpc methods above.
    // There are two types of "commands" we're adding:
    //
    // - Actual commands: these are sync/async/source methods that do something
    // - Groups: these are actually objects that encapsulate muxrpc methods, and
    //           if these are called we should just call `yargs.showHelp()`.
    const walk = ([key, value], previous, subYargs) => {
      if (typeof value === 'string') {
        subYargs.command(key, dictionary[value], () => {}, (argv) => {
          handled = true

          const parts = argv._

          // We need to get the actual method from the API object plus the manifest.
          const data = parts.reduce((acc, cur) => {
            if (acc !== null && cur in acc.api) {
              acc = { api: acc.api[cur], manifest: acc.manifest[cur] }
            } else {
              acc = null
            }
            return acc
          }, { api, manifest })

          const method = data.api

          // Maybe this could be replaced with `value`?
          // It would definitely clean up the `reduce()` above.
          const methodType = data.manifest

          // Remove CLI-specific arguments.
          // Maybe we should be making a copy instead of mutating the object...
          delete argv._
          delete argv.$0

          if (methodType === 'source') {
            pull(
              method(argv),
              pull.drain((data) => {
                console.log(JSON.stringify(data, null, 2))
              }, () => {
                // When we're done with the stream, close it!
                api.close()
              })
            )
          } else {
            method(argv, (err, val) => {
              const commonMessage = 'Cannot read property \'apply\' of undefined'
              if (err) {
                if (err.name === 'TypeError' && err.message === commonMessage) {
                  console.log('Oops! It looks like this method is advertised over muxrpc but not actually available on the server.')
                  console.log('Let a developer know about this problem and someone will fix it immediately.')
                }
                throw err
              }

              console.log(JSON.stringify(val, null, 2))
              api.close()
            })
          }
        })
      } else {
        // This is actually a group of commands (or, and "object" in JS lingo).
        // If someone tries to call this command, we show the help text and exit.
        //
        // You really aren't supposed to call these commands, but they make for
        // a really great help-text experience so it's important to make them useful.

        const entries = Object.entries(value)

        // Don't include objects with no entries (like ws).
        // NOTE: I think this is handled elsewhere. Maybe we can remove this length check?
        if (entries.length > 0) {
          subYargs.command(key, 'group of methods', (subSubYargs) => {
            entries.forEach((entry) =>
              walk(entry, [key, ...previous], subSubYargs)
            )
          }, () => {
            handled = true
            yargs.showHelp()
            yargs.exit(1)
          })
        }
      }
    }


    // Create the commands!
    Object
      .entries(manifest)
      .forEach((entry) =>
        walk(entry, [], yargs)
      )

    // This is magical and seems to start yargs.
    yargs.argv

    // Couldn't get default command to work correctly.
    // If `ssb` is run without arguments, show help and close.
    if (handled === false) {
      yargs.showHelp()
      api.close()
      yargs.exit(1)
    }
  })
})
