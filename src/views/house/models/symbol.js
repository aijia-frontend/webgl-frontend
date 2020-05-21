import Model from './model'

const Symbol = Model.extend({
  getWall () {
    let wall = null
    if (this.attrs.wall) wall = this.getRefEnt(this.attrs.wall)
    return wall
  },
  addWall (item) {
    this.attrs.wall = item

    return this
  },
  remWall () {
    this.attrs.wall = null

    return this
  }
})

export default Symbol
