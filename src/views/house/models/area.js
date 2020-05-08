import Model from './model'
import CST from '@/common/cst/main'
import { PolyLine, Rect, Point } from '@/common/geometry'
import polygonArea from '@/common/polygonArea'
import { isInPolygon } from '@/common/util/gTools'
import { getPointsStr } from '@/common/util/pointUtil'
import { min, cloneDeep } from 'lodash'
// import _cloneDeep from 'lodash/cloneDeep'

/* 计算多边形最大内切圆 */
const pre = 10
const findInnerCircleInContour = (points) => {
  const rect = new Rect(points)
  const lb = rect.leftBottom()
  const rt = rect.rightTop()
  let dist = 0
  let maxDist = 0
  let center, pt, np
  const lines = PolyLine.lines(points, { isClosed: true })
  let a = 0
  for (let x = lb.x; x < rt.x; x += pre) {
    for (let y = lb.y; y < rt.y; y += pre) {
      pt = { x, y }
      if (isInPolygon(pt, points) === 'out') continue
      a++
      dist = min(lines.map(line => {
        np = line.nearestPoint(pt)
        return Point.distance(np, pt)
      }))
      if (dist > maxDist) {
        maxDist = dist
        center = pt
      }
    }
  }
  console.log('共有效计算了：' + a + '次')
  return {
    center,
    radius: maxDist
  }
}

const Area = Model.extend({
  initialize () {
    this.type = 'area'
    Model.prototype.initialize.apply(this, arguments)
  },

  points () {
    return cloneDeep(this.attrs.points)
  },

  area () {
    this._area = polygonArea(this.points()) / 1000000
    return this._area
  },

  name () {
    return this.attrs.name || '未命名'
  },

  update (data, options = { silent: false }) {
    this.attrs = Object.assign({}, this.attrs, data)
    this._area = null
    // this._textPos = null
    if (!options.silent) this.onChange()
  },

  centerPos () {
    // 计算最大内切圆心
    if (!this._textPos) {
      console.time('计算最大内切圆耗时：')
      const innerCircle = findInnerCircleInContour(this.points())
      console.timeEnd('计算最大内切圆耗时：')
      this._textPos = innerCircle.center
    }
    /* const points = this.points()
    const xMin = minBy(points, pt => pt.x).x
    const xMax = maxBy(points, pt => pt.x).x
    const yMin = minBy(points, pt => pt.y).y
    const yMax = maxBy(points, pt => pt.y).y */
    return this._textPos
  },

  pointsStr () {
    const points = this.points().map(pt => CST.toPhysical(pt, { tag: 'point', origin: this.origin }))
    return getPointsStr(points)
  },

  joints () {
    return (this.attrs.joints || []).map(this.getRefEnt)
  },

  walls () {
    return (this.attrs.walls || []).map(this.getRefEnt)
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
