import Jig from './baseJig'
import Snap from '../snap/main'
import _cloneDeep from 'lodash/cloneDeep'
import PreViewBuilder from './previewBuilder'

const fabricJig = Jig.extend({
  initialize (attrs, options) {
    Jig.prototype.initialize.apply(this, arguments)
  },

  start () {
    Jig.prototype.start.apply(this, arguments)
  },

  prepare () {
    this.preview = {
      symbol: PreViewBuilder
    }
  },

  update (pos) {

  },

  onMouseMove (e) {
    Jig.prototype.onMouseMove.apply(this, arguments)
    const pos = this.getPos(e)
    if (!this.startPos) return
    this.update(pos)
  },

  onMouseUp (e) {
    if (e.button === 2 && !this.isMove) this.cancel()
    Jig.prototype.onMouseUp.apply(this, arguments)
    if (e.button === 2) return
    this.end()
  },

  getPos (e) {
    let pos = this.drawing.posInContent({
      x: e.pageX,
      y: e.pageY
    })
    Snap.reset({ func: 'hide' })
    const oSnap = Snap.find(_cloneDeep(pos), { start: _cloneDeep(this.startPos) })
    if (oSnap) {
      pos = oSnap.position
    }
    this.data.wall = oSnap && oSnap.wall
    return pos
  }
})

export default fabricJig
