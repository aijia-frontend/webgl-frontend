import JigCmd from '@/common/jigCmd'
import CST from '@/common/cst/main'
import DataStore from '../models/dataStore'
import _pick from 'lodash/pick'
import wallJig from './wallJig'
import NewWallHandler from '../handler/newWallHandler'
import Vue from 'vue'
const vue = new Vue()

const DrawWall = JigCmd.extend({
  jigType: wallJig,

  initialize (attrs, options) {
    this.attrs = attrs
    JigCmd.prototype.initialize.apply(this, arguments)
  },

  onEnd (data) {
    data.points = data.points.map(pt => CST.toLogical(pt, { tag: 'point', origin: DataStore.origin }))

    const handler = new NewWallHandler(this.attrs)
    handler.run(_pick(data, ['points', 'weight']))
    /* this.attrs.drawing.addContainer({
      type: 'wall',
      data: _pick(data, ['points'])
    }) */
    JigCmd.prototype.onEnd.apply(this, arguments)

    vue.$bus.$emit('drawWall', Object.assign({}, this.attrs, { startPos: data.endPos }))
  }
})

export default DrawWall
