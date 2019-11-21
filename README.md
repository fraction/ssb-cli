# SSB-CLI

**Friendly command-line interface for Secure Scuttlebutt.**

This is a small experimental client for connecting to an SSB server and running
commands. This does *not* start up a new server, so you'll need to already have
one running in the background. See the **See Also** list at the bottom for options.

## Usage

```console
index.js [command]

Commands:
  index.js auth                 asynchronous method
  index.js address              synchronous method
  index.js manifest             synchronous method
  index.js multiserver          group of methods
  index.js get                  asynchronous method
  index.js createFeedStream     streamable source method
  index.js createLogStream      streamable source method
  index.js messagesByType       streamable source method
  index.js createHistoryStream  streamable source method
  index.js createUserStream     streamable source method
  index.js links                streamable source method
  index.js add                  asynchronous method
  index.js publish              asynchronous method
  index.js getAddress           synchronous method
  index.js getLatest            asynchronous method
  index.js latest               streamable source method
  index.js latestSequence       asynchronous method
  index.js whoami               synchronous method
  index.js del                  asynchronous method
  index.js progress             synchronous method
  index.js status               synchronous method
  index.js getVectorClock       asynchronous method
  index.js version              synchronous method
  index.js help                 synchronous method
  index.js seq                  asynchronous method
  index.js usage                synchronous method
  index.js clock                asynchronous method
  index.js replicate            group of methods
  index.js about                group of methods
  index.js blobs                group of methods
  index.js conn                 group of methods
  index.js gossip               group of methods
  index.js connScheduler        group of methods
  index.js ebt                  group of methods
  index.js friends              group of methods
  index.js invite               group of methods
  index.js lan                  group of methods
  index.js query                group of methods

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
```

## Installation

With [npm](https://npmjs.org/):

```shell
npm -g install ssb-cli@latest
```

With [yarn](https://yarnpkg.com/en/):

```shell
yarn global add ssb-cli@latest
```

## Resources

- [Help](https://github.com/fraction/ssb-cli/issues/new)
- [Source Code](https://github.com/fraction/ssb-cli.git)

## See Also

- [Oasis](https://github.com/fraction/oasis)
- [Patchbay](https://github.com/ssbc/patchbay)
- [Patchwork](https://github.com/ssbc/patchwork)
- [SSB-Browser](https://github.com/arj03/ssb-browser-demo)
- [SSB-Server](https://github.com/ssbc/ssb-server)
- [Yap](https://github.com/dominictarr/yap)

## License

AGPL-3.0
