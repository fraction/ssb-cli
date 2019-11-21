# SSB-CLI

**Friendly command-line interface for interacting with Secure Scuttlebutt.**

This is a small experimental client for connecting to an SSB server and running
commands. This does *not* start up a new server, so you'll need to already have
one running in the background. See the **See Also** list at the bottom for options.

## Usage

```console
$ ssb-cli --help
ssb-cli <command>

Commands:
  ssb-cli auth
  ssb-cli address
  ssb-cli manifest
  ssb-cli multiserver
  ssb-cli get
  ssb-cli add
  ssb-cli publish
  ssb-cli getAddress
  ssb-cli getLatest
  ssb-cli latestSequence
  ssb-cli whoami
  ssb-cli del
  ssb-cli progress
  ssb-cli status
  ssb-cli getVectorClock
  ssb-cli version
  ssb-cli help
  ssb-cli seq
  ssb-cli usage
  ssb-cli clock
  ssb-cli replicate
  ssb-cli about
  ssb-cli blobs
  ssb-cli gossip
  ssb-cli invite
  ssb-cli query

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
