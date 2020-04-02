// import { findIndex as _findIndex } from 'lodash'
import Vue from 'vue'
import Factory from './factory'
import _isObject from 'lodash/isObject'
import _findIndex from 'lodash/findIndex'
import _cloneDeep from 'lodash/cloneDeep'

const DataStore = new Vue({
  data: {
    frame: { // 视口 100(m) * 100(m)
      width: 100,
      height: 100
    },
    origin: null,
    activeCmd: null,
    nodes: [],
    walls: []
  },

  watch: {
  },

  created () {
  },

  methods: {
    newEntity (data) {},
    getWalls () {
      return this.nodes.filter(item => item.type === 'wall')
    },
    update (data) {
      if (Array.isArray(data)) {
        data.forEach(item => this.update(item))
      } else if (_isObject(data)) {
        const index = _findIndex(this.walls, (wall) => wall.uid === data.uid)
        if (index < 0) {
          console.warn('can not find this wall. uid: ', data.uid)
          return
        }
        const wall = _cloneDeep(this.walls[index])
        delete data.uid
        wall.update(data)
        this.$set(this.walls, index, wall)
      }
    },
    destroy (data) {
      //
    },
    create (data) {
      if (Array.isArray(data)) {
        data.forEach(item => this.create(item))
      }
      if (_isObject(data)) {
        // this.newEntity(data)
        const model = Factory.create(data)
        this[model.type + 's'].push(model)
        this.nodes.push(model)
        return model
      }
    }
  }
})

export default DataStore
