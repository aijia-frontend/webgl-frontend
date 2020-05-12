import Model from './model'
import CST from '@/common/cst/main'
import { PolyLine, Rect, Point } from '@/common/geometry'
import polygonArea from '@/common/polygonArea'
import { isInPolygon } from '@/common/util/gTools'
import { getPointsStr } from '@/common/util/pointUtil'
import { min, cloneDeep } from 'lodash'
// import _cloneDeep from 'lodash/cloneDeep'

// 计算最大内切圆 -优化 精度划分
/* 比较boundingRect中心点 */
/* 逐步划分 从大网格到小网格 */
const findCircle = (points) => {
  const lines = PolyLine.lines(points, { isClosed: true })
  const rect = new Rect(points)
  const center = rect.center() // boundingRect.center
  const dist = minDist2Polygon(lines, center) // center - maxDist
  const lb = rect.leftBottom()
  const rt = rect.rightTop()
  const pre = rect.width < rect.height ? rect.width / 20 : rect.height / 20
  let info = findInnerCircleInContour(points, lb, rt, pre)
  if (Math.abs(dist - info.radius) <= 5) {
    info = {
      center,
      radius: dist,
      points: []
    }
  }
  return info
}

const minDist2Polygon = (lines, pt) => {
  let np
  return min(lines.map(line => {
    np = line.nearestPoint(pt)
    return Point.distance(np, pt)
  }))
}

/* 计算多边形最大内切圆 */
const minPre = 10
const findInnerCircleInContour = (points, lb, rt, pre, maxDist = 0, center, cpoints = [], a = 0) => {
  let dist = 0
  let pt
  const lines = PolyLine.lines(points, { isClosed: true })
  for (let x = lb.x; x < rt.x; x += pre) {
    for (let y = lb.y; y < rt.y; y += pre) {
      pt = { x, y }
      if (isInPolygon(pt, points) !== 'in') continue
      a++
      dist = minDist2Polygon(lines, pt)
      cpoints.push(pt)
      if (dist > maxDist) {
        maxDist = dist
        center = pt
      }
    }
  }
  if (pre > minPre) {
    lb = {
      x: center.x - pre,
      y: center.y - pre
    }
    rt = {
      x: center.x + pre,
      y: center.y + pre
    }
    pre /= 20
    return findInnerCircleInContour(points, lb, rt, pre, maxDist, center, cpoints, a)
  } else {
    console.log('共有效计算了：' + a + '次')
    return {
      center,
      radius: maxDist,
      points: cpoints
    }
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
      const innerCircle = findCircle(this.points())
      console.timeEnd('计算最大内切圆耗时：')
      this._textPos = innerCircle
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
