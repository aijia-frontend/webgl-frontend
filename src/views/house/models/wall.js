import Model from './model'
import CST from '@/common/cst/index'
import _cloneDeep from 'lodash/cloneDeep'

const getPointsStr = pts => {
  return pts.map(pt => pt.x + ' ' + pt.y).join(' ')
}

const Wall = Model.extend({
  initialize () {
    this.type = 'wall'
    this.isActive = false
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

  originPoints () {
    return [this.attrs.points[0], this.attrs.points[3]]
  },

  pointsStr () {
    const points = this.attrs.points.map(pt => CST.toPhysical(pt, { tag: 'point', origin: this.origin }))
    return getPointsStr(points)
  },

  toJSON () {
    // save data
    const json = {}

    return json
  }
})

Wall.type = 'wall'

export default Wall
