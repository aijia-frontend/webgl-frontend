import Model from './model'
import CST from '@/common/cst/main'
import { PolyLine, Line } from '@/common/geometry'
import polygonArea from '@/common/polygonArea'
import { getLoops } from '@/common/util/gTools'
import { minBy, maxBy } from 'lodash'
import _cloneDeep from 'lodash/cloneDeep'

const getPointsStr = pts => {
  return pts.map(pt => pt.x + ' ' + pt.y).join(' ')
}

const Area = Model.extend({
  initialize () {
    this.type = 'area'
    Model.prototype.initialize.apply(this, arguments)
  },

  points () {
    if (!this._points) this._points = this.getPoints()
    return _cloneDeep(this._points)
  },

  getLoop (lines) {
    const loops = getLoops(lines)
    if (loops.loop1.length === loops.loop2.length) {
      // 单空间封闭区域
      // 取长度最短的
      const length1 = (new PolyLine(loops.loop1)).length({ isClosed: true })
      const length2 = (new PolyLine(loops.loop2)).length({ isClosed: true })
      return length1 < length2 ? loops.loop1 : loops.loop2
    } else {
      return loops.loop1.length === this.attrs.joints.length ? loops.loop1 : loops.loop2
    }
  },

  // 内外环分别形成闭环
  // 内环长度比外环短
  getPoints () {
    // 墙上内外所有线
    const walls = this.attrs.walls.map(this.getRefEnt)
    const lines = []
    walls.forEach(wall => {
      const points = wall.points()
      lines.push(new Line(points[1], points[2]), new Line(points[4], points[5]))
    })

    // 环
    const points = this.getLoop(lines)
    if (points.length !== this.attrs.joints.length) console.warn('points length can not be this! points:', points, this)
    return points
  },

  area () {
    this._area = polygonArea(this.points()) / 1000000
    return this._area.toFixed(2) + 'm²'
  },

  name () {
    return this.attrs.name || '未命名'
  },

  centerPos () {
    const points = this.points()
    const xMin = minBy(points, pt => pt.x).x
    const xMax = maxBy(points, pt => pt.x).x
    const yMin = minBy(points, pt => pt.y).y
    const yMax = maxBy(points, pt => pt.y).y
    return {
      x: (xMin + xMax) / 2,
      y: (yMin + yMax) / 2
    }
  },

  pointsStr () {
    const points = this.points().map(pt => CST.toPhysical(pt, { tag: 'point', origin: this.origin }))
    return getPointsStr(points)
  },

  destroy () {
    Model.prototype.destroy.apply(this, arguments)
    this.updateJoint()
  },

  updateJoint () {
    if (this.attrs.joints && this.attrs.joints.length) {
      this.joints().forEach(joint => joint.remWall(this.uid))
    }
  },

  joints () {
    return (this.attrs.joints || []).map(this.getRefEnt)
  },

  addJoint (joint) {
    if (!this.attrs.joints) this.attrs.joints = []
    this.attrs.joints.push(joint)
    return this
  },

  remJoint (joint) {
    const index = this.attrs.joints.indexOf(joint)
    this.attrs.joints.splice(index, 1)
    return this
  },

  toJSON () {
    // save data
    const json = {}

    return json
  }
})

Area.type = 'area'

export default Area
