import Jig from './baseJig'
import SvgRenderer from '@/common/renderTools'
import Vector from '@/common/vector'
import { Point } from '@/common/geometry'
import CST from '@/common/cst/main'
import { getPointsStr, pointAdd, pointRotate, changeStart, getIntersect } from '@/common/util/pointUtil'
import PreviewBuilder from './previewBuilder'
// import DataStore from '../models/dataStore'
import _cloneDeep from 'lodash/cloneDeep'
import _sortBy from 'lodash/sortBy'

const line = {
  tag: 'polyline',
  attrs: {
    class: 'wallLine preview',
    points: ''
  }
}

const wallSegJig = Jig.extend({
  initialize (attrs, options) {
    Jig.prototype.initialize.apply(this, arguments)
    this.wall = attrs.wall
    this.wallWeight = this.wall.weight()
    if (this.attrs.start) {
      this.startPos = this.point2Physical(this.attrs.start)
    }
  },

  start () {
    // 查找相关内容
    this.activeEnts = [this.wall]
    const joints = this.wall.joints()
    this.refWalls = []
    if (joints.length) {
      this.joint = joints[0]
      const refWalls = joints[0].walls().filter(item => item.uid !== this.wall.uid)
      this.refWalls.push(...refWalls)

      this.activeEnts.push(...refWalls)
      this.initRefWallsData(joints[0])
    }

    // 隐藏
    this.drawing.hide(this.activeEnts)
    Jig.prototype.start.apply(this, arguments)
  },

  initRefWallsData (joint) {
    const jointPos = joint.position()
    let points, isChange, originPoints, angle
    this.refWalls = this.refWalls.map(wall => {
      points = wall.points()
      isChange = false
      if (Point.equal(jointPos, points[3])) { // 需要颠倒起点终点
        points = changeStart(points)
        isChange = true
      }
      originPoints = points.map(this.point2Physical)
      angle = Vector.angle(originPoints[0], originPoints[3])

      return {
        ent: wall,
        originPoints,
        angle,
        isChange
      }
    })
    this.refWalls = _sortBy(this.refWalls, item => item.angle).map((item, index) => {
      return Object.assign(item, { index })
    })
  },

  cleanup () {
    this.drawing.show(this.activeEnts)
    Jig.prototype.cleanup.apply(this, arguments)
  },

  prepare () {
    // 添加临时图形
    this.preview = {
      activeEnt: PreviewBuilder.build(this.wall),
      line: SvgRenderer.render(line)
    }
    this.drawing.addTransient(this.preview.activeEnt)
    this.drawing.addTransient(this.preview.line)
    // 添加关联图形
    let type = ''
    let tryout = null
    this.refWalls.forEach(item => {
      type = item.ent.type + 's'
      if (!this[type]) this[type] = []
      tryout = PreviewBuilder.build(item.ent)
      this.drawing.addTransient(tryout)
      this[type].push(tryout)
    })
  },

  update (pos) {
    SvgRenderer.attr(this.preview.line, { points: getPointsStr([this.startPos, pos]) })
    this.updateWall(pos)
    /* const options = {
      tag: 'point',
      origin: this.dataStore.origin
    }
    const startL = CST.toLogical(this.points[0], options)
    const endL = CST.toLogical(this.points[3], options)
    this.$bus.$emit('dimension', {
      pos: this.drawing.getPosFromView(Point.paramPoint(this.points[1], this.points[2], 0.5)),
      length: Point.distance(startL, endL),
      wallWeight: this.wallWeight
    }) */
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
    if (this.refWalls.length) {
      this.updateRefWalls()
    } else {
      SvgRenderer.attr(this.preview.activeEnt, { points: getPointsStr(this.points) })
    }
  },

  // 相邻更新
  /* 按照邻边更新 */
  /* 逆转points0 */
  /* next 更新points0[1]、points1[5] */
  update2Walls (info1, info2) {
    let points0 = changeStart(info1.points)
    const points1 = info2.points
    const intersect = getIntersect([points0[4], points0[5]], [points1[4], points1[5]])
    points0[4] = points1[5] = intersect ? intersect.point : points0[4]
    points0 = changeStart(points0)

    const preview1 = info1.index < 0 ? this.preview.activeEnt : this.walls[info1.index]
    const preview2 = info2.index < 0 ? this.preview.activeEnt : this.walls[info2.index]
    SvgRenderer.attr(preview1, { points: getPointsStr(info1.points) })
    SvgRenderer.attr(preview2, { points: getPointsStr(info2.points) })
  },

  updateRefWalls () {
    let walls = [...this.refWalls]
    walls.forEach(item => {
      item.points = _cloneDeep(item.originPoints)
    })
    walls.push({
      ent: this.wall,
      points: _cloneDeep(this.points),
      angle: Vector.angle(this.points[0], this.points[3]),
      index: -1
    })
    walls = _sortBy(walls, item => item.angle)
    const length = walls.length
    let next
    walls.forEach((item, index) => {
      next = walls[(index + 1) % length]
      this.update2Walls(item, next)
    })

    this.points = walls.find(item => item.index < 0).points

    /* this.refWalls.forEach(ent => {
      const points = ent.originPoints
      const inters = merge2Walls(this.points)
    }) */
  },

  onMouseUp (e) {
    Jig.prototype.onMouseUp.apply(this, arguments)
    if (e.button === 2) return

    const pos = this.getPos(e)
    if (!this.startPos) {
      this.startPos = pos
      SvgRenderer.attr(this.preview.line, { points: getPointsStr([pos]) })
    } else {
      this.update(pos)
      this.data = this.refWalls
      this.data.push({
        ent: this.wall,
        points: this.points,
        isOrigin: true
      })
      this.end()
    }
  },

  onMouseMove (e) {
    Jig.prototype.onMouseMove.apply(this, arguments)
    if (!this.startPos) return
    const pos = this.getPos(e)
    this.update(pos)
  }
})

export default wallSegJig
