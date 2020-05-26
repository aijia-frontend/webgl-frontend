import BaseHandler from './baseHandler'
import DataStore from '../models/dataStore'

const NewJointHandler = BaseHandler.extend({
  initialize (attrs) {
    BaseHandler.prototype.initialize.apply(this, arguments)
  },

  createJoint (data) {
    // data.walls = data.walls.map(item => DataStore.get(item.uid))
    const walls = data.walls.map(item => item.uid)
    const joint = DataStore.create({
      type: 'joint',
      data: {
        position: data.position,
        walls: walls
      }
    })

    this.updateWalls(data.walls, joint)
    return joint
  },

  updateWalls (walls, joint) {
    walls.forEach(wall => {
      wall.addJoint(joint.uid)
    })
  },

  run (data) {
    data.walls = data.walls || []
    return this.createJoint(data)
  }
})

export default NewJointHandler
