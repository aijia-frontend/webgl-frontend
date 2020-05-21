import Jig from './baseJig'
import Snap from '../snap/main'
import _cloneDeep from 'lodash/cloneDeep'
import PreViewBuilder from './previewBuilder'
import CST from '@/common/cst/main'
import config from '@/config/houseDrawing'
import Matrix from '@/common/matrix'
import SvgRenderer from '@/common/renderTools'
import Vector from '@/common/vector'

const windowJig = Jig.extend({
  initialize (attrs, options) {
    Jig.prototype.initialize.apply(this, arguments)
  },

  start () {
    const windowConfig = config.window[this.options.type]
    this.deepth = CST.mm.toPhysical(windowConfig.deepth)
    this.position = this.options.position || { x: 0, y: 0 }
    this.windowAttrs = {
      type: 'window',
      width: CST.mm.toPhysical(windowConfig.width),
      deepth: this.deepth,
      angle: 0
    }
    Jig.prototype.start.apply(this, arguments)
  },

  prepare () {
    this.preview = {
      symbol: PreViewBuilder.build(this.windowAttrs, { isModel: false })
    }

    const tf = Matrix.identity()
    tf.translate(this.position.x, this.position.y)
    SvgRenderer.attr(this.preview.symbol, { transform: tf.toString() })

    this.drawing.addTransient(this.preview.symbol)
  },

  update (pos) {
    if (this.wall) { // 重新计算临时图形
      this.windowAttrs.deepth = CST.mm.toPhysical(this.wall.weight())
      this.angleL = Vector.angle(this.wall.start(), this.wall.end())
      this.windowAttrs.angle = Vector.angle(this.point2Physical(this.wall.start()), this.point2Physical(this.wall.end()))
      this.preview.symbol.remove()
      this.prepare()
    } else if (this.wallLost) {
      this.windowAttrs.deepth = this.deepth
      this.preview.symbol.remove()
      this.prepare()
    }
    const tf = Matrix.identity()
    tf.translate(pos.x, pos.y)

    SvgRenderer.attr(this.preview.symbol, { transform: tf.toString() })
  },

  onMouseMove (e) {
    Jig.prototype.onMouseMove.apply(this, arguments)
    const pos = this.getPos(e)
    this.position = pos
    this.update(pos)
  },

  onMouseUp (e) {
    if (e.button === 2 && !this.isMove) this.cancel()
    Jig.prototype.onMouseUp.apply(this, arguments)
    if (e.button === 2) return
    this.data = this.windowAttrs
    this.data.position = this.position
    this.data.wall = this.wall
    this.data.class = this.options.type
    // this.data.angle = this.angleL || 0
    this.end()
  },

  getPos (e) {
    let pos = this.drawing.posInContent({
      x: e.pageX,
      y: e.pageY
    })
    Snap.reset({ func: 'hide' })
    const oSnap = Snap.findLine(_cloneDeep(pos), { type: 'center', tol: 100 })
    if (oSnap) {
      pos = oSnap.position
    }
    this.wallLost = false
    if (this.wall && (!oSnap || !oSnap.wall)) this.wallLost = true
    this.wall = oSnap && oSnap.wall
    return pos
  }
})

export default windowJig
