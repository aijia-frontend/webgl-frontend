
const table = {}

const Dispatch = {
  register: function (type, convert) {
    table[type] = convert
  },

  invoke: function (action, data, options) {
    const type = data.tag || options.tag
    if (!type) throw new Error('未指定类型')

    const convert = table[type]
    if (!convert) throw new Error('未找到处理程序： ' + type)

    const ans = convert[action](data, options)

    if (ans.attrs && ans.attrs.transform) {
      ans.attrs.transform = table['transform'][action](ans.attrs.transform, options)
    }

    return ans
  }
}

export default Dispatch
