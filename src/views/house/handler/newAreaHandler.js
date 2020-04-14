import BaseHandler from './baseHandler'

const NewAreaHandler = BaseHandler.extend({
  initialize () {
    BaseHandler.prototype.initialize.apply(this, arguments)
  },

  create (chain) {
    const joints = chain.joints.map(item => item.uid)
    const walls = chain.walls.map(item => item.uid)
    this.dataStore.create({
      type: 'area',
      data: {
        joints,
        walls
      }
    })
  },

  run (chain) {
    this.create(chain)
  }
})

export default NewAreaHandler
