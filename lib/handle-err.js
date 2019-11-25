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

const createError = (errorObject) => {
  // Handle JSON version of error.
  const newErr = new Error()

  // Using `defineProperty` because otherwise these get logged as JSON.
  Object.defineProperty(newErr, 'name', {
    value: errorObject.name
  })
  Object.defineProperty(newErr, 'message', {
    value: errorObject.message
  })
  Object.defineProperty(newErr, 'stack', {
    value: errorObject.stack
  })

  return newErr
}

module.exports = (exit) => (err) => {
  if (err) {
    if (err.name === 'TypeError' && err.message === commonMessage) {
      console.error(errorMessage.methodUnavailable)
    } else if (err.message === 'could not connect to sbot') {
      console.error(errorMessage.connectionFailed)
    } else {
      if (err instanceof Error) {
        console.error(err)
      } else if ('name' in err && 'message' in err && 'stack' in err) {
        console.error(createError(err))
      } else {
        console.error(new Error(err))
      }
    }
    exit(1)
  }
}
