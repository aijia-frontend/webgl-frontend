const table = {}

const Dispatch = {
  register (type, convert) {
    table[type] = convert
  },

  invoke (action, data, options) {
    var type = data.tag || options.tag
    if (!type) throw new Error('invalid data.')

    var convert = table[type]
    if (!convert) throw new Error('unknown type: ' + type)

    var ans = convert[action](data, options)

    if (ans.attrs && ans.attrs.transform) {
      ans.attrs.transform = table['transform'][action](ans.attrs.transform, options)
    }

    return ans
  }
}

export default Dispatch
