import Jig from './baseJig'
import SvgRenderer from '@/common/renderTools'
import Vector from '@/common/vector'
import { Point } from '@/common/geometry'
import Matrix from '@/common/matrix'
import CST from '@/common/cst/main'
import Snap from '../snap/main'
import _cloneDeep from 'lodash/cloneDeep'
// import PreViewBuilder from './previewBuilder'
const wallWeight = 140 // mm

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

/* const group = {
  tag: 'g',
  attrs: {
    class: 'wall preview'
  },
  nodes: [polygon]
} */

const getPointsStr = pts => {
  return pts.map(pt => pt.x + ' ' + pt.y).join(' ')
}

const pointAdd = (pt, offset) => {
  return {
    x: pt.x + offset.x,
    y: pt.y + offset.y
  }
}

const pointTransform = (pt, center, angle) => {
  const tf = Matrix.identity()
  tf.translate(-center.x, -center.y)
  tf.rotate(angle)
  tf.translate(center.x, center.y)
  return Point.transform(pt, tf)
}

const wallJig = Jig.extend({
  initialize (attrs, options) {
    Jig.prototype.initialize.apply(this, arguments)
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
      wallWeight
    })
  },

  updateWall (pos) {
    // 计算polygon points
    // angle
    const angle = Vector.angle(this.startPos, pos)
    const pxPerMM = CST.mm.toPhysical(1)
    const point = {
      x: this.startPos.x + wallWeight * pxPerMM * 0.5,
      y: this.startPos.y
    }
    const offset = {
      x: pos.x - this.startPos.x,
      y: pos.y - this.startPos.y
    }
    const p1 = pointTransform(point, this.startPos, angle + Math.PI / 2)
    const p2 = pointAdd(p1, offset)
    const p3 = pointTransform(point, this.startPos, angle - Math.PI / 2)
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
      this.data.weight = wallWeight
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
          wallWeight
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
