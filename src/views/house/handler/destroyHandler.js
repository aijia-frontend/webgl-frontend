import BaseHandler from './baseHandler'
import _findIndex from 'lodash/findIndex'
import { Point, Line } from '@/common/geometry'
// import DestroyWallHandler from './destroyWallHandler'

const DestroyHandler = BaseHandler.extend({
  initialize () {
    this.destroyEnts = []
    this.updateEnts = []
    this.refJoints = []
    BaseHandler.prototype.initialize.apply(this, arguments)
  },

  refJointsPush (uid) {
    if (Array.isArray(uid)) {
      uid.forEach(item => this.refJointsPush(item))
    } else {
      const index = this.refJoints.indexOf(uid)
      if (index < 0) this.refJoints.push(uid)
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
        default: {
          this.destroyEnt(item)
        }
      }
    })

    this.jointHandler()
  },

  destroyEnt (ent) {
    ent.destroy()
    this.destroyEnts.push(ent)
  },

  destroyWall (wall) {
    if (wall.attrs.joints && wall.attrs.joints.length) this.refJointsPush(wall.attrs.joints)
    this.destroyEnt(wall)
  },

  jointHandler () {
    this.refJoints.forEach(item => {
      const joint = this.dataStore.get(item)
      const walls = joint.walls()
      if (walls.length < 2) {
        this.destroyEnt(joint)
      }
      this.updateWall(walls, joint)
    })
  },

  destroyJoint (joint) {
    const walls = joint.walls()
    const joints = []
    walls.forEach(wall => {
      joints.push(...wall.attrs.joints || [])
      this.destroyEnt(wall)
    })
    this.destroyEnt(joint)
    this.refJointsPush(joints.filter(item => item !== joint.uid))
  },

  updateWall (walls, joint) {
    if (walls.length === 1) {
      // 按照中线恢复
      // 更新位置
      const wall = walls[0]
      const points = wall.points()
      const pos = joint.position()
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
      this.updateEnts.push({
        ent: wall,
        points
      })
    }
  },

  run (data) {
    this.destroy(data)

    this.dataStore.update(this.updateEnts)
    this.dataStore.destroy(this.destroyEnts)
  }
})

export default DestroyHandler
