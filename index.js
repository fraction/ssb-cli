#!/usr/bin/env node

const pull = require('pull-stream')
const ssbClient = require('ssb-client')
const yargs = require('yargs')
const debug = require('debug')('ssb-client')

const pruneManifest = require('./lib/prune-manifest')
const getUsage = require('./lib/get-usage')

let handled = false

const getMethod = (api, parts) => parts.reduce((acc, cur) => {
  if (acc !== null && cur in acc) {
    acc = acc[cur]
  } else {
    acc = null
  }
  return acc
}, api)

const supportedTypes = [
  'array',
  'boolean',
  'number',
  'string'
]

const typeDictionary = {
  FeedId: 'string',
  MessageId: 'string',
  SequenceNumber: 'number',
  BlobId: 'string'
}

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)

const createGetCommandUsage = (usage) => (parts) => {
  const unknown = {
    description: ''
  }

  // Silly hack to fix how usage is output.
  // The top-level commands are:
  //
  //   usage.help.commands.createHistoryStream()
  //
  // Others are:
  //
  //   usage.friends.block()
  if (parts.length === 1) {
    parts = ['help', parts[0]]
  }

  return parts.reduce((acc, cur, idx) => {
    if (idx === parts.length - 1) {
      if ('commands' in acc && cur in acc.commands) {
        acc = acc.commands[cur]
      } else {
        acc = unknown
      }
    } else {
      if (cur in acc) {
        acc = acc[cur]
      }
    }

    return acc
  }, usage)
}

// Connect to an SSB service on the standard host and port (localhost + 8008).
ssbClient((err, api) => {
  if (err) {
    if (err.message === 'could not connect to sbot') {
      console.log('Oops! It looks like we couldn\'t connect to SSB. This module doesn\'t run a server, so you need to start one in the background.')
      console.log('Currently the simplest way to do this is to open an SSB app or run `ssb-server start`.')
      console.log() // a e s t h e t i c
      yargs.exit(1)
    } else {
      throw err
    }
  }

  // Get the manifest from the server, which, strangely, exports methods we don't have access to.
  api.manifest(async (err, rawManifest) => {
    if (err) throw err

    const manifest = pruneManifest(rawManifest, api)
    const usage = await getUsage(api)
    const getCommandUsage = createGetCommandUsage(usage)

    // Now we want to add commands for each of the muxrpc methods above.
    // There are two types of "commands" we're adding:
    //
    // - Actual commands: these are sync/async/source methods that do something
    // - Groups: these are actually objects that encapsulate muxrpc methods, and
    //           if these are called we should just call `yargs.showHelp()`.
    const walk = ([key, value], previous, subYargs) => {
      if (typeof value === 'string') {
        const u = getCommandUsage([...previous, key])
        subYargs
          .command(key, `${capitalize(u.description)} (${value})`, (builder) => {
            if (typeof u.args === 'object') {
              debug('%O', u.args)
              Object.entries(u.args).forEach(([key, value]) => {
                const definition = {}

                definition.describe = capitalize(value.description)

                if (value.type) {
                  if (supportedTypes.includes(value.type)) {
                    definition.type = value.type
                  } else {
                    if (value.type in typeDictionary) {
                      definition.type = typeDictionary[value.type]
                    } else {
                      debug('Missing type definition: %s', value.type)
                    }
                    definition.describe = `${definition.describe} (${value.type})`
                  }
                }

                definition.default = value.default
                definition.required = value.optional === false

                builder.option(key, definition)
              })
            }
          }, (argv) => {
            handled = true

            const method = getMethod(api, argv._)
            const methodType = value

            const options = JSON.parse(JSON.stringify(argv._))
            delete options._
            delete options.$0

            // Remove CLI-specific arguments.
            // Maybe we should be making a copy instead of mutating the object...
            if (methodType === 'source') {
              pull(
                method(options),
                pull.drain((data) => {
                  console.log(JSON.stringify(data, null, 2))
                }, () => {
                // When we're done with the stream, close it!
                  api.close()
                })
              )
            } else {
              method(options, (err, val) => {
                const commonMessage = 'Cannot read property \'apply\' of undefined'
                if (err) {
                  if (err.name === 'TypeError' && err.message === commonMessage) {
                    console.log('Oops! It looks like this method is advertised over muxrpc but not actually available on the server.')
                    console.log('Let a developer know about this problem and someone will fix it immediately.')
                    yargs.exit(1)
                  } else {
                    throw err
                  }
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

        subYargs.command(key, '(group)', (subSubYargs) => {
          entries.filter(([key]) => key !== 'help').forEach((entry) =>
            walk(entry, [key, ...previous], subSubYargs)
          )
        }, () => {
          handled = true
          yargs.showHelp()
          yargs.exit(1)
        })
      }
    }

    // Create the commands!
    Object
      .entries(manifest)
      .filter(([key]) => key !== 'help')
      .forEach((entry) =>
        walk(entry, [], yargs)
      )

    // This is magical and seems to start yargs.
    yargs.argv // eslint-disable-line

    // Couldn't get default command to work correctly.
    // If `ssb` is run without arguments, show help and close.
    if (handled === false) {
      yargs.showHelp()
      api.close()
    }
  })
})
