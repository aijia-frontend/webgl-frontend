import Model from './model'
import CST from '@/common/cst/main'
import { getPointsStr } from '@/common/util/pointUtil'
import _cloneDeep from 'lodash/cloneDeep'

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

  joints () {
    return (this.attrs.joints || []).map(this.getRefEnt)
  },

  addJoint (joint) {
    if (!this.attrs.joints) this.attrs.joints = []
    this.attrs.joints.push(joint)
    this.onChange()
    return this
  },

  remJoint (joint) {
    const index = this.attrs.joints.indexOf(joint)
    this.attrs.joints.splice(index, 1)
    this.onChange()
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
