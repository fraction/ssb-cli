# SSB-CLI

**Friendly command-line interface for Secure Scuttlebutt.**

This is a small experimental client that connects to an existing SSB service
and runs commands over [MuxRPC][muxrpc]. All usage information is generated
dynamically from the [MuxRPC-Usage][muxrpc-usage] format and passed to the 
command-line interface via [Yargs][yargs].

**Status:** Alpha. Please reach out to share feedback and suggestions!

## Usage

Run commands from your terminal without having to open a client.

```console
$ ssb publish --type test --text "hello world"
{
  "key": "%KVBHyC5czt9LRXx6rEcH9ha+A4V0VjqwLx10pwjG540=.sha256",
  "value": {
    "previous": "%Z8WnF3ai0px5ZXjH2LmMWTTj3iRcckHutED0YCuUGCI=.sha256",
    "sequence": 13245,
    "author": "@+oaWWDs8g73EZFUMfW37R/ULtFEjwKN/DczvdYihjbU=.ed25519",
    "timestamp": 1574533688644,
    "hash": "sha256",
    "content": {
      "type": "test",
      "text": "hello world"
    },
    "signature": "2aZ+jaGr+faIIedowj0PFyDnO7mmaA5CvCdYXMoyMWGnHTyp4k6eVaFOhN+0ZH/0OmTnACK3hu2aF5zwYr/+Ag==.sig.ed25519"
  },
  "timestamp": 1574533688646
}
```

If you make a mistake, you should get a helpful error message with usage info.

```console
$ ssb-server createHistoryStream
ssb createHistoryStream

Output messages from a feed in order (source)

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
  --id       A ssb feed identity (FeedId)                    [string] [required]
  --keys     Include keys                                              [boolean]
  --limit    Max number of messages to output                           [number]
  --seq      Sequence number to stream from (SequenceNumber)            [number]
  --values   Include values                                            [boolean]

Missing required argument: id
```

Append `help` or `--help` to any command to see more information.

## Installation

With [npm](https://npmjs.org/):

```shell
npm -g install ssb-cli@latest
```

With [yarn](https://yarnpkg.com/en/):

```shell
yarn global add ssb-cli@latest
```

You'll need an SSB service running for ssb-cli to connect to. Try one of these:

- [Oasis](https://github.com/fraction/oasis)
- [Patchbay](https://github.com/ssbc/patchbay)
- [Patchwork](https://github.com/ssbc/patchwork)
- [SSB-Server](https://github.com/ssbc/ssb-server)

## Resources

- [Help](https://github.com/fraction/ssb-cli/issues/new)
- [Source Code](https://github.com/fraction/ssb-cli.git)

## See Also

- [MuxRPCLI](https://github.com/ssbc/muxrpcli)
- [SSB-Client-CLI](https://github.com/qypea/ssb-client-cli)

## License

AGPL-3.0

[muxrpc]: https://github.com/ssbc/muxrpc
[muxrpc-usage]: https://github.com/ssbc/muxrpc-usage
[yargs]: https://github.com/yargs/yargs
