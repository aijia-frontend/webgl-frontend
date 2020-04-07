import Model from './model'
import _cloneDeep from 'lodash/cloneDeep'

const Joint = Model.extend({
  initialize () {
    this.type = 'joint'
    Model.prototype.initialize.apply(this, arguments)
  },

  position () {
    return _cloneDeep(this.attrs.position)
  },

  walls () {
    return this.attrs.walls.map(this.getRefEnt)
  },

  remWall (wallId) {
    const index = this.attrs.walls.indexOf(wallId)
    this.attrs.walls.splice(index, 1)
    return this
  },

  /* destroy () {
    Model.prototype.destroy.apply(this, arguments)
    const walls = this.walls()
    walls.forEach(item )
  }, */

  toJSON () {
    // save data
    const json = {}

    return json
  }
})

Joint.type = 'joint'

export default Joint
