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
    } else if (err.message === 'could not connect to sbot') {
      console.log(errorMessage.connectionFailed)
    } else {
      if (err instanceof Error) {
        console.log('throwing')
        console.error(err)
      } else if ('name' in err && 'message' in err && 'stack' in err) {
        // Handle JSON version of error.
        const newErr = new Error()

        // Using `defineProperty` because otherwise these get logged as JSON.
        Object.defineProperty(newErr, 'name', {
          value: err.name
        })
        Object.defineProperty(newErr, 'message', {
          value: err.message
        })
        Object.defineProperty(newErr, 'stack', {
          value: err.stack
        })

        console.error(newErr)
      } else {
        console.error(new Error(err))
      }
    }
    exit(1)
  } else {
    console.log('no err')
  }
}
