# SSB-CLI

**Friendly command-line interface for interacting with Secure Scuttlebutt.**

This is a small experimental client for connecting to an SSB server and running
commands. This does *not* start up a new server, so you'll need to already have
one running in the background. See the **See Also** list at the bottom for options.

## Usage

```console
$ ssb --help
ssb <command>

Commands:
  ssb auth
  ssb address
  ssb manifest
  ssb multiserver
  ssb get
  ssb createFeedStream
  ssb createLogStream
  ssb messagesByType
  ssb createHistoryStream
  ssb createUserStream
  ssb links
  ssb add
  ssb publish
  ssb getAddress
  ssb getLatest
  ssb latest
  ssb latestSequence
  ssb whoami
  ssb del
  ssb progress
  ssb status
  ssb getVectorClock
  ssb version
  ssb help
  ssb seq
  ssb usage
  ssb clock
  ssb replicate
  ssb about
  ssb blobs
  ssb gossip
  ssb invite
  ssb query

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

- [Help](https://github.com/fraction/oasis/issues/new)
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
