import BaseJig from '@/common/baseJig'

const Jig = BaseJig.extend({
  pageEvents: {
    'keyup': 'onKeyUp'
  },

  events: {
    'click': 'onClick',
    'mousedown': 'onMouseDown',
    'mousemove': 'onMouseMove',
    'mouseup': 'onMouseUp'
  },

  initialize (attrs, options) {
    this.attrs = attrs
    this.drawing = attrs.drawing
    BaseJig.prototype.initialize.apply(this, arguments)
  },

  start () {
    BaseJig.prototype.start.apply(this, arguments)
  },

  prepare () {},

  onKeyUp () {},

  onClick () {},

  onMouseDown () {},

  onMouseMove () {},

  onMouseUp () {},

  updateCanvas () {},

  getPosInView () {}
})

export default Jig
