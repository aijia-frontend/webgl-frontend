import BaseHandler from './baseHandler'
import _findIndex from 'lodash/findIndex'
import { Point, Line } from '@/common/geometry'
// import DestroyWallHandler from './destroyWallHandler'

const DestroyHandler = BaseHandler.extend({
  initialize () {
    this.destroyEnts = []
    this.refJoints = []
    this.refAreas = []
    BaseHandler.prototype.initialize.apply(this, arguments)
  },

  addToColl (coll, uid) {
    if (Array.isArray(uid)) {
      uid.forEach(item => this.addToColl(coll, item))
    } else {
      const index = coll.indexOf(uid)
      if (index < 0) coll.push(uid)
    }
  },

  destroy (data) {
    data.forEach(item => {
      switch (item.type) {
        case 'wall': {
          this.destroyWall(item)
          break
        }
        case 'joint': {
          this.destroyJoint(item)
          break
        }
        case 'area': {
          this.destroyArea(item)
          break
        }
        default: {
          this.destroyEnt(item)
        }
      }
    })

    this.jointHandler()
    this.areaHandler()
  },

  destroyEnt (ent) {
    ent.destroy({ silent: true })
    this.destroyEnts.push(ent)
  },

  destroyWall (wall) {
    if (wall.isDestroy()) return
    if (wall.attrs.joints && wall.attrs.joints.length) this.addToColl(this.refJoints, wall.attrs.joints)
    this.destroyEnt(wall)
    const areas = this.dataStore.areas.filter(item => item.type === 'area' && !item.isDestroy() && item.attrs.walls.includes(wall.uid)).map(item => item.uid)
    this.addToColl(this.refAreas, areas)
  },

  destroyJoint (joint) {
    this.destroyEnt(joint)

    const walls = joint.walls()
    // const joints = []
    walls.forEach(wall => {
      // joints.push(...wall.attrs.joints || [])
      this.destroyWall(wall)
    }, this)
    // this.addToColl(this.refJoints, joints.filter(item => item !== joint.uid))
  },

  destroyArea (area) {
    this.destroyEnt(area)

    // 删除只存在两堵墙的节点
    const joints = area.joints()
    joints.forEach(joint => {
      if (joint.attrs.walls.length === 2) this.destroyJoint(joint)
    }, this)
  },

  jointHandler () {
    this.refJoints.forEach(item => {
      const joint = this.dataStore.get(item)
      if (joint.isDestroy()) return
      const walls = joint.walls().filter(item => !item.isDestroy())
      if (walls.length < 2) {
        this.destroyEnt(joint)
      } else {
        joint.attrs.walls = []
        walls.forEach(wall => joint.addWall(wall.uid))
      }
      if (walls.length) this.updateWall(walls, joint)
    })
  },

  areaHandler () {
    if (this.refAreas.length === 1) { // destroy || update
      const area = this.dataStore.get(this.refAreas[0])
      // 如果区域不能闭合 则删除
      // if (area.isClosed) // update else destory
      this.destroyEnt(area)
    } else { // merge

    }
  },

  updateWall (walls, joint) {
    const pos = joint.position()
    if (walls.length === 1) {
      // 按照中线恢复
      // 更新位置
      const wall = walls[0]
      const points = wall.points()
      const ptIndex = _findIndex(points, pt => Point.equal(pt, pos))
      if (ptIndex < 0) throw new Error('must be there. wall:', wall, 'joint:', joint)
      const pt = points[ptIndex]
      const l1 = new Line(points[1], points[2])
      const l2 = new Line(points[5], points[4])
      const p1 = l1.nearestPoint(pt, { extend: true })
      const p2 = l2.nearestPoint(pt, { extend: true })
      if (ptIndex === 0) { // 1 // 5
        points[1] = p1
        points[5] = p2
      } else { // 2 // 4
        points[2] = p1
        points[4] = p2
      }
      wall.remJoint(joint.uid)
      wall.update({ points })
    } else {
      // 处理多面墙的情况
      const destroyWall = this.destroyEnts.find((e) => e.type === 'wall') || {}
      const destroyWallPoints = destroyWall.attrs.points
      const destoryWallJointIndex = destroyWallPoints.findIndex((p) => Point.equal(p, pos))
      if (destoryWallJointIndex < 0) {
        console.warn('can not find joint of destory wall')
        return false
      }

      const destoryWallOppositeIndex = (destoryWallJointIndex + 3) % 6
      const dx0 = destroyWallPoints[destoryWallOppositeIndex].x - pos.x
      const dy0 = destroyWallPoints[destoryWallOppositeIndex].y - pos.y

      // 找出需要补的两堵墙
      let nearestWall1 = { angle: 360 }
      let nearestWall2 = { angle: 0 }
      for (const wall of walls) {
        const wallPoints = wall.attrs.points
        // 每堵墙连接点索引
        const wallJointIndex = wallPoints.findIndex((p) => Point.equal(p, pos))
        const wallOppositeIndex = (wallJointIndex + 3) % 6
        const dx = wallPoints[wallOppositeIndex].x - pos.x
        const dy = wallPoints[wallOppositeIndex].y - pos.y
        const angle = this.getAngle({
          x: dx, y: dy
        }, {
          x: dx0, y: dy0
        })
        if (angle < nearestWall1.angle) {
          nearestWall1 = { angle, wall, jointIndex: wallJointIndex }
        }

        if (angle > nearestWall2.angle) {
          nearestWall2 = { angle, wall, jointIndex: wallJointIndex }
        }
      }
      this.patchWall(nearestWall1.wall, nearestWall1.jointIndex)
      this.patchWall(nearestWall2.wall, nearestWall2.jointIndex)
    }
  },

  getAngle ({ x: x1, y: y1 }, { x: x2, y: y2 }) {
    const dot = x1 * x2 + y1 * y2
    const det = x1 * y2 - y1 * x2
    const angle = Math.atan2(det, dot) / Math.PI * 180
    return Math.round(angle + 360) % 360
  },

  patchWall (wall, wallPatchPointIndex) {
    const wallPoints = wall.attrs.points
    const wallL1 = new Line(wallPoints[1], wallPoints[2])
    const wallL2 = new Line(wallPoints[5], wallPoints[4])
    const wallP1 = wallL1.nearestPoint(wallPoints[wallPatchPointIndex], { extend: true })
    const wallP2 = wallL2.nearestPoint(wallPoints[wallPatchPointIndex], { extend: true })
    if (wallPatchPointIndex === 0) {
      wallPoints[1] = wallP1
      wallPoints[5] = wallP2
    } else {
      wallPoints[2] = wallP1
      wallPoints[4] = wallP2
    }

    wall.update({ wallPoints })
  },

  run (data) {
    this.destroy(data)
    this.destroyEnts.forEach(item => item.destroy())
    // this.dataStore.destroy(this.destroyEnts)
  }
})

export default DestroyHandler
