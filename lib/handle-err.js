const commonMessage = 'Cannot read property \'apply\' of undefined'

const errorMessage = {
  methodUnavailable: `
Oops! It looks like this method is advertised over muxrpc but not actually available on the server.

Let a developer know about this problem and someone will fix it immediately.
`,
  connectionFailed: `
Oops! It looks like we couldn't connect to SSB. This module doesn't run a server, so you need to start one in the background.

Currently the simplest way to do this is to open an SSB app or run \`ssb-server start\`.
`
}

module.exports = (exit) => (err) => {
  if (err) {
    if (err.name === 'TypeError' && err.message === commonMessage) {
      console.log(errorMessage.methodUnavailable)
      exit(1)
    } else if (err.message === 'could not connect to sbot') {
      console.log(errorMessage.connectionFailed)
      exit(1)
    } else {
      throw err
    }
  }
}
