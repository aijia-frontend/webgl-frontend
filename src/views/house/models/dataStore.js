// import { findIndex as _findIndex } from 'lodash'
import Vue from 'vue'
import Factory from './factory'
import _isObject from 'lodash/isObject'
import _findIndex from 'lodash/findIndex'
import _cloneDeep from 'lodash/cloneDeep'
import { isInPolygon } from '@/common/util/gTools'
import { Point } from '@/common/geometry'

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
    walls: [],
    joints: [],
    areas: []
  },

  watch: {
  },

  created () {
    this.$bus.$on('modelChange', this.onChange)
    this.$bus.$on('modelDestroy', this.onDestroy)
  },

  methods: {
    flash (ent, time = 1000) {
      const refs = []
      switch (ent.type) {
        case 'wall':
          refs.push(...ent.joints())
          break
        case 'joint':
          refs.push(...ent.walls())
          break
        case 'area':
          refs.push(...ent.walls())
          break
        default:
          break
      }
      ent.update({ isActive: true })
      refs.forEach(item => item.update({ isActive: true }))
      setTimeout(() => {
        ent.update({ isActive: false })
        refs.forEach(item => item.update({ isActive: false }))
      }, time)
    },
    test (type, auto = true, index = 0) {
      const ents = this[type + 's']
      if (!auto) {
        if (index < ents.length) {
          this.flash(ents[index])
          index++
          setTimeout(() => this.test(type, auto, index), 1200)
        }
      } else {
        const errors = ents.filter(ent => {
          let has
          switch (ent.type) {
            case 'wall':
              const points = ent.points()
              const joints = ent.joints()
              has = joints.find(joint => {
                const position = joint.position()
                return !Point.equal(position, points[0]) && !Point.equal(position, points[3])
              })
              break
            case 'joint':
              const position = ent.position()
              const walls = ent.walls()
              has = walls.find(wall => {
                const points = wall.points()
                return !Point.equal(position, points[0]) && !Point.equal(position, points[3])
              })
              break
            case 'area':
              // 检测各墙体是否都是首尾相连
              break
            default:
              break
          }
          return !!has
        })
        console.log('错误关系：', errors)
        if (errors.length === 0) console.log('//===>   未发现不合法的关系   <===//')
        else errors.forEach(item => this.flash(item, 50000))
      }
    },

    get (uid) {
      return this.ents.find(item => item.uid === uid)
    },
    addSelected (ent) { // ent:{uid，data: {isActived}}: //just one allowed
      if (Array.isArray(ent)) {
        ent.forEach(item => this.addSelected(item))
      } else if (_isObject(ent)) {
        if (this.selectedEnts.length) this.remSelected(this.selectedEnts)
        /* const index = _findIndex(this.selectedEnts, item => item.uid === ent.uid)
        if (index >= 0) return */
        this.selectedEnts.push(ent)
        ent.update({ isActive: true })
      }
    },

    remSelected (ent) {
      if (Array.isArray(ent)) {
        ent = ent.map(item => {
          return {
            type: item.type,
            uid: item.uid
          }
        })
        ent.forEach(item => this.remSelected(item))
      } else if (_isObject(ent)) {
        const index = _findIndex(this.selectedEnts, item => item.uid === ent.uid)
        if (index < 0) return
        this.selectedEnts.splice(index, 1)
        const _ent = this.get(ent.uid)
        if (!_ent) {
          console.warn('can not find ent with uid: ', ent.uid)
          return
        }
        _ent.update({ isActive: false })
      }
    },

    destroy (ent) {
      if (Array.isArray(ent)) {
        ent = ent.map(item => {
          return {
            type: item.type,
            uid: item.uid
          }
        })
        this.remSelected(ent)
        ent.forEach(item => this.destroy(item))
      } else if (_isObject(ent)) {
        const type = ent.type + 's'
        const index = _findIndex(this[type], (item) => item.uid === ent.uid)
        if (index < 0) {
          console.warn('can not find this ent. uid: ', ent.uid)
          return
        }
        this[type].splice(index, 1)
        const index2 = _findIndex(this.ents, item => item.uid === ent.uid)
        if (index2 > -1) this.ents.splice(index2, 1)
      }
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
        if (type === 'areas') { // 区域覆盖判断
          this.areaAdd(this[type], model)
        } else {
          this[type].push(model)
        }
        this.ents.push(model)
        return model
      }
    },

    areaAdd (coll, ent) {
      // 倒叙遍历所有区域，若新区域遮挡其他区域，则该区域向下降一级，直到不存在遮挡
      // 判断遮挡：有区域的点在该区域内 视为遮挡
      const points = ent.points()
      let index = coll.length
      const collPoints = coll.map(item => item.points())
      collPoints.forEach(pts => {
        if (pts.find(pt => isInPolygon(pt, points) !== 'out')) index--
      })
      coll.splice(index, 0, ent)
    },

    onChange (model) {
      const type = model.type + 's'
      const index = _findIndex(this[type], (ent) => ent.uid === model.uid)
      if (index < 0) {
        console.warn('can not find this ent. uid: ', model.uid)
        return
      }
      const ent = _cloneDeep(model)
      ent.isUpdate = true
      this.$set(this[type], index, ent)
      this[type][index].isUpdate = false

      const index2 = _findIndex(this.ents, item => item.uid === model.uid)
      if (index2 > -1) this.ents[index2] = model
    },

    onDestroy (model) {
      const type = model.type + 's'
      const index = _findIndex(this[type], (item) => item.uid === model.uid)
      if (index < 0) {
        console.warn('can not find this ent. uid: ', model.uid)
        return
      }
      this[type].splice(index, 1)
      const index2 = _findIndex(this.ents, item => item.uid === model.uid)
      if (index2 > -1) this.ents.splice(index2, 1)
    }
  }
})

export default DataStore
