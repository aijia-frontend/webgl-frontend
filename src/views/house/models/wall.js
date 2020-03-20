import Model from './model'

const Wall = Model.extend({
  type: 'wall',
  initialize () {
    this.$emit('create', this)
  },
  destroy () {
    this.$emit('destroy', this)
  },
  update () {
    this.$emit('update', this)
  }
})

export default Wall
