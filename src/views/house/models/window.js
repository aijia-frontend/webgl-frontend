import Symbol from './symbol'
import _clone from 'lodash/clone'

const Window = Symbol.extend({
  initialize () {
    this.type = 'window'
    Symbol.prototype.initialize.apply(this, arguments)
  },

  getPositioin () {
    return _clone(this.attrs.position)
  }
})

Window.type = 'window'

export default Window
