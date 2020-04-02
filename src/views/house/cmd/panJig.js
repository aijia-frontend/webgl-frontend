import Jig from './baseJig'

const panJig = Jig.extend({
  initialize (attrs, options) {
    Jig.prototype.initialize.apply(this, arguments)
    if (this.attrs.startPos) {
      this.panStart = this.attrs.startPos
      this.pan = true
    }
  },

  onMouseUp (e) {
    this.end()
  }
})

export default panJig
