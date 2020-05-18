import BaseHandler from './baseHandler'
import DataStore from '../models/dataStore'
import { Point, Line, PolyLine } from '@/common/geometry'
import { changeStart, getIntersect } from '@/common/util/pointUtil'
import { isInPolygon } from '@/common/util/gTools'
// import Vector from '@/common/vector'
import _findIndex from 'lodash/findIndex'
import _sortBy from 'lodash/sortBy'
import NewJointHandler from './newJointHandler'
import AreaHandler from './areaHandler'

const isPtInside = (pts, pt) => {
  return isInPolygon(pt, pts) !== 'out'
}

// const getConnectWall = (joint, pos, escape) => {
//   const walls = joint.walls().filter(item => item.uid !== escape.uid)
//   return walls.find(item => item.points().find(pt => Point.equal(pt, pos)))
// }

const hasJointOnPos = (wall, pos) => {
  const joints = wall.joints()
  return joints.find(joint => Point.equal(joint.position(), pos))
}

const NewWallHandler = BaseHandler.extend({
  initialize (attrs, options) {
    this.walls = DataStore.walls
    this.currentDestroy = false
    this.escaps = []
    this.newWalls = []
    // console.log('====>dataStore walls:', this.walls)
    BaseHandler.prototype.initialize.apply(this, arguments)
  },

  createJoint (data) {
    let joint = DataStore.joints.find(item => Point.equal(item.position(), data.position))
    if (joint) {
      data.walls.forEach(wall => wall.addJoint(joint.uid))
    } else {
      const newJointHandler = new NewJointHandler(this.attrs)
      joint = newJointHandler.run(data)
    }
    return joint
  },

  createWall (data) {
    const wall = DataStore.create({
      type: 'wall',
      data: data
    })
    this.newWalls.push(wall)
    return wall
  },

  updateEnt (ent, data) {
    if (ent) ent.update(data)
  },

  getConnectWall (joint, wall, pt) {
    return joint.walls().find(item => {
      if (item.uid === wall.uid) return
      return item.points().find(pos => {
        return Point.equal(pos, pt)
      })
    })
  },

  // 画墙方式在 attach 会有影响
  /* type
  * 1. 中线画墙：当前墙体的中线 与 其他墙体内、中、外线相交
  * 2. 内线画墙：当前墙体的内或外线 与 其他墙体内、中、外线相交
  * 3. 若三条线都相交、且交点param在各自（0，1）区间内 ？ 判为croos ： attach
  */
  wallSort (options) {
    const pts = this.wall.points() // 当前墙的点位
    let points, intersects
    const intersectWalls = this.walls.filter(item => {
      if (item.uid === this.wall.uid) return
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
    const inter11 = getIntersect([pts1[1], pts1[2]], [pts2[1], pts2[2]])
    const inter12 = getIntersect([pts1[1], pts1[2]], [pts2[4], pts2[5]])
    const inter21 = getIntersect([pts1[4], pts1[5]], [pts2[1], pts2[2]])
    const inter22 = getIntersect([pts1[4], pts1[5]], [pts2[4], pts2[5]])
    // 墙体另一端的joint 从原墙体中移除 添加至新墙体
    const wall1Joint = hasJointOnPos(wall1, pts1[3])
    const wall2Joint = hasJointOnPos(wall2, pts2[3])
    let pts1u, pts1n, pts2u, pts2n
    if (inter11.p1 < inter12.p1) {
      pts1u = [pts1[0], pts1[1], inter11.point, inter00.point, inter21.point, pts1[5]]
      pts1n = [inter00.point, inter12.point, pts1[2], pts1[3], pts1[4], inter22.point]
      pts2u = [pts2[0], pts2[1], inter21.point, inter00.point, inter22.point, pts2[5]]
      pts2n = [inter00.point, inter11.point, pts2[2], pts2[3], pts2[4], inter12.point]
    } else {
      pts1u = [pts1[0], pts1[1], inter12.point, inter00.point, inter22.point, pts1[5]]
      pts1n = [inter00.point, inter11.point, pts1[2], pts1[3], pts1[4], inter21.point]
      pts2u = [pts2[0], pts2[1], inter11.point, inter00.point, inter12.point, pts2[5]]
      pts2n = [inter00.point, inter21.point, pts2[2], pts2[3], pts2[4], inter22.point]
    }
    this.updateEnt(wall1, { points: pts1u })
    this.updateEnt(wall2, { points: pts2u })
    const w3 = this.createWall({
      points: pts1n
    })
    const w4 = this.createWall({
      points: pts2n
    })
    this.createJoint({
      position: inter00.point,
      walls: [wall1, wall2, w3, w4]
    })
    if (wall1Joint) {
      wall1Joint.remWall(wall1.uid)
      wall1Joint.addWall(w3.uid)
      wall1.remJoint(wall1Joint.uid)
      w3.addJoint(wall1Joint.uid)
    }
    if (wall2Joint) {
      wall2Joint.remWall(wall2.uid)
      wall2Joint.addWall(w4.uid)
      wall2.remJoint(wall2Joint.uid)
      w4.addJoint(wall2Joint.uid)
    }
    // 错误关系检查
    if (wall1.joints().length > 2) console.warn('cross - joints length error: ' + wall1)
    if (wall2.joints().length > 2) console.warn('cross - joints length error: ' + wall2)
    if (w3.joints().length > 2) console.warn('cross - joints length error: ' + w3)
    if (w4.joints().length > 2) console.warn('cross - joints length error: ' + w4)
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

    let pts1 = wall1.points()
    let pts2 = wall2.points()
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
      if (intersect.p1 <= 0) { // wall1 需要重排
        pts1 = changeStart(pts1)
      }
      if (intersect.p2 >= 0.5) { // wall2 需要重排
        pts2 = changeStart(pts2)
      }
      // 更新内边
      this.updateInsideLine({ wall: wall1, pts: pts1 }, { wall: wall2, pts: pts2 }, intersect.point)
    }
  },

  updateInsideLine (wallInfo1, wallInfo2, intersect0) {
    // [1,2]-[1,2] || [4,5]-[4,5]
    // const wall1 = wallInfo1.wall
    // const wall2 = wallInfo2.wall
    const pts1 = wallInfo1.pts
    const pts2 = wallInfo2.pts
    const joint = hasJointOnPos(wallInfo1.wall, intersect0)
    let intersect1 = getIntersect([pts1[1], pts1[2]], [pts2[1], pts2[2]], { extend: false })
    let intersect2 = getIntersect([pts1[4], pts1[5]], [pts2[4], pts2[5]], { extend: false })
    if (intersect1) {
      // [1,2]为内边
      // 判断该端点是否存在joint ？ 只能更新内边，外边由相连的另一堵墙更新
      if (joint) {
        this.update3Walls(wallInfo1, wallInfo2, joint, intersect1.point, {}, intersect0, 2)
      } else {
        // 判断wall2的外边是否与内边相交，若相交则break wall1
        intersect2 = getIntersect([pts1[1], pts1[2]], [pts2[4], pts2[5]], { extend: false, limit: 1 })
        if (intersect2 && intersect2.p1 !== 1) { // break wall1
          this.breakWallHandler(wallInfo1, wallInfo2, intersect0, intersect1.point, intersect2.point, 4)
        } else {
          intersect2 = getIntersect([pts1[4], pts1[5]], [pts2[4], pts2[5]])
          this.merge2Walls(wallInfo1, wallInfo2, intersect1.point, intersect2.point, intersect0)
        }
      }
    } else if (intersect2) {
      // [4,5]为内边
      // intersect2 = getIntersect([pts1[4], pts1[5]], [pts2[4], pts2[5]])

      if (joint) {
        this.update3Walls(wallInfo1, wallInfo2, joint, {}, intersect2.point, intersect0, 4)
      } else {
        intersect1 = getIntersect([pts1[4], pts1[5]], [pts2[1], pts2[2]], { extend: false, limit: 1 })
        if (intersect1) {
          this.breakWallHandler(wallInfo1, wallInfo2, intersect0, intersect1.point, intersect2.point, 1)
        } else {
          // update 2 walls
          intersect1 = getIntersect([pts1[1], pts1[2]], [pts2[1], pts2[2]])
          this.merge2Walls(wallInfo1, wallInfo2, intersect1.point, intersect2.point, intersect0)
        }
      }
    } else {
      // 判断是否出墙 ：删除
      // this.wall.destroy()
    }
  },

  update3Walls (wallInfo1, wallInfo2, joint, inter1, inter2, inter0, oParam) {
    // 只更新内边
    // 外边由其他墙更新 w3
    // 获取w3，有一个点为 pts1[2]
    const wall1 = wallInfo1.wall
    const pts1 = wallInfo1.pts
    const wall2 = wallInfo2.wall
    const pts2 = wallInfo2.pts
    const wall3 = this.getConnectWall(joint, wall1, pts1[oParam])
    if (!wall3) {
      console.warn('wall3 not exist')
      return
    }
    // 若w3在队列内，则跳过计算 escapes ++
    this.escaps.push(wall3)
    // 根据pts[2] param 得出 wall3上的线 l3
    // intersect = （l3, pts2[4,5]）
    const pts3 = wall3.points()
    const param = _findIndex(pts3, item => Point.equal(item, pts1[oParam]))
    let _param = param
    if (param === 5 || param === 2) _param = param - 1
    if (oParam === 2) {
      inter2 = getIntersect([pts3[_param], pts3[_param + 1]], [pts2[4], pts2[5]])
      if (!inter2) {
        // 两线同向
        inter2 = Line.nearestPoint(pts3[_param], pts3[_param + 1], inter0, { extend: true })
        if (!inter2) console.warn('this pt must exist')
      } else inter2 = inter2.point
      pts1[2] = pts2[1] = inter1
      pts2[5] = pts3[param] = inter2
    } else {
      inter1 = getIntersect([pts3[_param], pts3[_param + 1]], [pts2[1], pts2[2]])
      if (!inter1) {
        // 两线同向
        inter1 = Line.nearestPoint(pts3[_param], pts3[_param + 1], inter0, { extend: true })
        if (!inter1) console.warn('this pt must exist')
      } else inter1 = inter1.point
      pts1[4] = pts2[5] = inter2
      pts2[1] = pts3[param] = inter1
    }
    pts2[0] = inter0

    this.updateEnt(wall1, { points: pts1 })
    this.updateEnt(wall2, { points: pts2 })
    wall2.addJoint(joint.uid)
    joint.addWall(wall2.uid)
    this.updateEnt(wall3, { points: pts3 })
  },

  merge2Walls (wallInfo1, wallInfo2, inter1, inter2, inter0) {
    const wall1 = wallInfo1.wall
    const wall2 = wallInfo2.wall
    const pts1 = wallInfo1.pts
    const pts2 = wallInfo2.pts
    pts1[2] = pts2[1] = inter1
    pts1[3] = pts2[0] = inter0
    pts1[4] = pts2[5] = inter2
    // update 2 walls
    this.updateEnt(wall1, { points: pts1 })
    this.updateEnt(wall2, { points: pts2 })
    // create joint
    this.createJoint({
      position: inter0,
      walls: [wall1, wall2]
    })
  },

  breakWallHandler (wallInfo1, wallInfo2, inter0, inter1, inter2, param) {
    // update wall1 wall2 new wall3 new joint
    const wall1 = wallInfo1.wall
    const wall2 = wallInfo2.wall
    const pts1 = wallInfo1.pts
    const pts2 = wallInfo2.pts
    pts2[0] = inter0
    pts2[1] = inter1
    pts2[5] = inter2
    const p4 = Line.nearestPoint(pts1[param], pts1[param + 1], inter0)
    let pts3
    const wall1Joint = hasJointOnPos(wall1, pts1[3])
    if (param === 4) {
      pts3 = [inter0, inter2, pts1[2], pts1[3], pts1[4]]
      pts1[2] = inter1
      pts1[3] = inter0

      pts1[4] = pts3[5] = p4
    } else {
      pts3 = [inter0, 0, pts1[2], pts1[3], pts1[4], inter1]
      pts1[3] = inter0
      pts1[4] = inter2

      pts1[2] = pts3[1] = p4
    }

    const w3 = this.createWall({
      weight: wall1.weight(),
      points: pts3
    })

    this.createJoint({
      position: inter0,
      walls: [wall1, wall2, w3]
    })

    this.updateEnt(wall1, { points: pts1 })
    this.updateEnt(wall2, { points: pts2 })

    if (wall1Joint) {
      wall1Joint.remWall(wall1.uid)
      wall1Joint.addWall(w3.uid)
      wall1.remJoint(wall1Joint.uid)
      w3.addJoint(wall1Joint.uid)
    }

    // 错误关系检查
    if (wall1.joints().length > 2) console.warn('break - joints length error: ' + wall1)
    if (wall2.joints().length > 2) console.warn('break - joints length error: ' + wall2)
    if (w3.joints().length > 2) console.warn('break - joints length error: ' + w3)
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
    otherWalls = _sortBy(interInfo, item => item.param)
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
    areaHandler.run(this.newWalls)
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
