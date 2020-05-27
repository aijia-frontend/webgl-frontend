import MoveJig from './moveJig'
import CST from '@/common/cst/main'
import Vector from '@/common/vector'
import { Point, Line } from '@/common/geometry'
import PreViewBuilder from './previewBuilder'

const MoveSymbolSegJig = MoveJig.extend({
  start () {
    this.originLine = new Line(this.attrs.startPos, this.attrs.endPos)
    this.buildData = {
      type: 'window',
      deepth: CST.mm.toPhysical(this.activeEnt.deepth()),
      width: CST.mm.toPhysical(this.activeEnt.width()),
      angle: Vector.angle(this.attrs.endPos, this.attrs.startPos)
    }
    this.activeEnts = [this.activeEnt]
    MoveJig.prototype.start.apply(this, arguments)
  },

  reBuild () {
    this.preview.activeEnt.remove()
    this.preview.activeEnt = PreViewBuilder.build(this.buildData, { isModel: false })
    this.drawing.addTransient(this.preview.activeEnt)
  },

  update (pos) {
    pos = this.originLine.ptProjection(pos)
    this.buildData.width = Point.distance(this.attrs.endPos, pos)
    this.buildData.angle = Vector.angle(this.attrs.endPos, pos)
    this.buildData.position = Point.paramPoint(this.attrs.endPos, pos, 0.5)
    this.reBuild()
  },

  onMouseUp (e) {
    MoveJig.prototype.onMouseUp.apply(this, arguments)
    if (e.button === 2) return

    const pos = this.getPos(e)
    this.update(pos)

    this.data = this.buildData
    this.data.ent = this.activeEnt

    this.end()
  },

  getPos (e) {
    return this.drawing.posInContent({
      x: e.pageX,
      y: e.pageY
    })
  }
})

export default MoveSymbolSegJig
