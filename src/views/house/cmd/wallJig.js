import Jig from './baseJig'

const wallJig = Jig.extend({
  initialize (attrs, options) {
    Jig.prototype.initialize.apply(this, arguments)
  },

  start () {
    Jig.prototype.start.apply(this, arguments)
  },

  prepare () {},

  update () {},

  onKeyUp () {},

  onClick () {},

  onMouseMove () {
    Jig.prototype.onMouseMove.apply(this, arguments)
  },

  getPos () {}
})

export default wallJig
