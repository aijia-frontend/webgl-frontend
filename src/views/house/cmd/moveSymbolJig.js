import MoveJig from './moveJig'
import CST from '@/common/cst/main'
import Vector from '@/common/vector'
import _cloneDeep from 'lodash/cloneDeep'
import Snap from '../snap/main'
import PreViewBuilder from './previewBuilder'

const MoveSymbolJig = MoveJig.extend({
  start () {
    this.originDeepth = CST.mm.toPhysical(this.activeEnt.deepth())
    this.originWidth = CST.mm.toPhysical(this.activeEnt.width())
    this.buildData = {
      type: 'window',
      deepth: this.originDeepth,
      width: this.originWidth,
      angle: CST.toPhysical(this.activeEnt.angle(), { tag: 'angle' })
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
    if (this.wall) { // 重新计算临时图形
      this.buildData.deepth = CST.mm.toPhysical(this.wall.weight())
      this.buildData.angle = Vector.angle(this.point2Physical(this.wall.start()), this.point2Physical(this.wall.end()))
    } else if (this.wallLost) {
      this.buildData.deepth = this.originDeepth
    }
    this.buildData.position = pos
    this.reBuild()
  },

  onMouseUp (e) {
    MoveJig.prototype.onMouseUp.apply(this, arguments)
    if (e.button === 2) return

    const pos = this.getPos(e)
    this.update(pos)

    this.data = this.buildData
    this.data.ent = this.activeEnt
    this.data.wall = this.wall

    this.end()
  },

  getPos (e) {
    let pos = this.drawing.posInContent({
      x: e.pageX,
      y: e.pageY
    })
    Snap.reset({ func: 'hide' })
    const oSnap = Snap.findLine(_cloneDeep(pos), { type: 'center', tol: 150 })
    if (oSnap) {
      pos = oSnap.position
    }
    this.wallLost = false
    if (this.wall && (!oSnap || !oSnap.wall)) this.wallLost = true
    this.wall = oSnap && oSnap.wall

    return pos
  }
})

export default MoveSymbolJig
