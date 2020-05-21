import BaseHandler from './baseHandler'
import _findIndex from 'lodash/findIndex'
import { Point, Line } from '@/common/geometry'
import UpdateHandler from './updateHandler'
// import DestroyWallHandler from './destroyWallHandler'

const DestroyHandler = BaseHandler.extend({
  initialize () {
    this.destroyEnts = []
    this.refJoints = []
    this.refAreas = []
    this.walls = []
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
    // this.areaHandler()
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
      this.walls = this.walls.concat(walls)
      if (walls.length < 2) {
        this.destroyEnt(joint)
        walls.forEach((w) => {
          w.remJoint(joint.uid)
        })
      } else {
        joint.attrs.walls = []
        walls.forEach(wall => joint.addWall(wall.uid))
      }
      if (walls.length) this.updateWall(walls, joint)
    })
  },

  areaHandler () {
    const walls = []
    for (const wall of this.walls) {
      walls.push({
        data: {
          points: wall.attrs.points
        },
        ent: wall
      })
    }
    const joints = []
    for (const refJoint of this.refJoints) {
      const joint = this.dataStore.get(refJoint)
      if (joint) {
        joints.push({
          data: {
            position: joint.attrs.position
          },
          ent: joint
        })
      }
    }
    const updateHandler = new UpdateHandler(this.attrs)
    updateHandler.run(walls.concat(joints))
  },

  updateWall (walls, joint) {
    if (walls.length === 1) {
      // 按照中线恢复
      // 更新位置
      const pos = joint.position()
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
      const updateHandler = new UpdateHandler(this.attrs)
      updateHandler.updateWallsBaseJoint(joint)
    }
  },

  run (data) {
    this.destroy(data)
    this.destroyEnts.forEach(item => item.destroy())
    this.areaHandler()
    // this.dataStore.destroy(this.destroyEnts)
  }
})

export default DestroyHandler
