import BaseHandler from './baseHandler'

const UpdateHandler = BaseHandler.extend({
  initialize () {
    BaseHandler.prototype.initialize.apply(this, arguments)
  },

  updateData (data) {
    const ent = data.ent
    delete data.ent
    ent.update(data)
  },

  updateTarget (target) {
    if (target.ent.type === 'wall') this.updateRefs(target)
    this.updateData(target)
  },

  updateRefs (wall) {
    const areas = this.dataStore.areas.filter(area => area.attrs.walls.includes(wall.ent.uid))
    areas.forEach(area => area.update({}))

    // attach Wall
    // join Wall
    // cross Wall
  },

  run (data) {
    data.forEach(item => {
      this.updateTarget(item)
    })
  }
})

export default UpdateHandler
