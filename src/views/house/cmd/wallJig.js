import Jig from './baseJig'
import SvgRenderer from '@/common/renderTools'
import Vector from '@/common/vector'
import { Point } from '@/common/geometry'
import CST from '@/common/cst/main'
import Snap from '../snap/main'
import _cloneDeep from 'lodash/cloneDeep'
import { getPointsStr, pointAdd, pointRotate } from '@/common/util/pointUtil'
// import PreViewBuilder from './previewBuilder'
import config from '@/config/houseDrawing'

const polygon = {
  tag: 'polygon',
  attrs: {
    class: 'wall preview',
    points: ''
  }
}

const line = {
  tag: 'polyline',
  attrs: {
    class: 'wallLine preview',
    points: ''
  }
}

const wallJig = Jig.extend({
  initialize (attrs, options) {
    Jig.prototype.initialize.apply(this, arguments)
    this.wallWeight = config.wall.weight
    if (this.attrs.startPos) {
      this.startPos = this.attrs.startPos
    }
  },

  start () {
    Jig.prototype.start.apply(this, arguments)
  },

  prepare () {
    // 添加临时图形
    this.preview = {
      wall: SvgRenderer.render(polygon),
      line: SvgRenderer.render(line)
    }
    this.drawing.addTransient(this.preview.wall)
    this.drawing.addTransient(this.preview.line)
  },

  update (pos) {
    SvgRenderer.attr(this.preview.line, { points: getPointsStr([this.startPos, pos]) })
    this.updateWall(pos)
    const options = {
      tag: 'point',
      origin: this.dataStore.origin
    }
    const startL = CST.toLogical(this.points[1], options)
    const endL = CST.toLogical(this.points[2], options)
    this.$bus.$emit('dimension', {
      pos: this.drawing.getPosFromView(Point.paramPoint(this.points[1], this.points[2], 0.5)),
      length: Point.distance(startL, endL),
      wallWeight: this.wallWeight
    })
  },

  updateWall (pos) {
    // 计算polygon points
    // angle
    const angle = Vector.angle(this.startPos, pos)
    const pxPerMM = CST.mm.toPhysical(1)
    const point = {
      x: this.startPos.x + this.wallWeight * pxPerMM * 0.5,
      y: this.startPos.y
    }
    const offset = {
      x: pos.x - this.startPos.x,
      y: pos.y - this.startPos.y
    }
    const p1 = pointRotate(point, this.startPos, angle + Math.PI / 2)
    const p2 = pointAdd(p1, offset)
    const p3 = pointRotate(point, this.startPos, angle - Math.PI / 2)
    const p4 = pointAdd(p3, offset)
    const points = [this.startPos, p1, p2, pos, p4, p3]
    this.points = points
    SvgRenderer.attr(this.preview.wall, { points: getPointsStr(points) })
  },

  onClick (e) {
    const pos = this.getPos(e)
    if (!this.startPos) {
      this.startPos = pos
      SvgRenderer.attr(this.preview.line, { points: getPointsStr([pos]) })
    } else {
      this.update(pos)
      this.data.points = this.points
      this.data.startPos = this.startPos
      this.data.endPos = pos
      this.data.weight = this.wallWeight
      this.end()
    }
  },

  onMouseMove (e) {
    Jig.prototype.onMouseMove.apply(this, arguments)
    const pos = this.getPos(e)
    if (!this.startPos) return
    this.update(pos)
  },

  onMouseUp (e) {
    if (e.button !== 2) return
    if (!this.isMove) {
      if (this.startPos) {
        this.startPos = null

        // 重置临时视图
        this.points = []
        SvgRenderer.attr(this.preview.wall, { points: '' })
        SvgRenderer.attr(this.preview.line, { points: '' })
        this.$bus.$emit('dimension', {
          pos: { x: 0, y: 0 },
          length: 0,
          wallWeight: this.wallWeight
        })
        Jig.prototype.onMouseUp.apply(this, arguments)
      } else {
        this.cancel()
      }
    } else {
      Jig.prototype.onMouseUp.apply(this, arguments)
    }
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

export default wallJig
