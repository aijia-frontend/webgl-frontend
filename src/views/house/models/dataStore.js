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
    drawing: null,
    selectedEnts: [],
    ents: [],
    walls: []
  },

  watch: {
  },

  created () {
  },

  methods: {
    addSelected (ent) { // ent:{uid，data: {isActived}}
      if (Array.isArray(ent)) {
        ent.forEach(item => this.addSelected(item))
      } else if (_isObject(ent)) {
        const index = _findIndex(this.selectedEnts, item => item.uid === ent.uid)
        if (index >= 0) return
        this.selectedEnts.push(ent)
        this.update({
          ent,
          isActive: true
        })
      }
    },

    remSelected (ent) {
      if (Array.isArray(ent)) {
        ent.forEach(item => this.remSelected(item))
      } else if (_isObject(ent)) {
        const index = _findIndex(this.selectedEnts, item => item.uid === ent.uid)
        if (index < 0) return
        this.selectedEnts.splice(index, 1)
        this.update({
          ent,
          isActive: false
        })
      }
    },

    update (data) {
      if (Array.isArray(data)) {
        data.forEach(item => this.update(item))
      } else if (_isObject(data)) {
        const type = data.ent.type + 's'
        const index = _findIndex(this[type], (ent) => ent.uid === data.ent.uid)
        if (index < 0) {
          console.warn('can not find this ent. uid: ', data.uid)
          return
        }
        const ent = _cloneDeep(this[type][index])
        delete data.ent
        ent.update(data)
        this.$set(this[type], index, ent)
        this[type][index].update(data)
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
        const type = model.type + 's'
        if (!this[type]) this[type] = []
        this[type].push(model)
        this.ents.push(model)
        return model
      }
    }
  }
})

export default DataStore
