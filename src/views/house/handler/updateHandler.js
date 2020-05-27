import BaseHandler from './baseHandler'
import { PolyLine, Line, Point } from '@/common/geometry'
import { cloneDeep, sortBy, compact } from 'lodash'
import { getIntersect, changeStart } from '@/common/util/pointUtil'
import Vector from '@/common/vector'
import AreaHandler from './areaHandler'

const addToColl = (coll, ent) => {
  if (Array.isArray(ent)) {
    ent.forEach(item => addToColl(coll, item))
  } else {
    const _ent = coll.find(item => item.uid === ent.uid)
    if (!_ent) coll.push(ent)
  }
}

/* 判断两墙是否相连 */
/* 两墙是否有相同的joint */
const isConnext2Walls = (w1, w2) => {
  const joints1 = w1.attrs.joints || []
  const joints2 = w2.attrs.joints || []

  return joints1.includes(joints2[0] || '') || joints1.includes(joints2[1] || '')
}

const UpdateHandler = BaseHandler.extend({
  initialize () {
    BaseHandler.prototype.initialize.apply(this, arguments)
    this.deleteAreas = []
    this.existWalls = this.dataStore.walls
    this.existJoints = this.dataStore.joints
    this.newWalls = []
    this.updateWalls = []

    /*
    {
      id:
      wall1:
      wall2:
      type: 0/1/2 关系类型 attach/beAttach/cross
    }
     */
    this.relationshipMap = []
  },

  destroyJoint (joint) {
    const walls = joint.walls()
    joint.destroy()
    walls.forEach(item => item.remJoint(joint.uid))
  },

  createEnt (data) {
    const ent = this.dataStore.create(data)
    if (data.type === 'wall') this.newWalls.push(ent)
    return ent
  },

  updateData (data) {
    const ent = data.ent
    ent.update(data.data, data.options || {})
    if (ent.type === 'wall') addToColl(this.updateWalls, ent)
  },

  updateTarget (target) {
    if (target.ent.type === 'wall') this.updateRefs(target)
    this.updateData(target)
  },

  updateRefs (wall) {
    const areas = this.dataStore.areas.filter(area => area.attrs.walls.includes(wall.ent.uid))
    addToColl(this.deleteAreas, areas)
  },

  getIntersectWalls (wall) {
    // 查找相交的墙体-排除已经相连的(中线交点处存在joint)
    const polyLine1 = new PolyLine(wall.points())
    let polyLine2, intersects
    // 1.获取所有相关的墙体
    const walls = []
    addToColl(walls, this.existWalls)
    addToColl(walls, this.newWalls) /* this.existWalls.concat(this.newWalls) */
    let relationships = walls.filter(item => {
      // 2.移除已经存在关系的墙体
      if (item.uid === wall.uid || isConnext2Walls(wall, item)) return false
      polyLine2 = new PolyLine(item.points())
      intersects = PolyLine.intersect(polyLine1, polyLine2)
      return intersects.length
    })

    /* 中心交点在当前墙体的joint处 */
    const line1 = new Line(wall.start(), wall.end())
    let line2, intersect, type
    relationships = compact(relationships.map(item => {
      line2 = new Line(item.start(), item.end())
      intersect = Line.intersect(line1, line2)
      intersect = getIntersect([wall.start(), wall.end()], [item.start(), item.end()])
      if (!intersect) {
        // 没有交点，交在当前墙体的端点处
        intersect = {
          point: wall.points()[0],
          p1: Point.equal(wall.start(), item.start()) || Point.equal(wall.start(), item.end()) ? 0 : 1,
          p2: Point.equal(item.start(), wall.start()) || Point.equal(item.start(), wall.end()) ? 0 : 1
        }
      }

      if (intersect.p1 === 0 || intersect.p1 === 1) type = 0
      else if (intersect.p2 === 0 || intersect.p2 === 1) type = 1
      else if (intersect.p1 > 0 && intersect.p1 < 1 && intersect.p2 > 0 && intersect.p2 < 1)type = 2
      else {
        // need fix-- 当中心相交在延长线上时，要先处理下：把中心点放到交点处
        // 改变type为0或者1
        /* if (intersect.p1 < 0 || intersect.p1 > 1) {
          type = 0
        } else if (intersect.p2 < 0 || intersect.p2 > 1) {
          type = 1
        } */
        return null
      }
      return {
        ent: item,
        intersect,
        type
      }
    }))
    // realShips 按照p1排序
    return sortBy(relationships, item => item.intersect.p1)
  },

  wallsHandler (data) {
    const walls = data.filter(item => item.ent.type === 'wall' && item.isOrigin).map(item => item.ent)
    let relations
    walls.forEach(wall => {
      relations = this.getIntersectWalls(wall)
      console.log('引起变化的墙体：', relations)
      // 正常程序处理在wall上的墙体
      relations.reverse()
      this.relationsHandler(relations, wall)
    })
    // 处理关系墙体
    // attach Wall
    // join Wall
    // cross Wall
  },

  relationsHandler (relations, wall) {
    relations.forEach(item => {
      if (item.type === 0) {
        this.attachWallHandler(wall, item.ent, item.intersect.point)
      } else if (item.type === 1) {
        this.attachWallHandler(item.ent, wall, item.intersect.point)
      } else {
        this.crossHandler(wall, item.ent, item.intersect.point)
      }
    }, this)

    /* const others = relations.filter(item => item.type !== 0)
    others.forEach(item => {
      if (item.type === 1) {
        this.attachWallHandler(item, wall)
      }
    }) */
  },

  breakWall (wall, intersect) {
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
    const p0 = Line.nearestPoint(pts[1], pts[2], intersect)
    const p1 = Line.nearestPoint(pts[4], pts[5], intersect)
    const pts1 = cloneDeep(pts)
    const pts2 = cloneDeep(pts)
    pts1[2] = pts2[1] = p0
    pts1[3] = pts2[0] = intersect
    pts1[4] = pts2[5] = p1
    this.updateData({
      ent: wall,
      data: {
        points: pts1
      },
      options: {
        silent: true
      }
    })
    const wall2 = this.createEnt({
      type: 'wall',
      data: {
        points: pts2,
        weight: wall.weight()
      }
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

  crossHandler (wall1, wall2, intersect) {
    const walls1 = this.breakWall(wall1, intersect)
    const walls2 = this.breakWall(wall2, intersect)
    const joint = this.createEnt({
      type: 'joint',
      data: {
        position: intersect
      }
    })
    walls1.forEach(item => {
      item.addJoint(joint.uid)
      joint.addWall(item.uid)
    })
    walls2.forEach(item => {
      item.addJoint(joint.uid)
      joint.addWall(item.uid)
    })
    this.updateWallsBaseJoint(joint)
  },

  /* break wall2 */
  /* no new joint */
  /* 围绕joint更新 */
  attachWallHandler (wall1, wall2, intersect) {
    // 1.break wall2 base on wall2Info.intersect
    const walls = this.breakWall(wall2, intersect) // 拆分wall2
    let joint = wall1.getJointOnPos(intersect) // 获取当前位置的joint
    if (!joint || joint._isDestroyed) { // 没有joint，新建
      joint = this.createEnt({
        type: 'joint',
        data: {
          position: intersect
        }
      })
      joint.addWall(wall1.uid)
      wall1.addJoint(joint.uid)
    }
    walls.forEach(wall => { // 更新关系
      wall.addJoint(joint.uid)
      joint.addWall(wall.uid)
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
      this.updateData({
        ent: item.ent,
        data: {
          points: item.isChange ? changeStart(item.points) : item.points
        }
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

  updateOrigins (data) {
    data.forEach(item => {
      this.updateTarget(item)
    })
  },

  areaHandler (updates) {
    this.deleteAreas.forEach(area => area.destroy())
    const areaHandler = new AreaHandler({
      attrs: this.attrs
    })
    areaHandler.run(updates)
  },

  run (data) {
    this.updateOrigins(data)
    this.wallsHandler(data)
    let updates = []
    addToColl(updates, this.newWalls)
    addToColl(updates, this.updateWalls)
    updates = updates.map(item => this.dataStore.get(item.uid))
    this.areaHandler(updates)
  }
})

export default UpdateHandler
