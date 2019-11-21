#!/usr/bin/env node

const pull = require('pull-stream')
const ssbClient = require('ssb-client')
const yargs = require('yargs')

const supportedMuxrpcTypes = [
  'sync',
  'async',
  'source'
]

ssbClient((err, api) => {
  if (err) {
    if (err.message === 'could not connect to sbot') {
      console.log('Oops! It looks like we couldn\'t connect to SSB. This module doesn\'t run a server, so you need to start one in the background.')
      console.log('Currently the simplest way to do this is to open an SSB app or run `ssb-server start`.')
      console.log() // a e s t h e t i c
    }
    throw err
  }
  api.manifest((err, rawManifest) => {
    if (err) throw err
    const emptyDescription = ''

    const prune = (obj, ref) => {
      return Object.entries(obj).map(([key, value]) => {
        if (typeof value === 'string') {
          // LEAF
          if (key in ref && supportedMuxrpcTypes.includes(value)) {
            if (key === 'help') {
              /*
               * This parses muxrpc help text, but it seems too experimental.
               * See also: https://github.com/ssbc/muxrpc/issues/54
               *
               * ref[key]((err, value) => {
               *   if (err) throw err
               *   console.log(value)
               * })
               */
            }
            return [key, value]
          } else {
            return []
          }
        } else if (typeof key === 'string' && typeof value === 'object' && key in ref && ref[key] != null && Object.entries(ref[key]).length > 1) {
          // NODE
          const result = [key, prune(value, ref[key])]
          return result
        } else {
          // FAIL
          return []
        }
      }).reduce((acc, [key, value]) => {
        if (key && value) {
          acc[key] = value
        }

        return acc
      }, {})
    }

    const manifest = prune(rawManifest, api)

    const walk = ([key, value], previous, subYargs) => {
      if (typeof value === 'string') {
        if (supportedMuxrpcTypes.includes(value)) {
          subYargs.command(key, emptyDescription, () => {}, (argv) => {
            const parts = argv._
            const data = parts.reduce((acc, cur) => {
              if (acc !== null && cur in acc.api) {
                acc = { api: acc.api[cur], manifest: acc.manifest[cur] }
              } else {
                acc = null
              }
              return acc
            }, { api, manifest })

            const method = data.api
            const methodType = data.manifest

            if (typeof method === 'function') {
              // Remove CLI-specific arguments.
              delete argv._
              delete argv.$0

              if (methodType === 'source') {
                pull(
                  method(argv),
                  pull.drain((data) => {
                    console.log(JSON.stringify(data, null, 2))
                  }, () => {
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
            } else {
              // Don't remember why (or if) this still happens.
              api.close()
            }
          })
        }
      } else {
        const entries = Object.entries(value)
        // Don't include objects with no entries (like ws).
        if (entries.length > 0) {
          subYargs.command(key, emptyDescription, (subSubYargs) => {
            entries.forEach((entry) =>
              walk(entry, [key, ...previous], subSubYargs)
            )
          }, () => {
            yargs.showHelp()
            yargs.exit(1)
          })
        }
      }
    }

    Object
      .entries(manifest)
      .forEach((entry) =>
        walk(entry, [], yargs)
      )


    // Couldn't get default command to work correctly.
    // If `ssb` is run without arguments, show help and close.
    const argv = yargs.argv
    if ('_' in argv && argv._.length === 0) {
      yargs.showHelp()
      api.close()
      yargs.exit(1)
    }
  })
})
