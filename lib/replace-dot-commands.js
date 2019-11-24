// If someone uses the existing SSB docs they may try to run a command with
// arguments that look like this:
//
// [
//   '/usr/bin/node',
//   '/usr/bin/ssb-cli',
//   'gossip.peers'
// ]
//
// We want:
//
// [
//   '/usr/bin/node',
//   '/usr/bin/ssb-cli',
//   'gossip',
//   'peers'
// ]
module.exports = (argv) => {
  const preArgs = argv.slice(0, 2)
  const possibleDotCommand = argv[2]
  const postArgs = argv.slice(3)

  const fixedDotCommand = possibleDotCommand != null
    ? possibleDotCommand.split('.')
    : [possibleDotCommand]

  return [...preArgs, ...fixedDotCommand, ...postArgs]
}
