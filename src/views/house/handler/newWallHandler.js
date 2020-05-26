import BaseHandler from './baseHandler'
import { Point, Line, PolyLine } from '@/common/geometry'
import { changeStart, getIntersect } from '@/common/util/pointUtil'
import { isInPolygon } from '@/common/util/gTools'
import Vector from '@/common/vector'
import { sortBy, cloneDeep } from 'lodash'
import NewJointHandler from './newJointHandler'
import AreaHandler from './areaHandler'

const isPtInside = (pts, pt) => {
  return isInPolygon(pt, pts) !== 'out'
}

const addToColl = (coll, ent) => {
  if (Array.isArray(ent)) {
    ent.forEach(item => addToColl(coll, item))
  } else {
    const _ent = coll.find(item => item.uid === ent.uid)
    if (!_ent) coll.push(ent)
  }
}

const NewWallHandler = BaseHandler.extend({
  initialize (attrs, options) {
    this.walls = this.dataStore.walls
    this.currentDestroy = false
    this.escaps = []
    this.newWalls = []
    this.updateWalls = []
    // console.log('====>dataStore walls:', this.walls)
    BaseHandler.prototype.initialize.apply(this, arguments)
  },

  createJoint (data) {
    let joint = this.dataStore.joints.find(item => Point.equal(item.position(), data.position))
    if (joint) {
      data.walls.forEach(wall => wall.addJoint(joint.uid))
    } else {
      const newJointHandler = new NewJointHandler(this.attrs)
      joint = newJointHandler.run(data)
    }
    return joint
  },

  createWall (data) {
    const wall = this.dataStore.create({
      type: 'wall',
      data: data
    })
    this.newWalls.push(wall)
    return wall
  },

  updateEnt (ent, data, options = {}) {
    if (ent) ent.update(data)
    if (ent.type === 'wall') addToColl(this.updateWalls, ent)
  },

  attachJoint () {
    const pts = this.wall.points()
    const joints = this.dataStore.joints.filter(item => Point.equal(item.position(), pts[0]) || Point.equal(item.position(), pts[3]))
    joints.forEach(item => {
      this.escaps.push(...item.walls())
      item.addWall(this.wall.uid)
      this.wall.addJoint(item.uid)
      this.updateWallsBaseJoint(item)
    })
  },
  // 画墙方式在 attach 会有影响
  /* type
  * 1. 中线画墙：当前墙体的中线 与 其他墙体内、中、外线相交
  * 2. 内线画墙：当前墙体的内或外线 与 其他墙体内、中、外线相交
  * 3. 若三条线都相交、且交点param在各自（0，1）区间内 ？ 判为croos ： attach
  */
  wallSort (options) {
    this.attachJoint()
    const pts = this.wall.points() // 当前墙的点位
    let points, intersects
    const intersectWalls = this.walls.filter(item => {
      if (item.uid === this.wall.uid || this.escaps.find(es => es.uid === item.uid)) return
      // 相交的
      points = item.points()
      intersects = PolyLine.intersect(new PolyLine(points), new PolyLine(pts))
      return intersects.length
    }, this)
    this.intersectWalls = intersectWalls.map(item => {
      points = item.points()
      if ((!options.type &&
        (isPtInside(points, pts[0]) ||
          isPtInside(points, pts[3]))) || // 中线
      (options.type &&
        (isPtInside(points, pts[1]) ||
          isPtInside(points, pts[2] ||
          isPtInside(points, pts[4] ||
          isPtInside(points, pts[5])))))) { // 内、外线 // attach
        return {
          wall: item,
          type: 0 // attach
        }
      } else if (isPtInside(pts, points[0]) || isPtInside(pts, points[3])) { // beAttach
        return {
          wall: item,
          type: 1 // be attach
        }
      } else {
        return {
          wall: item,
          type: 2 // cross
        }
      }
    }, this)
    console.log('相交的墙：', this.intersectWalls)
  },

  crossWallHandler (wall1, wall2) {
    const pts1 = wall1.points()
    const pts2 = wall2.points()
    const inter00 = getIntersect([pts1[0], pts1[3]], [pts2[0], pts2[3]])
    const walls1 = this.breakWall(wall1, inter00, wall2.weight())
    const walls2 = this.breakWall(wall2, inter00, wall1.weight())
    const joint = this.createJoint({
      position: inter00.point,
      walls: walls1.concat(walls2)
    })
    this.updateWallsBaseJoint(joint)
  },

  /* 两堵墙的点位顺序
     5._____________________4.5_______________________.4
      |                      |                        |
     0.                     3.0                       .3
      |                      |                        |
     1._____________________2.1_______________________.2
  */
  attachWallHandler (wall1, wall2) {
    // merge || break

    const pts1 = wall1.points()
    const pts2 = wall2.points()
    // 点位排序
    // wall1 需要重排：交点 占比 <= 0
    // wall2 需要重排：交点 param >= 0.5
    // intersect

    const intersect = getIntersect([pts1[0], pts1[3]], [pts2[0], pts2[3]])
    if (!intersect) {
      const line = new Line(pts1[0], pts1[3])
      let position
      if (line.isPtOn(pts2[0])) {
        position = pts2[0]
      } else if (line.isPtOn(pts2[3])) {
        position = pts2[3]
      }
      if (position) {
        // 1. 在一个方向上 且 中线上有一个点重合
        this.createJoint({
          position,
          walls: [wall1, wall2]
        })
      } else {
        // 2. 特殊处理该现象，在中间补一段垂直于该处墙体的墙
      }
    } else {
      this.breakHandler(wall1, wall2, intersect)
    }
  },

  breakHandler (wall1, wall2, inter0) {
    this.extendWall(wall2, inter0)
    const walls = this.breakWall(wall1, inter0, wall2.weight())
    const joint = this.createJoint({
      position: inter0.point,
      walls: [...walls, wall2]
    })
    this.updateWallsBaseJoint(joint)
  },

  /* 围绕joint更新墙体点位 */
  updateWallsBaseJoint (joint) {
    const walls = joint.walls()
    // 所有墙体 按照 joint点为起点
    const position = joint.position() // joint 位置
    let pts, angle // 墙体点位, 0-->3 的向量角度
    let wallsInfo = walls.map(wall => {
      let isChange = false
      pts = wall.points()
      if (Point.equal(pts[3], position)) {
        pts = changeStart(pts)
        isChange = true
      }
      angle = Vector.angle(pts[0], pts[3])
      return {
        ent: wall,
        points: pts,
        angle,
        isChange
      }
    })

    wallsInfo = sortBy(wallsInfo, item => item.angle)
    const length = wallsInfo.length
    let next
    wallsInfo.forEach((item, index) => {
      next = wallsInfo[(index + 1) % length]
      this.update2Walls(next, item)
    })

    wallsInfo.forEach(item => {
      this.updateEnt(item.ent, {
        points: item.isChange ? changeStart(item.points) : item.points
      })
    })
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
  },

  extendWall (wall, inter) {
    const pts = wall.points()
    let p1, p2
    if (inter.p2 < 0.5) { // 向起点延申
      pts[0] = inter.point
      p1 = Line.ptProjection(pts[0], { p1: pts[1], p2: pts[2] })
      p2 = Line.ptProjection(pts[0], { p1: pts[5], p2: pts[4] })
      pts[1] = p1
      pts[5] = p2
    } else { // 向终点延申
      pts[3] = inter.point
      p1 = Line.ptProjection(pts[3], { p1: pts[1], p2: pts[2] })
      p2 = Line.ptProjection(pts[3], { p1: pts[5], p2: pts[4] })
      pts[2] = p1
      pts[4] = p2
    }
    this.updateEnt(wall, {
      points: pts
    }/* , { silent: true } */)
  },

  breakWall (wall, inter, weight) {
    const intersect = inter.point
    const walls = []
    const pts = wall.points()
    if (Point.equal(pts[0], intersect) || Point.equal(pts[3], intersect)) {
      const joint = wall.getJointOnPos(intersect)
      if (joint) {
        joint.remWall(wall.uid)
        wall.remJoint(joint.uid)
        if (!joint.attrs.walls.length) joint.destroy()
      }
      walls.push(wall)
      return walls
    }
    // weight = weight * 0.5 // 判断短墙用
    const p0 = Line.nearestPoint(pts[1], pts[2], intersect)
    const p1 = Line.nearestPoint(pts[4], pts[5], intersect)
    const pts1 = cloneDeep(pts)
    const pts2 = cloneDeep(pts)
    pts1[2] = pts2[1] = p0
    pts1[3] = pts2[0] = intersect
    pts1[4] = pts2[5] = p1
    this.updateEnt(wall, {
      points: pts1
    }/* , { silent: true } */)
    const wall2 = this.createWall({
      points: pts2,
      weight: wall.weight()
    })
    // 更新关系
    const joint1 = wall.getJointOnPos(pts[3])
    if (joint1) {
      joint1.remWall(wall.uid)
      wall.remJoint(joint1.uid)
      joint1.addWall(wall2.uid)
      wall2.addJoint(joint1.uid)
    }
    return [wall, wall2]
  },

  refWallsHandler () {
    // 先处理attach
    const attachWalls = this.intersectWalls.filter(item => item.type === 0)
    attachWalls.forEach(item => {
      if (this.currentDestroy || this.escaps.find(es => es.uid === item.uid)) return
      this.attachWallHandler(item.wall, this.wall)
    })
    if (this.currentDestroy) return
    // be attach or cross
    // 按照在this.wall上的交点位置排序
    let otherWalls = this.intersectWalls.filter(item => item.type !== 0)
    const pts1 = this.wall.points()
    const interInfo = otherWalls.map(item => {
      const pts = item.wall.points()
      const param = getIntersect([pts1[0], pts1[3]], [pts[0], pts[3]]).p1
      item.param = param
      return item
    })
    otherWalls = sortBy(interInfo, item => item.param)
    otherWalls.reverse()
    otherWalls.forEach(item => {
      if (this.currentDestroy || this.escaps.find(es => es.uid === item.uid)) return
      switch (item.type) {
        case 1: {
          this.attachWallHandler(this.wall, item.wall)
          break
        }
        case 2: {
          this.crossWallHandler(this.wall, item.wall)
          break
        }
        default: {
          console.warn('can not handler this type:', item.type)
          break
        }
      }
    }, this)
  },

  areaHandler () {
    const areaHandler = new AreaHandler({
      attrs: this.attrs
    })
    areaHandler.run(this.updateWalls)
  },

  run (data, options = { type: 0 }) {
    this.data = data
    this.wall = this.createWall(data)
    this.wallSort(options)
    this.refWallsHandler()

    this.areaHandler()
  }
})

export default NewWallHandler
