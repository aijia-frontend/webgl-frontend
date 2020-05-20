import JigCmd from '@/common/jigCmd'
import wallSegJig from './wallSegJig'
import CST from '@/common/cst/main'
import DataStore from '../models/dataStore'
import UpdateHandler from '../handler/updateHandler'
import _pick from 'lodash/pick'

const MoveWallSeg = JigCmd.extend({
  jigType: wallSegJig,

  initialize (attrs, options) {
    this.attrs = attrs
    JigCmd.prototype.initialize.apply(this, arguments)
  },

  onEnd (data) {
    const toLogical = (pt) => CST.toLogical(pt, {
      tag: 'point',
      origin: DataStore.origin
    })

    const updates = data.map(item => {
      return {
        ent: item.ent,
        isOrigin: item.isOrigin,
        data: _pick(item, ['position', 'points'])
      }
    })

    updates.forEach(item => {
      if (item.data.points) {
        item.data.points = item.data.points.map(toLogical)
      }
    })

    const handler = new UpdateHandler(this.attrs)
    handler.run(updates)

    JigCmd.prototype.onEnd.apply(this, arguments)
  }
})

export default MoveWallSeg
