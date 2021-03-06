import BaseJig from '@/common/baseJig'
import CST from '@/common/cst/main'
import DataStore from '../models/dataStore'
import Snap from '../snap/main'
import Vue from 'vue'
const vue = new Vue()

const cancelBubble = function (e) {
  window.event ? window.event.cancelBubble = true : e.stopPropagation()
}

const stopDefault = function (e) {
  if (e && e.preventDefault) { e.preventDefault() } else { window.event.returnValue = false }
  return false
}

const Jig = BaseJig.extend({
  pageEvents: {
    'keyup': 'onKeyUp'
  },

  events: {
    'click': 'onClick',
    'contextmenu': 'onRightClick',
    'mousedown': 'onMouseDown',
    'mousemove': 'onMouseMove',
    'mouseup': 'onMouseUp'
  },

  point2Physical (pt) {
    return CST.toPhysical(pt, {
      tag: 'point',
      origin: DataStore.origin
    })
  },

  initialize (attrs, options) {
    this.attrs = attrs
    this.options = options
    this.drawing = attrs.drawing
    this.data = {}
    this.dataStore = DataStore
    this.tf = this.drawing.transform().clone()
    BaseJig.prototype.initialize.apply(this, arguments)
  },

  start () {
    BaseJig.prototype.start.apply(this, arguments)
  },

  prepare () {},

  cleanup () {
    vue.$bus.$emit('posContent', 0)
    Snap.reset({ func: 'reset' })
    BaseJig.prototype.cleanup.apply(this, arguments)
  },

  onKeyUp (e) {
    const code = e.charCode ? e.charCode : e.keyCode
    switch (code) {
      case 27:
        // cancel
        this.cancel()
        break
      default:
        break
    }
  },

  onClick () {},
  onRightClick (e) {
    cancelBubble()
    stopDefault()
  },

  onMouseDown (e) {
    if (e.button === 2) {
      this.pan = true
      this.panStartT = new Date().getTime()
      this.panStart = this.getPosInView(e)
      this.drawing.setCursor('pan')
      this.tf = this.drawing.transform().clone()
    }
  },

  onMouseMove (e) {
    if (this.pan && this.panStart) {
      const time = new Date().getTime()
      if (time - this.panStartT <= 100) return
      this.isMove = true
      const pos = this.getPosInView(e)
      const offset = {
        x: pos.x - this.panStart.x,
        y: pos.y - this.panStart.y
      }
      const tf = this.tf.clone()
      tf.translate(offset.x, offset.y)
      this.drawing.transform(tf)
    }
  },

  onMouseUp (e) {
    if (!this.pan) return
    this.isMove = false
    this.pan = false
    this.panStart = null
    this.drawing.setCursor('cross')
  },

  getPosInView (e) {
    return this.drawing.posInView({
      x: e.pageX,
      y: e.pageY
    })
  },

  getPos (e) {
    const pos = this.drawing.posInContent({
      x: e.pageX,
      y: e.pageY
    })
    return pos
  }
})

export default Jig
