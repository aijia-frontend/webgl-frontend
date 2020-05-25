import Jig from './baseJig'
// import { Point } from '@/common/geometry'
// import CST from '@/common/cst/main'
import Snap from '../snap/main'
import PreviewBuilder from './previewBuilder'
import _cloneDeep from 'lodash/cloneDeep'

const MoveJig = Jig.extend({
  initialize (attrs, options) {
    Jig.prototype.initialize.apply(this, arguments)
    this.activeEnt = attrs.activeEnt
    if (this.attrs.startPos) {
      this.startPos = this.attrs.startPos
    }
  },

  start () {
    // 查找相关内容，由子类完成
    // 隐藏
    this.drawing.hide(this.activeEnts)
    Jig.prototype.start.apply(this, arguments)
  },

  cleanup () {
    this.drawing.show(this.activeEnts)
    Jig.prototype.cleanup.apply(this, arguments)
  },

  prepare () {
    // 添加临时图形
    this.preview = {
      activeEnt: PreviewBuilder.build(this.activeEnt)
    }
    this.drawing.addTransient(this.preview.activeEnt)
    // 添加关联图形
    let type = ''
    let tryout = null
    this.refEnts.forEach(ent => {
      if (ent.uid === this.activeEnt.uid) return
      type = ent.type + 's'
      if (!this[type]) this[type] = []
      tryout = PreviewBuilder.build(ent)
      this.drawing.addTransient(tryout)
      this[type].push(tryout)
    }, this)
  },

  update (pos) {
  },

  /* onMouseUp (e) {
    Jig.prototype.onMouseUp.apply(this, arguments)

    const pos = this.getPos(e)
    const dis = CST.mm.toLogical(Point.distance(pos, this.startPos))
    if (dis < 20) this.cancel()
    else this.end()
  }, */

  getPos (e) {
    let pos = Jig.prototype.getPos.apply(this, arguments)
    Snap.reset({ func: 'hide' })
    const oSnap = Snap.find(_cloneDeep(pos), { start: _cloneDeep(this.startPos) })
    if (oSnap) {
      pos = oSnap.position
    }
    this.attachWall = oSnap && oSnap.wall
    return pos
  },

  onMouseMove (e) {
    Jig.prototype.onMouseMove.apply(this, arguments)
    if (!this.startPos) return
    const pos = this.getPos(e)
    this.update(pos)
  }
})

export default MoveJig
