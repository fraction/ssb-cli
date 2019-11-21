#!/usr/bin/env node

const yargs = require('yargs')

const ssbClient = require('ssb-client')

const supportedMuxrpcTypes = [
  'sync',
  'async'
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
            const method = parts.reduce((acc, cur) => {
              if (acc !== null && cur in acc) {
                acc = acc[cur]
              } else {
                acc = null
              }
              return acc
            }, api)

            if (typeof method === 'function') {
              // Remove CLI-specific arguments.
              delete argv._
              delete argv.$0

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
            } else {
              yargs.showHelp()
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
          })
        }
      }
    }

    Object.entries(manifest).forEach((entry) => walk(entry, [], yargs))

    yargs.demandCommand()
    yargs.showHelp()
    api.close()
  })
})
