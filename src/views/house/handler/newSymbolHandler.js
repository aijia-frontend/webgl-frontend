import BaseHandler from './baseHandler'
import _omit from 'lodash/omit'

const NewSymbolHandler = BaseHandler.extend({
  initialize (attrs) {
    BaseHandler.prototype.initialize.apply(this, arguments)
  },

  newNormalType (data) {
    const wall = data.wall
    const type = data.type
    data = _omit(data, ['wall', 'type'])
    const ent = this.dataStore.create({
      type,
      data
    })
    if (wall) {
      ent.addWall(wall.uid)
    }
    return ent
  },

  newSymbol (data) {
    switch (data.type) {
      case 'window':
        this.newNormalType(data)
        break
      default:
        break
    }
  },

  run (data) {
    this.newSymbol(data)
  }
})

export default NewSymbolHandler
