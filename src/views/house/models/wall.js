import Model from './model'
import CST from '@/common/cst/index'

const getPointsStr = pts => {
  return pts.map(pt => pt.x + ' ' + pt.y).join(' ')
}

const Wall = Model.extend({
  initialize () {
    this.type = 'wall'
    Model.prototype.initialize.apply(this, arguments)
  },

  points () {
    return this.attrs.points
  },

  toJSON () {
    const json = {
      tag: 'g',
      attrs: {
        uid: this.uid,
        class: 'wall'
      },
      nodes: []
    }

    json.nodes.push(this.buildContent())

    return json
  },

  buildContent () {
    const points = this.attrs.points.map(pt => CST.toPhysical(pt, { tag: 'point', origin: this.origin }))

    return {
      tag: 'polygon',
      attrs: {
        points: getPointsStr(points)
      }
    }
  },

  buildGrips () {}
})

Wall.type = 'wall'

export default Wall
