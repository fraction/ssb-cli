const debug = require('debug')('ssb-cli')
const fromEntries = require('fromentries')

// Weird export format, the object has `help` sprinkled around.
//
// - .help.createLogStream
// - .friends.help.isBlocking
// - etc
//
// There's probably a way to fix this but it's Good Enough.
const getUsage = async (api, usage = {}) => {
  const usageEntries = await Promise.all(
    Object.entries(api)
      .filter(([key, value]) =>
        key === 'help' || typeof value === 'object'
      ).map(([key]) =>
        new Promise((resolve, reject) => {
          if (key === 'help') {
            api.help((err, val) => {
              if (err) {
                return reject(err)
              }

              if (Object.entries(val.commands).length) {
                resolve([key, val])
              } else {
                resolve(null)
              }
            })
          } else {
            getUsage(api[key], usage[key]).then((innerUsage) => {
              if (Object.entries(innerUsage).length) {
                resolve([key, innerUsage.help])
              } else {
                resolve(null)
              }
            }).catch((err) => {
              debug(`Error calling  ${key}.help(): %O`, err)
              resolve(null)
            })
          }
        })
      )
  )

  return fromEntries(usageEntries.filter((entry) => entry !== null))
}

module.exports = getUsage
