import BaseHandler from './baseHandler'

const UpdateHandler = BaseHandler.extend({
  initialize () {
    BaseHandler.prototype.initialize.apply(this, arguments)
  },

  updateRefs (refs) {
    this.dataStore.update(refs)
  },

  updateTarget (target) {
    if (target.ent.type === 'wall') this.updateWall(target)
    this.updateRefs(target)
  },

  updateWall (wall) {
    // attach Wall
    // join Wall
    // cross Wall
  },

  run (data) {
    this.updateRefs(data.refs)
    this.updateTarget(data.wall)
  }
})

export default UpdateHandler
