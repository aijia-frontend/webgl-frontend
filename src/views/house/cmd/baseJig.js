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

  onMouseDown () {},

  onMouseMove () {},

  onMouseUp () {},

  updateCanvas () {},

  getPosInView () {},

  getPos (e) {
    const pos = this.drawing.posInContent({
      x: e.pageX,
      y: e.pageY
    })
    return pos
  }
})

export default Jig
