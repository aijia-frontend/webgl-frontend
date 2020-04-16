import Jig from './baseJig'
import { Point } from '@/common/geometry'
import CST from '@/common/cst/main'
import PreviewBuilder from './previewBuilder'

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

  onMouseUp (e) {
    Jig.prototype.onMouseUp.apply(this, arguments)

    const pos = this.getPos(e)
    const dis = CST.mm.toLogical(Point.distance(pos, this.startPos))
    if (dis < 20) this.cancel()
    else this.end()
  },

  onMouseMove (e) {
    Jig.prototype.onMouseMove.apply(this, arguments)
  }
})

export default MoveJig
