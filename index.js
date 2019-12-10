#!/usr/bin/env node

// HACK: Fix `process.argv` to replace dots with spaces.
const replaceDotCommands = require('./lib/replace-dot-commands')
process.argv = replaceDotCommands(process.argv)

const debug = require('debug')('ssb-cli')
const lodash = require('lodash')
const pull = require('pull-stream')
const ssbClient = require('ssb-client')
const yargs = require('yargs')
const yargsParser = require('yargs-parser')
const { promisify } = require('util')

const createUsageGetter = require('./lib/create-usage-getter')
const defineCommand = require('./lib/define-command')
const getUsage = require('./lib/get-usage')
const handleError = require('./lib/handle-err')(yargs.exit)
const pruneManifest = require('./lib/prune-manifest')

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)
const outputAsJSON = (data) => console.log(JSON.stringify(data, null, 2))

const getNormalizedEntries = (obj) =>
  Object.entries(obj)
    .filter(([key]) => key !== 'help')
    .sort(([aKey], [bKey]) => aKey.localeCompare(bKey))

// HACK: The regular `yargs` module doesn't let us have asynchronous builders,
// so we don't have an elegant way of taking --host and --port into account
// before calling SSB-Client. Instead, we're forced to use the Yargs-Parser to
// check the --host and --port flags so that we can use them with SSB-Client.
var { host, port } = yargsParser(process.argv.slice(2))

// Connect to an SSB service on the standard host and port (localhost + 8008).
promisify(ssbClient)({ host, port }).then((api) => {
  const showHelpAndClose = (code) => {
    yargs.showHelp()
    api.close()
    yargs.exit(code)
  }

  // Get the manifest from the server, which, strangely, exports methods we don't have access to.
  promisify(api.manifest)().then(async (rawManifest) => {
    const manifest = pruneManifest(rawManifest, api)
    const usage = await getUsage(api)
    const getCommandUsage = createUsageGetter(usage)
    const getGroupUsage = (parts) => lodash.get(usage, parts, {
      description: ''
    })

    // Now we want to add commands for each of the muxrpc methods above.
    // There are two types of "commands" we're adding:
    //
    // - Actual commands: these are sync/async/source methods that do something
    // - Groups: these are actually objects that encapsulate muxrpc methods, and
    //           if these are called we should just call `yargs.showHelp()`.
    const walk = ([key, value], previous, subYargs) => {
      if (typeof value === 'object') {
        // Group of commands. It should show the help text and then exit.
        // If someone tries to call this command, we show the help text and exit.
        const groupUsage = getGroupUsage([...previous, key])
        const description = `${capitalize(groupUsage.description)} (group)`

        subYargs.command(
          key,
          description,
          (subSubYargs) => {
            getNormalizedEntries(value).forEach((entry) =>
              walk(entry, [key, ...previous], subSubYargs)
            )
          },
          () => showHelpAndClose(1)
        )
      } else if (typeof value === 'string') {
        const methodType = value

        const commandUsage = getCommandUsage([...previous, key])
        const description = `${capitalize(commandUsage.description)} (${methodType})`

        subYargs.command(
          key,
          description,
          (builder) => {
            if (typeof commandUsage.args === 'object') {
              debug('%O', commandUsage.args)
              getNormalizedEntries(commandUsage.args).forEach(([key, value]) => {
                // Parse muxrpc-usage info and add yargs options
                const definition = defineCommand(value)
                builder.option(key, definition)
              })
            }
          }, (argv) => {
            const positionalInputArray = argv._.slice(previous.length + 1)
            const positionalInput = positionalInputArray.length > 1
              ? positionalInputArray.join(' ')
              : positionalInputArray[0]

            const hasPositionalInput = positionalInputArray.length

            const flagInput = JSON.parse(JSON.stringify(argv))
            delete flagInput._
            delete flagInput.$0
            const hasFlagInput = Object.entries(flagInput).length

            debug('%O', { positionalInput, flagInput })

            const method = lodash.get(api, [...previous, key], null)

            if (method === null) {
              debug('Method does not exist')
              showHelpAndClose(1)
              return
            }

            if (hasPositionalInput && hasFlagInput) {
              handleError(new Error('You must provide positional arguments or --flag arguments, not both.'))
            }

            const input = hasPositionalInput ? positionalInput : flagInput

            // Remove yargs-specific CLI options and pass the rest to the method.

            debug('Method input: %O', input)
            // Remove CLI-specific arguments.
            // Maybe we should be making a copy instead of mutating the object...
            if (methodType === 'source') {
              pull(
                method(input),
                pull.drain(outputAsJSON, api.close)
              )
            } else if (methodType === 'sync' || methodType === 'async') {
              promisify(method)(input)
                .then((value) => {
                  outputAsJSON(value)
                  api.close()
                }).catch((err) => {
                  handleError(err)
                })
            } else {
              // This should never happen because we should be pruning method
              // types that we don't support in `pruneManifest()`.
              throw new Error(`Unsupported method type: ${methodType}`)
            }
          })
      } else {
        debug('Unknown type "%s": %O', key, value)
      }
    }

    yargs
      .scriptName('ssb')
      .option('host', {
        description: 'Destination hostname of SSB service',
        type: 'string'
      })
      .option('port', {
        description: 'Destination port of SSB service',
        type: 'number'
      })
      .command('*', 'Friendly command-line interface for Secure Scuttlebutt', () => {
        getNormalizedEntries(manifest).forEach((entry) =>
          walk(entry, [], yargs)
        )
      }, (argv) => {
        yargs.showHelp()
        api.close()

        if (argv._.length > 0) {
          // Use was actually trying to do something. Maybe a typo?
          yargs.exit(1)
        }
      })

    // This is magical and seems to start yargs.
    yargs.argv // eslint-disable-line
  }).catch(handleError)
}).catch(handleError)
