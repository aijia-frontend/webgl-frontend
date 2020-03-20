import { extend as _extend, bind as _bind, isFunction as _isFunction, throttle as _throttle } from 'lodash'
import extend from './extend.js'
import * as $ from 'jquery'
import Vue from 'vue'
const vue = new Vue()

const eventNameSpace = '.custom-Hard'

const BaseJig = function (attrs, options) {
  this.canvas = attrs.canvas
  this.data = null
  this.preview = null

  this.initialize.apply(this, arguments)
}

_extend(BaseJig.prototype, vue, {
  pageEvents: {
    // keydown
  },

  events: {
    // pointerdown
    // mousemove
    // pointerup
    // click
  },

  initialize: function () {
    this.bindEvents($(document.documentElement), this.pageEvents) // 页面 pageEvents
    this.bindEvents($(this.canvas), this.events) // 画布 events
  },

  prepare: function () {},

  update: function () {},

  start: function () {
    this.prepare()
    if (this.onMouseMove) this.onMouseMove = _throttle(this.onMouseMove, 1000)
    this.$emit('start', this)
  },

  cancel: function () {
    this.cleanup()
    this.$emit('cancel', null)
  },

  end: function () {
    const data = this.data
    this.cleanup()
    this.$emit('end', data)
  },

  cleanup: function () {
    this.unbindAllEvents()
    this.remPreview()
    this.data = null
    this.canvas = null
  },

  unbindAllEvents: function () {
    this.unbindEvents($(document.documentElement), this.pageEvents) // pageEvents
    if (this.canvas) {
      this.unbindEvents($(this.canvas), this.events) // events
    }
  },

  unbindEvents: function (target) {
    target.off(eventNameSpace)
  },

  bindEvents: function (target, events) {
    this.unbindEvents(target, events)

    for (const key in events) {
      let method = events[key]
      if (!_isFunction(method)) method = this[method]
      if (!method) continue
      method = _bind(method, this)
      target.on(key + eventNameSpace, method)
    }
  },

  remPreview: function () {
    if (this.container) this.container.destroy()
  }
})

BaseJig.extend = extend

export default BaseJig
