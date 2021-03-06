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

  radius () {
    return 40
  },

  walls () {
    return this.attrs.walls.map(this.getRefEnt)
  },

  addWall (wallId) {
    if (!this.attrs.walls) this.attrs.walls = []
    if (this.attrs.walls.includes(wallId)) return this
    this.attrs.walls.push(wallId)
    this.onChange()
    return this
  },

  remWall (wallId) {
    const index = this.attrs.walls.indexOf(wallId)
    if (index < 0) return this
    this.attrs.walls.splice(index, 1)
    this.onChange()
    return this
  },

  toJSON () {
    // save data
    const json = {}

    return json
  }
})

Joint.type = 'joint'

export default Joint
