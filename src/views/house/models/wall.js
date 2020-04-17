import Model from './model'
import CST from '@/common/cst/main'
import _cloneDeep from 'lodash/cloneDeep'

const getPointsStr = pts => {
  return pts.map(pt => pt.x + ' ' + pt.y).join(' ')
}

const Wall = Model.extend({
  initialize () {
    this.type = 'wall'
    Model.prototype.initialize.apply(this, arguments)
  },

  start () {
    return this.attrs.points[0]
  },

  end () {
    return this.attrs.points[3]
  },

  points () {
    return _cloneDeep(this.attrs.points)
  },

  weight () {
    return this.attrs.weight
  },

  originPoints () {
    return [this.attrs.points[0], this.attrs.points[3]]
  },

  pointsStr () {
    const points = this.attrs.points.map(pt => CST.toPhysical(pt, { tag: 'point', origin: this.origin }))
    return getPointsStr(points)
  },

  destroy () {
    Model.prototype.destroy.apply(this, arguments)
    this.updateJoint()
  },

  updateJoint () {
    if (this.attrs.joints && this.attrs.joints.length) {
      this.joints().forEach(joint => joint.remWall(this.uid))
    }
  },

  joints () {
    return (this.attrs.joints || []).map(this.getRefEnt)
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

Wall.type = 'wall'

export default Wall
