import _extend from 'lodash/extend'
import extend from '@/common/extend'
import UUID from '@/common/uuid'
import SvgRenderer from '@/common/renderTools'
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
    this.uid = UUID.generate()
    this.parent = attrs.parent
    this.origin = DataStore.origin
    if (this.parent) this.render()
  },

  update (data, options = { silent: false }) {
    Object.assign(this.attrs, data)
    if (!options.silent) this.onChange()
  },

  onChange () {
    this.$el.remove()
    this.render()
  },

  render () {
    this.$el = SvgRenderer.render(this.toJSON())
    if (this.parent && this.parent.$el) {
      this.parent.$el.appendChild(this.$el)
    }
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
/* class Model {
  constructor (attrs, options) {
    this.attrs = attrs
    this.options = options
    this.cid = UUID.generate()
  }

  render () {
    this.$el = SvgRenderer.render(this.toJSON())
    this.attrs.el.appendChild(this.$el)
  }

  toJSON () {
    return {
      tag: 'line',
      attrs: {
        x1: 0,
        y1: 0,
        x2: 10000,
        y2: 10000
      }
    }
  }
} */

Model.extend = extend

export default Model
