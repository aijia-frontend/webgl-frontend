import { extend as _extend } from 'lodash'
import extend from './extend'
// import Deferred from 'simply-deferred'
import { Deferred as $Deferred } from 'jquery'
import Vue from 'vue'
const vue = new Vue()

const BaseCmd = function (attrs) {
  this._name = attrs.name
  this.defer = new $Deferred()

  this.initialize.apply(this, arguments)
}

_extend(BaseCmd.prototype, {
  initialize () {
  },

  name (v) {
    if (v) this._name = v
    return this._name
  },

  execute () {
    return this.defer.promise()
  },

  cancel () {
    this.onCancel()
  },

  onStart () {
    vue.$bus.$emit('start:' + this.name(), this.name())
    vue.$bus.$emit('start', this)
  },

  onEnd () {
    vue.$bus.$emit('end:' + this.name())
    vue.$bus.$emit('end')
    this.defer.resolve(arguments)
  },

  onCancel () {
    vue.$bus.$emit('cancel:' + this.name())
    vue.$bus.$emit('cancel')
    this.defer.reject(arguments)
  }
})

BaseCmd.extend = extend

export default BaseCmd
