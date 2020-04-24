import Jig from './baseJig'
import SvgRenderer from '@/common/renderTools'
import Vector from '@/common/vector'
import { Point } from '@/common/geometry'
import CST from '@/common/cst/main'
import { getPointsStr, pointAdd, pointRotate, changeStart, merge2Walls } from '@/common/util/pointUtil'
import PreviewBuilder from './previewBuilder'
import DataStore from '../models/dataStore'
import _cloneDeep from 'lodash/cloneDeep'
const wallWeight = 140 // mm

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
    if (this.attrs.start) {
      this.startPos = this.attrs.start
    }
  },

  start () {
    // 查找相关内容
    this.refEnts = []
    this.activeEnts = [this.wall]
    const joints = this.wall.joints()
    this.refWalls = []
    if (joints.length) {
      const refWalls = joints[0].walls().filter(item => item.uid !== this.wall.uid)
      this.refWalls.push(...refWalls)
      this.refEnts.push(...refWalls)
      this.activeEnts.push(...refWalls)
      this.refEnts.push(joints[0])
      this.activeEnts.push(joints[0])
      this.initRefWallsData(joints[0])
    }
    // 隐藏
    this.drawing.hide(this.activeEnts)
    Jig.prototype.start.apply(this, arguments)
  },

  initRefWallsData (joint) {
    const jointPos = joint.position()
    this.refWalls = this.refWalls.map(wall => {
      let points = wall.points()
      if (Point.equal(jointPos, points[0])) { // 需要颠倒起点终点
        points = changeStart(points)
      }
      const originPoints = points.map(pt => {
        return CST.toPhysical(pt, {
          tag: 'point',
          origin: DataStore.origin
        })
      })
      return {
        ent: wall,
        originPoints
      }
    })
  },

  cleanup () {
    this.drawing.show(this.activeEnts)
    Jig.prototype.cleanup.apply(this, arguments)
  },

  prepare () {
    // 添加临时图形
    this.preview = {
      wall: PreviewBuilder.build(this.wall),
      line: SvgRenderer.render(line)
    }
    this.drawing.addTransient(this.preview.wall)
    this.drawing.addTransient(this.preview.line)
    // 添加关联图形
    let type = ''
    let tryout = null
    this.refEnts.forEach(ent => {
      type = ent.type + 's'
      if (!this[type]) this[type] = []
      tryout = PreviewBuilder.build(ent)
      this.drawing.addTransient(tryout)
      this[type].push(tryout)
    })
    // this.update(this.attrs.end)
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
    const p1 = pointRotate(point, this.startPos, angle + Math.PI / 2)
    const p2 = pointAdd(p1, offset)
    const p3 = pointRotate(point, this.startPos, angle - Math.PI / 2)
    const p4 = pointAdd(p3, offset)
    const points = [this.startPos, p1, p2, pos, p4, p3]
    this.points = points
    if (this.refWalls.length) {
      this.updateRefWalls()
    }
    SvgRenderer.attr(this.preview.wall, { points: getPointsStr(this.points) })
  },

  updateRefWalls () {
    if (this.refWalls.length === 1) {
      const points1 = _cloneDeep(this.refWalls[0].originPoints)
      const inters = merge2Walls(points1, this.points)
      points1[2] = inters.inter1.point
      points1[4] = inters.inter2.point
      this.refWalls[0].points = points1
      SvgRenderer.attr(this.walls[0], { points: getPointsStr(points1) })
      this.points[1] = inters.inter1.point
      this.points[5] = inters.inter2.point
    }
    /* this.refWalls.forEach(ent => {
      const points = ent.originPoints
      const inters = merge2Walls(this.points)
    }) */
  },

  onMouseUp (e) {
    Jig.prototype.onMouseUp.apply(this, arguments)

    const pos = this.getPos(e)
    if (!this.startPos) {
      this.startPos = pos
      SvgRenderer.attr(this.preview.line, { points: getPointsStr([pos]) })
    } else {
      this.update(pos)
      this.data = this.refWalls
      this.data.push({
        ent: this.wall,
        points: this.points
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
