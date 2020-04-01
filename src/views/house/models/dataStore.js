// import { findIndex as _findIndex } from 'lodash'
import Vue from 'vue'
import Factory from './factory'
import _isObject from 'lodash/isObject'

const DataStore = new Vue({
  data: {
    frame: { // 视口 100(m) * 100(m)
      width: 100,
      height: 100
    },
    origin: null,
    activeCmd: null,
    nodes: []
  },

  watch: {
  },

  methods: {
    newEntity (data) {},
    getWalls () {
      return this.nodes.filter(item => item.type === 'wall')
    },
    create (data) {
      if (Array.isArray(data)) {
        data.forEach(item => this.create(item))
      }
      if (_isObject(data)) {
        // this.newEntity(data)
        const model = Factory.create(data)
        this.nodes.push(model)
        return model
      }
    }
  }
})

export default DataStore
