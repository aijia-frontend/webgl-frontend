import _extend from 'lodash/extend'
import extend from '@/common/extend'
import UUID from '@/common/uuid'
// import SvgRenderer from '@/common/renderTools'
import CST from '@/common/cst/main'
import DataStore from './dataStore'
import Vue from 'vue'
const vue = new Vue()

const Model = function (attrs, options) {
  this.initialize.apply(this, arguments)
}

_extend(Model.prototype, vue, {
  initialize (attrs, options) {
    this.attrs = attrs
    this.options = options
    this.uid = UUID.generate() + '-' + this.type
    this.origin = DataStore.origin
    // this.parent = attrs.parent
    // if (this.parent) this.render()
  },

  getRefEnt (uid) {
    return DataStore.get(uid)
  },

  update (data, options = { silent: false }) {
    this.attrs = Object.assign({}, this.attrs, data)
    if (!options.silent) this.onChange()
  },

  destroy (options = { silent: false }) {
    this._isDestroyed = true
    if (!options.silent) vue.$bus.$emit('modelDestroy', this)
  },

  isDestroy () {
    return this._isDestroyed
  },

  onChange () {
    vue.$bus.$emit('modelChange', this)
  },

  render () {
  },

  toJSON () {
    return CST.toPhysical({
      tag: 'line',
      attrs: {
        x1: this.attrs.x1,
        y1: this.attrs.y1,
        x2: this.attrs.x2,
        y2: this.attrs.y2
      }
    }, { origin: this.origin })
  }
})

Model.extend = extend

export default Model
