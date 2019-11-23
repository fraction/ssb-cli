module.exports = (usage) => (parts) => {
  const unknown = {
    description: ''
  }

  // Silly hack to fix how usage is output.
  // The top-level commands are:
  //
  //   usage.help.commands.createHistoryStream()
  //
  // Others are:
  //
  //   usage.friends.block()
  if (parts.length === 1) {
    parts = ['help', parts[0]]
  }

  return parts.reduce((acc, cur, idx) => {
    if (idx === parts.length - 1) {
      if ('commands' in acc && cur in acc.commands) {
        acc = acc.commands[cur]
      } else {
        acc = unknown
      }
    } else {
      if (cur in acc) {
        acc = acc[cur]
      }
    }

    return acc
  }, usage)
}
