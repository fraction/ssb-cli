const debug = require('debug')('ssb-cli')

const typeDictionary = {
  FeedId: 'string',
  MessageId: 'string',
  BlobId: 'string'
}

const supportedTypes = [
  'array',
  'boolean',
  'number',
  'string'
]

const capitalize = (str) => {
  if (str == null || str.length === 0) {
    return str
  } else {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
}

module.exports = (option) => {
  const definition = {}

  definition.describe = capitalize(option.description)

  if (option.type) {
    if (supportedTypes.includes(option.type)) {
      definition.type = option.type
    } else {
      if (option.type in typeDictionary) {
        definition.type = typeDictionary[option.type]
      } else {
        const typeMatch = supportedTypes.find((typeAttempt) => {
          option.type.endsWith(capitalize(typeAttempt))
        })

        if (typeMatch !== null) {
          definition.type = typeMatch
        } else {
          debug('Missing type definition: %s', option.type)
        }
      }
      definition.describe = `${definition.describe} (${option.type})`
    }
  }

  definition.default = option.default
  definition.required = option.optional === false

  return definition
}
