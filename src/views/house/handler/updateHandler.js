import BaseHandler from './baseHandler'

const UpdateHandler = BaseHandler.extend({
  initialize () {
    BaseHandler.prototype.initialize.apply(this, arguments)
  },

  updateData (data) {
    this.dataStore.update(data)
  },

  updateTarget (target) {
    if (target.ent.type === 'wall') this.updateRefs(target)
    this.updateData(target)
  },

  updateRefs (wall) {
    const areas = this.dataStore.areas.filter(area => area.attrs.walls.includes(wall.ent.uid))
    const update = areas.map(area => {
      return {
        ent: area,
        isChange: true
      }
    })
    this.dataStore.update(update)

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
